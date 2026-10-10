'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const visitContent = document.getElementById('visitContent');
    const missingVisit = document.getElementById('missingVisit');
    const placeName = document.getElementById('placeName');
    const branchName = document.getElementById('branchName');
    const destination = document.getElementById('destination');
    const visitPurpose = document.getElementById('visitPurpose');
    const visitDate = document.getElementById('visitDate');
    const visitTime = document.getElementById('visitTime');
    const supportList = document.getElementById('supportList');
    const guidanceMethod = document.getElementById('guidanceMethod');
    const notesContainer = document.getElementById('notesContainer');
    const visitNotes = document.getElementById('visitNotes');
    const viewPlaceButton = document.getElementById('viewPlaceButton');
    const editVisitButton = document.getElementById('editVisitButton');
    const backToPlanButton = document.getElementById('backToPlanButton');
    const confirmationForm = document.getElementById('confirmationForm');
    const confirmInformation = document.getElementById('confirmInformation');
    const navbarUserName = document.getElementById('navbarUserName');
    if (navbarUserName) navbarUserName.textContent = (await WusoolServices.rawRead('wusool-user-name')) || 'User';
    const statusMessage = document.createElement('p');
    statusMessage.className = 'alert alert-danger d-none';
    statusMessage.setAttribute('role', 'alert');
    confirmationForm.appendChild(statusMessage);
    const showStatusMessage = (message) => {
      statusMessage.textContent = message;
      statusMessage.classList.remove('d-none');
      statusMessage.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    };
    const getPendingVisit = async () => {
      const savedVisit = await WusoolServices.rawRead('wusool-pending-visit');
      if (!savedVisit) {
        return null;
      }
      try {
        return JSON.parse(savedVisit);
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        return null;
      }
    };
    const formatDate = (dateValue) => {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${dateValue}T00:00:00`));
    };
    const formatTime = (timeValue) => {
      const [hours, minutes] = timeValue.split(':');
      const timeDate = new Date();
      timeDate.setHours(Number(hours), Number(minutes));
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(timeDate);
    };
    const renderSupport = (support) => {
      WusoolUI.html(supportList, '');
      if (!support || support.length === 0) {
        const emptySupport = document.createElement('span');
        emptySupport.className = 'text-secondary';
        emptySupport.textContent = 'No additional support selected.';
        supportList.appendChild(emptySupport);
        return;
      }
      support.forEach((supportItem) => {
        const supportTag = document.createElement('span');
        supportTag.className = 'support-tag';
        WusoolUI.html(
          supportTag,
          `
        <i class="bi bi-check-circle-fill me-1"></i>
        ${WusoolUI.escape(supportItem)}
      `,
        );
        supportList.appendChild(supportTag);
      });
    };
    const showMissingVisit = () => {
      visitContent.classList.add('d-none');
      missingVisit.classList.remove('d-none');
    };
    const renderVisit = (visit) => {
      placeName.textContent = visit.placeName;
      branchName.textContent = visit.branch;
      destination.textContent = visit.destination;
      visitPurpose.textContent = visit.purpose;
      visitDate.textContent = formatDate(visit.date);
      visitTime.textContent = formatTime(visit.time);
      renderSupport(visit.support);
      const guidanceLabels = {
        text: 'Text',
        voice: 'Voice',
        both: 'Text & Voice',
      };
      guidanceMethod.textContent = guidanceLabels[visit.guidanceMethod] || guidanceLabels.both;
      if (visit.notes) {
        visitNotes.textContent = visit.notes;
        notesContainer.classList.remove('d-none');
      } else {
        notesContainer.classList.add('d-none');
      }
      const editUrl = `./plan-visit.html?placeId=${visit.placeId}`;
      viewPlaceButton.href = `./user-place-details.html?id=${visit.placeId}`;
      editVisitButton.href = editUrl;
      backToPlanButton.href = editUrl;
      document.title = `${visit.placeName} Visit Summary | Wusool`;
    };
    const getStoredVisits = async () => {
      const storedVisits = await WusoolServices.rawRead('wusool-visits');
      if (!storedVisits) {
        return [];
      }
      try {
        return JSON.parse(storedVisits);
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        return [];
      }
    };
    const confirmVisit = async (visit) => {
      const key = visit.idempotencyKey || (visit.id != null ? String(visit.id) : crypto.randomUUID());
      visit.idempotencyKey = key;
      await WusoolServices.rawWrite('wusool-pending-visit', JSON.stringify(visit));
      await WusoolServices.createBooking(
        {
          ...visit,
          branchId: visit.branchId || visit.placeId,
        },
        key,
      );
      await WusoolServices.rawRemove('wusool-pending-visit');
      window.WusoolLive?.saved();
      location.href = './my-tickets.html?confirmed=true';
    };
    WusoolUI.listen(confirmationForm, 'submit', async (event) => {
      event.preventDefault();
      if (!confirmInformation.checked) {
        confirmInformation.focus();
        showStatusMessage('Confirm that the visit information is correct.');
        return;
      }
      const pendingVisit = await getPendingVisit();
      if (!pendingVisit) {
        showMissingVisit();
        return;
      }
      statusMessage.classList.add('d-none');
      try { await confirmVisit(pendingVisit); }
      catch (error) { showStatusMessage(error.message || 'Unable to confirm this visit. Check the branch hours and choose an available time.'); }
    });
    const pendingVisit = await getPendingVisit();
    if (!pendingVisit) {
      showMissingVisit();
    } else {
      renderVisit(pendingVisit);
    }
  });
});
