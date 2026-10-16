WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    if (!(await protectPage())) {
      return;
    }
    const branch = await getCurrentBranch();
    if (!branch) {
      window.location.replace('./branches.html');
      return;
    }
    const hoursView=await WusoolServices.getSchedule('branches',branch.id);
    branch.hoursRevision=hoursView.hoursRevision;
    if (hoursView.hasSchedule) Object.assign(branch, hoursView.schedule);
    let pendingRequest = hoursView.pending;
    branch.pendingHoursRevision = pendingRequest?.revision;
    initializeWeeklyHours(pendingRequest ? { ...branch, ...pendingRequest.proposed } : branch);
    initializeSpecialHours(pendingRequest ? { ...branch, ...pendingRequest.proposed } : branch);
    initializeForm(branch);
    const status = document.createElement('p');
    status.className = 'alert alert-info';
    status.setAttribute('role', 'status');
    document.getElementById('workingHoursForm').prepend(status);
    const explain = (view) => {
      status.textContent = view.pending
        ? 'Pending Admin approval: these fields show your proposed hours. You can update this request; approved hours stay active until approval.'
        : 'Set branch hours in Jordan local time. Changes to an approved schedule require Admin approval.';
    };
    explain(hoursView);
    window.WusoolLive?.watch('branch-hours-status', async () => {
      const view = await WusoolServices.getSchedule('branches', branch.id);
      explain(view);
      // Do not overwrite edited inputs. A stale revision is rejected during Save.
      if (pendingRequest && !view.pending) {
        branch.hoursRevision = view.hoursRevision;
        branch.pendingHoursRevision = undefined;
        Object.assign(branch, view.schedule);
        document.getElementById('saveHoursDraftButton').disabled = false;
      }
      pendingRequest = view.pending;
    });
    initializeSidebar();
    initializeLogout();
    await loadOrganizationInformation(branch);
  });
  const weekDays = [
    {
      key: 'sunday',
      label: 'Sunday',
      defaultOpen: true,
    },
    {
      key: 'monday',
      label: 'Monday',
      defaultOpen: true,
    },
    {
      key: 'tuesday',
      label: 'Tuesday',
      defaultOpen: true,
    },
    {
      key: 'wednesday',
      label: 'Wednesday',
      defaultOpen: true,
    },
    {
      key: 'thursday',
      label: 'Thursday',
      defaultOpen: true,
    },
    {
      key: 'friday',
      label: 'Friday',
      defaultOpen: false,
    },
    {
      key: 'saturday',
      label: 'Saturday',
      defaultOpen: false,
    },
  ];
  let specialHours = [];
  const readStoredObject = async (key) => {
    try {
      const value = await WusoolServices.rawRead(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      console.error(error);
      return null;
    }
  };
  const protectPage = async () => {
    const organization = await readStoredObject('wusoolOrganization');
    const loggedIn = (await WusoolServices.rawRead('wusoolOrganizationLoggedIn')) === 'true';
    if (!organization || !loggedIn) {
      window.location.replace('./organization-login.html');
      return false;
    }
    const subscriptionStatus = (
      organization.subscriptionStatus ||
      (await WusoolServices.rawRead('wusoolSubscriptionStatus')) ||
      'inactive'
    ).toLowerCase();
    if (subscriptionStatus !== 'active') {
      window.location.replace('./subscription-plans.html');
      return false;
    }
    return true;
  };
  const getBranchId = () => {
    const parameters = new URLSearchParams(window.location.search);
    return parameters.get('id');
  };
  const getCurrentBranch = async () => {
    const branchId = getBranchId();
    const branches = (await readStoredObject('wusoolOrganizationBranches')) || [];
    return (
      branches.find((branch) => {
        return String(branch.id) === branchId;
      }) || (await readStoredObject('wusoolCurrentBranchDraft'))
    );
  };
  const getDefaultHours = () => {
    return weekDays.reduce((hours, day) => {
      hours[day.key] = {
        isOpen: day.defaultOpen,
        openTime: '09:00',
        closeTime: '16:00',
      };
      return hours;
    }, {});
  };
  const initializeWeeklyHours = (branch) => {
    const savedHours = branch.workingHours || getDefaultHours();
    const container = document.getElementById('weeklyHoursContainer');
    WusoolUI.html(container, '');
    weekDays.forEach((day) => {
      const dayHours = savedHours[day.key] || {
        isOpen: day.defaultOpen,
        openTime: '09:00',
        closeTime: '16:00',
      };
      container.appendChild(createDayRow(day, dayHours));
    });
    document.querySelectorAll('.day-toggle').forEach((toggle) => {
      WusoolUI.listen(toggle, 'change', () => {
        updateDayRowState(toggle.closest('.day-row'));
      });
    });
    WusoolUI.listen(document.getElementById('copyWeekdaysButton'), 'click', copySundayHours);
  };
  const createDayRow = (day, hours) => {
    const row = document.createElement('article');
    row.className = `day-row ${hours.isOpen ? '' : 'closed'}`;
    row.dataset.day = day.key;
    WusoolUI.html(
      row,
      `
        <div>
            <span class="day-name">
                ${day.label}
            </span>

            <span class="day-status d-block">
                ${hours.isOpen ? 'Open' : 'Closed'}
            </span>
        </div>

        <div class="form-check form-switch m-0">
            <input
                type="checkbox"
                class="form-check-input day-toggle"
                role="switch"
                aria-label="Toggle ${day.label}"
                ${hours.isOpen ? 'checked' : ''}
            >
        </div>

        <input
            type="time"
            class="form-control opening-time"
            value="${hours.openTime}"
            aria-label="${day.label} opening time"
            ${hours.isOpen ? '' : 'disabled'}
        >

        <span class="time-separator">
            to
        </span>

        <input
            type="time"
            class="form-control closing-time"
            value="${hours.closeTime}"
            aria-label="${day.label} closing time"
            ${hours.isOpen ? '' : 'disabled'}
        >
        <label>Break starts (optional)<input type="time" class="form-control break-start" value="${hours.periods?.length>1?hours.periods[0].closeTime:''}" ${hours.isOpen?'':'disabled'}></label>
        <label>Break ends<input type="time" class="form-control break-end" value="${hours.periods?.[1]?.openTime||''}" ${hours.isOpen?'':'disabled'}></label>
    `,
    );
    row.originalHours=JSON.parse(JSON.stringify(hours));
    return row;
  };
  const updateDayRowState = (row) => {
    const toggle = row.querySelector('.day-toggle');
    const status = row.querySelector('.day-status');
    const timeInputs = row.querySelectorAll('input[type="time"]');
    row.classList.toggle('closed', !toggle.checked);
    status.textContent = toggle.checked ? 'Open' : 'Closed';
    timeInputs.forEach((input) => {
      input.disabled = !toggle.checked;
    });
  };
  const copySundayHours = () => {
    const sundayRow = document.querySelector('[data-day="sunday"]');
    const sundayOpen = sundayRow.querySelector('.day-toggle').checked;
    const sundayOpenTime = sundayRow.querySelector('.opening-time').value;
    const sundayCloseTime = sundayRow.querySelector('.closing-time').value;
    ['monday', 'tuesday', 'wednesday', 'thursday'].forEach((day) => {
      const row = document.querySelector(`[data-day="${day}"]`);
      row.querySelector('.day-toggle').checked = sundayOpen;
      row.querySelector('.opening-time').value = sundayOpenTime;
      row.querySelector('.closing-time').value = sundayCloseTime;
      updateDayRowState(row);
    });
    showToast('Sunday hours copied to weekdays.');
  };
  const initializeSpecialHours = (branch) => {
    specialHours = Array.isArray(branch.specialHours) ? [...branch.specialHours] : [];
    const statusSelect = document.getElementById('specialStatus');
    WusoolUI.listen(statusSelect, 'change', updateSpecialHoursInputs);
    WusoolUI.listen(document.getElementById('addSpecialHoursButton'), 'click', addSpecialHours);
    renderSpecialHours();
  };
  const updateSpecialHoursInputs = () => {
    const isCustom = document.getElementById('specialStatus').value === 'custom';
    document.getElementById('specialOpenGroup').classList.toggle('d-none', !isCustom);
    document.getElementById('specialCloseGroup').classList.toggle('d-none', !isCustom);
  };
  const addSpecialHours = () => {
    const dateInput = document.getElementById('specialDate');
    const status = document.getElementById('specialStatus').value;
    const openTime = document.getElementById('specialOpenTime').value;
    const closeTime = document.getElementById('specialCloseTime').value;
    const errorElement = document.getElementById('specialHoursError');
    errorElement.classList.add('d-none');
    if (!dateInput.value) {
      showSpecialError('Select a special date.');
      return;
    }
    if (status === 'custom' && openTime >= closeTime) {
      showSpecialError('Closing time must be later than opening time.');
      return;
    }
    const existingIndex = specialHours.findIndex((item) => item.date === dateInput.value);
    const specialDate = {
      date: dateInput.value,
      status,
      openTime: status === 'custom' ? openTime : null,
      closeTime: status === 'custom' ? closeTime : null,
    };
    if (existingIndex >= 0) {
      specialHours[existingIndex] = specialDate;
    } else {
      specialHours.push(specialDate);
    }
    specialHours.sort((first, second) => {
      return first.date.localeCompare(second.date);
    });
    dateInput.value = '';
    renderSpecialHours();
  };
  const showSpecialError = (message) => {
    const errorElement = document.getElementById('specialHoursError');
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
  };
  const renderSpecialHours = () => {
    const list = document.getElementById('specialHoursList');
    const emptyState = document.getElementById('noSpecialHours');
    WusoolUI.html(list, '');
    specialHours.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'special-hours-item';
      const scheduleText =
        item.status === 'closed'
          ? 'Closed all day'
          : `${formatTime(item.openTime)} – ${formatTime(item.closeTime)}`;
      WusoolUI.html(
        article,
        `
            <div>
                <strong>
                    ${formatDate(item.date)}
                </strong>

                <small>
                    ${scheduleText}
                </small>
            </div>

            <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                aria-label="Remove special date"
                data-special-index="${index}"
            >
                <i class="bi bi-trash"></i>
            </button>
        `,
      );
      WusoolUI.listen(article.querySelector('button'), 'click', () => {
        specialHours.splice(index, 1);
        renderSpecialHours();
      });
      list.appendChild(article);
    });
    emptyState.classList.toggle('d-none', specialHours.length > 0);
  };
  const collectWeeklyHours = () => {
    const workingHours = {};
    document.querySelectorAll('.day-row').forEach((row) => {
      const day = row.dataset.day;
      workingHours[day] = {
        isOpen: row.querySelector('.day-toggle').checked,
        openTime: row.querySelector('.opening-time').value,
        closeTime: row.querySelector('.closing-time').value,
        ...(()=>{const from=row.querySelector('.break-start').value,to=row.querySelector('.break-end').value;
          const old=row.originalHours;if(old?.periods?.length>2&&from===old.periods[0].closeTime&&to===old.periods[1].openTime&&row.querySelector('.opening-time').value===old.openTime&&row.querySelector('.closing-time').value===old.closeTime)return {periods:old.periods};if(!from&&!to)return {};return {periods:[{openTime:row.querySelector('.opening-time').value,closeTime:from},{openTime:to,closeTime:row.querySelector('.closing-time').value}]};})(),
      };
    });
    return workingHours;
  };
  const validateWeeklyHours = (workingHours) => {
    const invalidDay = weekDays.find((day) => {
      const hours = workingHours[day.key];
      return (
        hours.isOpen && (!hours.openTime || !hours.closeTime || hours.openTime >= hours.closeTime)
      );
    });
    const message = document.getElementById('hoursValidationMessage');
    if (invalidDay) {
      message.textContent = `${invalidDay.label}: Closing time must be later than opening time.`;
      message.classList.remove('d-none');
      return false;
    }
    message.classList.add('d-none');
    return true;
  };
  const initializeForm = (branch) => {
    WusoolUI.listen(document.getElementById('workingHoursForm'), 'submit', async (event) => {
      event.preventDefault();
      if (!(await saveWorkingHours(branch))) {
        return;
      }
      window.WusoolLive?.saved();
      window.location.href = `./branch-accessibility.html?id=${encodeURIComponent(branch.id)}`;
    });
    WusoolUI.listen(document.getElementById('saveHoursDraftButton'), 'click', async () => {
      if (await saveWorkingHours(branch)) {
        showToast('Working hours saved. Any pending change still requires Admin approval.');
      }
    });
    document.getElementById('backButton').href =
      `./add-branch.html?id=${WusoolUI.escape(branch.id)}`;
  };
  const saveWorkingHours = async (branch) => {
    const workingHours = collectWeeklyHours();
    if (!validateWeeklyHours(workingHours)) {
      return false;
    }
    const outcome = await WusoolServices.saveHours(
      'branches',
      branch.id,
      { workingHours, specialHours, closedDates: branch.closedDates || [] },
      { expectedHoursRevision: Number(branch.hoursRevision) || 0, amendPending: true, expectedRequestRevision: branch.pendingHoursRevision },
    );
    if (outcome.status === 'pending') {
      WusoolUI.message(
        'Working hours change sent for Admin approval. Approved hours remain active.',
        'info',
      );
      window.WusoolLive?.saved();
      branch.pendingHoursRevision = outcome.request?.revision;
      Object.assign(branch, outcome.resource);
      await WusoolServices.rawWrite('wusoolCurrentBranchDraft', JSON.stringify(branch));
      return true;
    }
    Object.assign(branch, outcome.resource);
    await WusoolServices.rawWrite('wusoolCurrentBranchDraft', JSON.stringify(outcome.resource));
    return true;
  };
  const loadOrganizationInformation = async (branch) => {
    const organization = await readStoredObject('wusoolOrganization');
    const sidebarName = document.getElementById('sidebarOrganizationName');
    if (sidebarName) sidebarName.textContent =
      organization?.organizationName ||
      organization?.companyName ||
      organization?.name ||
      'Organization';
    document.getElementById('pageTitle').textContent =
      `${WusoolUI.escape(branch.name)} Working Hours`;
    document.getElementById('summaryBranchName').textContent = branch.name;
    document.getElementById('summaryBranchCity').textContent = branch.city || '—';
    document.getElementById('summaryBranchType').textContent = branch.type || '—';
    document.getElementById('summaryBranchStatus').textContent = ['approved','published'].includes(branch.status) ? 'Active' : branch.status || 'Draft';
  };
  const initializeSidebar = () => {
    const sidebar = document.getElementById('organizationSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeSidebar = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      document.body.classList.remove('overflow-hidden');
    };
    WusoolUI.listen(document.getElementById('openSidebarButton'), 'click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('show');
      document.body.classList.add('overflow-hidden');
    });
    WusoolUI.listen(document.getElementById('closeSidebarButton'), 'click', closeSidebar);
    WusoolUI.listen(overlay, 'click', closeSidebar);
  };
  const initializeLogout = () => {
    WusoolUI.listen(document.getElementById('logoutButton'), 'click', async () => {
      await WusoolServices.rawRemove('wusoolOrganization');
      await WusoolServices.rawRemove('wusoolOrganizationLoggedIn');
      window.location.replace('./organization-login.html');
    });
  };
  const formatDate = (dateValue) => {
    return new Intl.DateTimeFormat('en-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(`${dateValue}T00:00:00`));
  };
  const formatTime = (timeValue) => {
    const [hours, minutes] = timeValue.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));
    return new Intl.DateTimeFormat('en-JO', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };
  const showToast = (message) => {
    document.getElementById('toastMessage').textContent = message;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('workingHoursToast')).show();
  };
});
