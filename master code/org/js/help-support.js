WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(() => {
    initializeSupportForm();
  });
  const initializeSupportForm = () => {
    const supportForm = document.getElementById('helpSupportForm');
    if (!supportForm) {
      return;
    }
    WusoolUI.listen(supportForm, 'submit', async (event) => {
      event.preventDefault();
      if (!supportForm.checkValidity()) {
        event.stopPropagation();
        supportForm.classList.add('was-validated');
        return;
      }
      const supportRequest = createSupportRequest();
      await saveSupportRequest(supportRequest);
      showSuccessMessage(supportRequest.reference);
      resetSupportForm(supportForm);
    });
  };
  const createSupportRequest = () => {
    const category = document.getElementById('supportCategory').value;
    const priority = document.getElementById('supportPriority').value;
    const subject = document.getElementById('supportSubject').value.trim();
    const message = document.getElementById('supportMessage').value.trim();
    const attachmentInput = document.getElementById('supportAttachment');
    const attachmentName = attachmentInput.files.length > 0 ? attachmentInput.files[0].name : '';
    return {
      id: Date.now(),
      reference: generateRequestReference(),
      category,
      priority,
      subject,
      message,
      attachmentName,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
  };
  const generateRequestReference = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `SUP-${year}-${randomNumber}`;
  };
  const saveSupportRequest = async (supportRequest) => {
    const attachment = document.getElementById('supportAttachment').files[0];
    if (attachment)
      supportRequest.attachments = [
        await WusoolServices.upload(attachment, { purpose: 'support' }),
      ];
    const savedRequests = await getSavedSupportRequests();
    savedRequests.push(supportRequest);
    await WusoolServices.rawWrite('wusoolSupportRequests', JSON.stringify(savedRequests));
  };
  const getSavedSupportRequests = async () => {
    const savedRequests = await WusoolServices.rawRead('wusoolSupportRequests');
    if (!savedRequests) {
      return [];
    }
    try {
      return JSON.parse(savedRequests);
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      console.error('Could not read support requests:', error);
      return [];
    }
  };
  const showSuccessMessage = (reference) => {
    const successMessage = document.getElementById('supportSuccessMessage');
    if (!successMessage) {
      return;
    }
    WusoolUI.html(
      successMessage,
      `
        <i class="bi bi-check-circle-fill me-2"></i>

        Your support request was submitted successfully.

        <strong class="ms-1">
            Reference: ${reference}
        </strong>
    `,
    );
    successMessage.classList.remove('d-none');
    successMessage.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    window.setTimeout(() => {
      successMessage.classList.add('d-none');
    }, 8000);
  };
  const resetSupportForm = (supportForm) => {
    supportForm.reset();
    supportForm.classList.remove('was-validated');
  };
});
