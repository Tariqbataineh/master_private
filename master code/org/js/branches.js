WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    if (!(await protectBranchesPage())) {
      return;
    }
    await initializeBranches();
    initializeFilters();
    initializeSidebar();
    initializeAddBranchButtons();
    initializeDeleteBranch();
    initializeLogout();
    await loadOrganizationName();
    window.WusoolLive?.watch('organization-branches', initializeBranches);
  });
  const defaultBranches = [];
  let organizationBranches = [];
  let branchToDeleteId = null;
  let deleteBranchModal = null;
  const isArabic = () => document.documentElement.lang === 'ar';
  const text = (english, arabic) => (isArabic() ? arabic : english);
  const number = (value) => new Intl.NumberFormat(isArabic() ? 'ar-JO' : 'en-JO').format(value);
  const readStoredObject = async (key) => {
    try {
      const storedValue = await WusoolServices.rawRead(key);
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      console.error(`Unable to read ${key}:`, error);
      return null;
    }
  };
  const protectBranchesPage = async () => {
    const organization = await readStoredObject('wusoolOrganization');
    const loggedIn = (await WusoolServices.rawRead('wusoolOrganizationLoggedIn')) === 'true';
    if (!organization || !loggedIn) {
      window.location.replace('./organization-login.html');
      return false;
    }
    const approvalStatus = (
      organization.approvalStatus ||
      (await WusoolServices.rawRead('wusoolOrganizationStatus')) ||
      'pending'
    ).toLowerCase();
    if (approvalStatus !== 'approved') {
      window.location.replace('./registration-pending.html');
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
  const getActiveSubscription = async () => {
    const organization = await readStoredObject('wusoolOrganization');
    return (
      organization?.subscription ||
      (await readStoredObject('wusoolActiveSubscription')) ||
      null
    );
  };
  const getBranchLimit = async () => {
    const subscription = await getActiveSubscription();
    return WusoolServices.effectiveBranchCapacity(subscription);
  };
  const initializeBranches = async () => {
    const storedBranches = await readStoredObject('wusoolOrganizationBranches');
    if (Array.isArray(storedBranches)) {
      organizationBranches = storedBranches.map((branch) => ({
        ...branch,
        status:
          {
            active: 'approved',
            published: 'approved',
            pending: 'pending-review',
            'changes-requested': 'changes-required',
          }[String(branch.status).toLowerCase()] || String(branch.status).toLowerCase(),
      }));
    } else {
      const branchLimit = await getBranchLimit();
      organizationBranches = defaultBranches.slice(
        0,
        Math.min(branchLimit, defaultBranches.length),
      );
      await saveBranches();
    }
    populateCityFilter();
    await renderBranches();
  };
  const saveBranches = async () => {
    await WusoolServices.rawWrite(
      'wusoolOrganizationBranches',
      JSON.stringify(organizationBranches),
    );
  };
  const renderBranches = async () => {
    const filteredBranches = getFilteredBranches();
    const tableBody = document.getElementById('branchesTableBody');
    const emptyState = document.getElementById('emptyBranchesState');
    WusoolUI.html(tableBody, '');
    filteredBranches.forEach((branch) => {
      tableBody.appendChild(createBranchRow(branch));
    });
    const hasResults = filteredBranches.length > 0;
    document.querySelector('.branches-table').classList.toggle('d-none', !hasResults);
    emptyState.classList.toggle('d-none', hasResults);
    document.getElementById('resultsCount').textContent = formatBranchCount(filteredBranches.length);
    updateStatistics();
    await updateSubscriptionUsage();
    await updateAddBranchButton();
  };
  const createBranchRow = (branch) => {
    const row = document.createElement('tr');
    WusoolUI.html(
      row,
      `
        <td>
            <div class="branch-name">
                <span class="branch-avatar">
                    <i class="bi bi-building"></i>
                </span>

                <div>
                    <strong>
                        ${escapeHtml(branch.name)}
                    </strong>

                    <small>
                        ${escapeHtml(branch.type)}
                    </small>
                </div>
            </div>
        </td>

        <td>
            <i class="bi bi-geo-alt text-secondary me-1"></i>
            ${escapeHtml(branch.city)}
        </td>

        <td>
            ${
              branch.score != null
                ? `<span class="score-value">
                           ${WusoolUI.escape(branch.score)}%
                       </span>`
                : `<span class="text-secondary">
                           ${text('Not evaluated', 'لم يُقيَّم')}
                       </span>`
            }
        </td>

        <td>
            ${createStatusBadge(branch.status)}
        </td>

        <td>
            <span class="text-secondary small">
                ${formatDate(branch.updatedAt)}
            </span>
        </td>

        <td class="text-end">
            ${createBranchActions(branch)}
        </td>
    `,
    );
    return row;
  };
  const createStatusBadge = (status) => {
    const statusInformation = {
      approved: {
        label: text('Approved', 'معتمد'),
        icon: 'bi-check-circle-fill',
      },
      'pending-review': {
        label: text('Pending review', 'قيد المراجعة'),
        icon: 'bi-hourglass-split',
      },
      'changes-required': {
        label: text('Changes required', 'التعديلات مطلوبة'),
        icon: 'bi-exclamation-circle-fill',
      },
      draft: {
        label: text('Draft', 'مسودة'),
        icon: 'bi-pencil',
      },
    };
    const currentStatus = statusInformation[status] || statusInformation.draft;
    return `
        <span class="
            status-badge
            status-${status}
        ">
            <i class="bi ${currentStatus.icon}"></i>
            ${currentStatus.label}
        </span>
    `;
  };
  const createBranchActions = (branch) => {
    let primaryLink = `./organization-branch-details.html?id=${WusoolUI.escape(branch.id)}`;
    let primaryLabel = 'View';
    let primaryIcon = 'bi-eye';
    if (branch.status === 'draft' || branch.status === 'changes-required') {
      primaryLink = `./edit-branch.html?id=${WusoolUI.escape(branch.id)}`;
      primaryLabel = branch.status === 'draft' ? text('Continue', 'متابعة') : text('Edit', 'تعديل');
      primaryIcon = 'bi-pencil-square';
    }
    if (branch.status === 'pending-review') {
      primaryLink = `./branch-review-status.html?id=${WusoolUI.escape(branch.id)}`;
      primaryLabel = text('Track', 'متابعة');
      primaryIcon = 'bi-clock-history';
    }
    const deleteAction =
      branch.status === 'draft'
        ? `
                <li>
                    <button
                        type="button"
                        class="dropdown-item text-danger"
                        data-delete-draft="${WusoolUI.escape(branch.id)}"
                    >
                        <i class="bi bi-trash me-2"></i>
                        ${text('Delete draft', 'حذف المسودة')}
                    </button>
                </li>
            `
        : '';
    return `
        <div class="d-flex justify-content-end gap-2">
            <a
                href="${primaryLink}"
                class="btn btn-sm btn-outline-wusool"
            >
                <i class="bi ${primaryIcon} me-1"></i>
                ${primaryLabel}
            </a>

            <div class="dropdown">
                <button
                    type="button"
                    class="btn btn-sm action-button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="${WusoolUI.escape(text(`Branch actions for ${branch.name}`, `إجراءات فرع ${branch.name}`))}"
                >
                    <i class="bi bi-three-dots-vertical"></i>
                </button>

                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <a
                            href="./organization-branch-details.html?id=${WusoolUI.escape(branch.id)}"
                            class="dropdown-item"
                        >
                            <i class="bi bi-eye me-2"></i>
                            ${text('View details', 'عرض التفاصيل')}
                        </a>
                    </li>

                    <li>
                        <a
                            href="./branch-review-status.html?id=${WusoolUI.escape(branch.id)}"
                            class="dropdown-item"
                        >
                            <i class="bi bi-clock-history me-2"></i>
                            ${text('Review status', 'حالة المراجعة')}
                        </a>
                    </li>

                    ${deleteAction}
                </ul>
            </div>
        </div>
    `;
  };
  const getFilteredBranches = () => {
    const searchValue = document.getElementById('branchSearch').value.trim().toLowerCase();
    const selectedCity = document.getElementById('cityFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;
    const sortValue = document.getElementById('sortBranches').value;
    const filteredBranches = organizationBranches.filter((branch) => {
      const matchesSearch =
        branch.name.toLowerCase().includes(searchValue) ||
        branch.city.toLowerCase().includes(searchValue);
      const matchesCity = selectedCity === 'all' || branch.city === selectedCity;
      const matchesStatus = selectedStatus === 'all' || branch.status === selectedStatus;
      return matchesSearch && matchesCity && matchesStatus;
    });
    return sortBranchResults(filteredBranches, sortValue);
  };
  const sortBranchResults = (branches, sortValue) => {
    const sortedBranches = [...branches];
    if (sortValue === 'name') {
      return sortedBranches.sort((first, second) => {
        return first.name.localeCompare(second.name);
      });
    }
    if (sortValue === 'score-high') {
      return sortedBranches.sort((first, second) => {
        return (second.score ?? -1) - (first.score ?? -1);
      });
    }
    if (sortValue === 'score-low') {
      return sortedBranches.sort((first, second) => {
        return (first.score ?? 101) - (second.score ?? 101);
      });
    }
    return sortedBranches.sort((first, second) => {
      return new Date(second.updatedAt) - new Date(first.updatedAt);
    });
  };
  const initializeFilters = () => {
    const filterElements = [
      document.getElementById('branchSearch'),
      document.getElementById('cityFilter'),
      document.getElementById('statusFilter'),
      document.getElementById('sortBranches'),
    ];
    filterElements.forEach((element) => {
      WusoolUI.listen(element, element.tagName === 'INPUT' ? 'input' : 'change', renderBranches);
    });
  };
  const populateCityFilter = () => {
    const cityFilter = document.getElementById('cityFilter');
    const selected = cityFilter.value;
    Array.from(cityFilter.querySelectorAll('option'))
      .slice(1)
      .forEach((option) => option.remove());
    const cities = [...new Set(organizationBranches.map((branch) => branch.city))].sort();
    cities.forEach((city) => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      cityFilter.appendChild(option);
    });
    cityFilter.value = selected;
  };
  const updateStatistics = () => {
    const approvedCount = organizationBranches.filter(
      (branch) => branch.status === 'approved',
    ).length;
    const pendingCount = organizationBranches.filter(
      (branch) => branch.status === 'pending-review',
    ).length;
    const attentionCount = organizationBranches.filter(
      (branch) => branch.status === 'changes-required' || branch.status === 'draft',
    ).length;
    document.getElementById('totalBranches').textContent = organizationBranches.length;
    document.getElementById('approvedBranches').textContent = approvedCount;
    document.getElementById('pendingBranches').textContent = pendingCount;
    document.getElementById('attentionBranches').textContent = attentionCount;
  };
  const updateSubscriptionUsage = async () => {
    const subscription = await getActiveSubscription();
    const branchLimit = await getBranchLimit();
    const branchCount = WusoolServices.branchUsage(organizationBranches);
    const usagePercentage = Math.min((branchCount / branchLimit) * 100, 100);
    const excess = Math.max(0, branchCount - branchLimit);
    document.getElementById('currentPlanName').textContent = text(
      `${subscription.planName} plan`,
      `خطة ${subscription.planName}`,
    );
    document.getElementById('branchUsageText').textContent = text(
      `${number(branchCount)} used of ${number(branchLimit)} subscribed branches`,
      `${number(branchCount)} مستخدمًا من أصل ${number(branchLimit)} فرعًا مشمولًا`,
    );
    const usageStatus = document.getElementById('branchCapacityStatus');
    usageStatus.textContent = excess
      ? text(
          `Capacity exceeded by ${number(excess)}. Existing branches remain available, but a subscription upgrade is required before adding another branch.`,
          `تم تجاوز السعة بمقدار ${number(excess)}. تبقى الفروع الحالية متاحة، ويلزم ترقية الاشتراك قبل إضافة فرع جديد.`,
        )
      : text(
          `${number(branchLimit - branchCount)} branch capacity remaining.`,
          `السعة المتبقية ${number(branchLimit - branchCount)} ${branchLimit - branchCount === 1 ? 'فرع' : 'فروع'}.`,
        );
    usageStatus.classList.toggle('capacity-exceeded', excess > 0);
    const progressBar = document.getElementById('branchUsageProgress');
    progressBar.style.width = `${usagePercentage}%`;
    progressBar.setAttribute('aria-valuenow', usagePercentage.toString());
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute(
      'aria-valuetext',
      text(
        `${number(branchCount)} branches used of ${number(branchLimit)} subscribed${excess ? `; ${number(excess)} over capacity` : ''}`,
        `${number(branchCount)} فرعًا مستخدمًا من أصل ${number(branchLimit)}${excess ? `؛ تجاوز بمقدار ${number(excess)}` : ''}`,
      ),
    );
  };
  const initializeAddBranchButtons = () => {
    WusoolUI.listen(document.getElementById('addBranchButton'), 'click', handleAddBranch);
    WusoolUI.listen(document.getElementById('emptyStateAddButton'), 'click', handleAddBranch);
  };
  const handleAddBranch = async () => {
    const branchLimit = await getBranchLimit();
    if (organizationBranches.length >= branchLimit) {
      showToast(
        text(
          `Your subscription includes ${number(branchLimit)} branches. Upgrade your subscription to add another branch.`,
          `يشمل اشتراكك ${number(branchLimit)} ${branchLimit === 1 ? 'فرعًا' : 'فروع'}. رقِّ الاشتراك لإضافة فرع آخر.`,
        ),
        'warning',
      );
      return;
    }
    window.location.href = './add-branch.html';
  };
  const updateAddBranchButton = async () => {
    const addBranchButton = document.getElementById('addBranchButton');
    const limitReached = organizationBranches.length >= (await getBranchLimit());
    WusoolUI.html(
      addBranchButton,
      limitReached
        ? `
                <i class="bi bi-lock me-2"></i>
                ${text('Branch capacity reached', 'تم بلوغ سعة الفروع')}
            `
        : `
                <i class="bi bi-plus-lg me-2"></i>
                ${text('Add new branch', 'إضافة فرع جديد')}
            `,
    );
    addBranchButton.classList.toggle('btn-wusool', !limitReached);
    addBranchButton.classList.toggle('btn-secondary', limitReached);
    addBranchButton.setAttribute('aria-disabled', String(limitReached));
    addBranchButton.setAttribute('aria-describedby', 'branchCapacityStatus');
    document.getElementById('emptyStateAddButton')?.setAttribute('aria-disabled', String(limitReached));
  };
  const initializeDeleteBranch = () => {
    deleteBranchModal = new bootstrap.Modal(document.getElementById('deleteBranchModal'));
    WusoolUI.listen(document.getElementById('confirmDeleteButton'), 'click', deleteSelectedBranch);
    WusoolUI.listen(document.getElementById('deleteBranchModal'), 'hidden.bs.modal', () => {
      branchToDeleteId = null;
    });
    WusoolUI.listen(document.getElementById('branchesTableBody'), 'click', (event) => {
      const trigger = event.target.closest('[data-delete-draft]');
      if (!trigger) return;
      openDeleteBranchModal(trigger.dataset.deleteDraft);
    });
  };
  const openDeleteBranchModal = (branchId) => {
    const branch = WusoolBranchWorkflow.eligibleDraft(organizationBranches, branchId);
    if (!branch) {
      return;
    }
    branchToDeleteId = branchId;
    document.getElementById('deleteBranchName').textContent = branch.name;
    deleteBranchModal.show();
  };
  const deleteSelectedBranch = async () => {
    if (branchToDeleteId === null) {
      return;
    }
    organizationBranches = organizationBranches.filter((branch) => branch.id !== branchToDeleteId);
    await saveBranches();
    populateCityFilterAgain();
    await renderBranches();
    deleteBranchModal.hide();
    branchToDeleteId = null;
    showToast('The branch draft was deleted successfully.', 'success');
  };
  const populateCityFilterAgain = () => {
    const cityFilter = document.getElementById('cityFilter');
    const selectedValue = cityFilter.value;
    WusoolUI.html(
      cityFilter,
      `
        <option value="all">
            All Cities
        </option>
    `,
    );
    populateCityFilter();
    const optionExists = Array.from(cityFilter.options).some((option) => {
      return option.value === selectedValue;
    });
    cityFilter.value = optionExists ? selectedValue : 'all';
  };
  const initializeSidebar = () => {
    const sidebar = document.getElementById('organizationSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const openButton = document.getElementById('openSidebarButton');
    const closeButton = document.getElementById('closeSidebarButton');
    const openSidebar = () => {
      sidebar.classList.add('open');
      overlay.classList.add('show');
      document.body.classList.add('overflow-hidden');
      closeButton.focus();
    };
    const closeSidebar = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      document.body.classList.remove('overflow-hidden');
      if (document.activeElement === closeButton || sidebar.contains(document.activeElement)) {
        openButton.focus();
      }
    };
    WusoolUI.listen(openButton, 'click', openSidebar);
    WusoolUI.listen(closeButton, 'click', closeSidebar);
    WusoolUI.listen(overlay, 'click', closeSidebar);
    WusoolUI.listen(document, 'keydown', (event) => {
      if (event.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
    });
    WusoolUI.listen(window, 'resize', () => {
      if (window.innerWidth >= 992) {
        closeSidebar();
      }
    });
  };
  const initializeLogout = () => {
    WusoolUI.listen(document.getElementById('logoutButton'), 'click', async () => {
      await WusoolServices.rawRemove('wusoolOrganization');
      await WusoolServices.rawRemove('wusoolOrganizationLoggedIn');
      window.location.replace('./organization-login.html');
    });
  };
  const loadOrganizationName = async () => {
    const organization = await readStoredObject('wusoolOrganization');
    const organizationName =
      organization?.organizationName ||
      organization?.companyName ||
      organization?.name ||
      'Organization';
    document.getElementById('sidebarOrganizationName').textContent = organizationName;
  };
  const showToast = (message, type = 'success') => {
    const toastElement = document.getElementById('branchesToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    toastMessage.textContent = message;
    toastIcon.className =
      type === 'warning'
        ? 'bi bi-exclamation-triangle-fill text-warning me-2'
        : 'bi bi-check-circle-fill text-success me-2';
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement);
    toast.show();
  };
  const formatDate = (dateValue) => {
    return new Intl.DateTimeFormat(isArabic() ? 'ar-JO' : 'en-JO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateValue));
  };
  const formatBranchCount = (count) => {
    if (!isArabic()) return `${number(count)} ${count === 1 ? 'branch' : 'branches'}`;
    if (count === 0) return 'لا توجد فروع';
    if (count === 1) return 'فرع واحد';
    if (count === 2) return 'فرعان';
    if (count >= 3 && count <= 10) return `${number(count)} فروع`;
    return `${number(count)} فرعًا`;
  };
  const escapeHtml = (value) => {
    const temporaryElement = document.createElement('div');
    temporaryElement.textContent = value ?? '';
    return temporaryElement.innerHTML;
  };

  /*
      Needed because the table action is created
      dynamically using HTML.
  */
  WusoolUI.listen(document, 'wxi:language', renderBranches);
});
