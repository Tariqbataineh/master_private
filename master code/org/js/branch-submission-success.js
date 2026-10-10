WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const storageKeys = {
    branches: 'wusoolOrganizationBranches',
    currentDraft: 'wusoolCurrentBranchDraft',
    organization: 'wusoolOrganization',
    registration: 'wusoolOrganizationRegistration',
    loggedIn: 'wusoolOrganizationLoggedIn',
    subscription: 'wusoolActiveSubscription',
  };
  let currentBranch = null;
  WusoolUI.ready(async () => {
    await protectPage();
    await loadOrganizationInformation();
    await loadCurrentBranch();
    if (!currentBranch) return;
    await renderSubmissionInformation();
    configureNavigation();
    configureSidebar();
  });
  const protectPage = async () => {
    const isLoggedIn = (await WusoolServices.rawRead(storageKeys.loggedIn)) === 'true';
    const subscription = await getStoredObject(storageKeys.subscription, null);
    if (!isLoggedIn) {
      window.location.href = './organization-login.html';
      return;
    }
    if (!subscription) {
      window.location.href = './subscription-plans.html';
    }
  };
  const loadOrganizationInformation = async () => {
    const organization = await getStoredObject(storageKeys.organization, {});
    const registration = await getStoredObject(storageKeys.registration, {});
    const organizationName =
      organization.organizationName ||
      organization.name ||
      registration.organizationName ||
      registration.name ||
      'Organization';
    document.getElementById('organizationName').textContent = organizationName;
  };
  const loadCurrentBranch = async () => {
    const parameters = new URLSearchParams(window.location.search);
    const branchId = parameters.get('id');
    const branches = await getStoredObject(storageKeys.branches, []);
    currentBranch =
      branches.find((branch) => {
        return String(branch.id) === String(branchId);
      }) || (await getStoredObject(storageKeys.currentDraft, null));
    if (!currentBranch) {
      window.location.href = './branches.html';
      return;
    }
    document.title = `${getBranchName()} Submitted | Wusool`;
  };
  const renderSubmissionInformation = async () => {
    if (!currentBranch.submittedAt || !currentBranch.referenceNumber) {
      WusoolUI.message(
        'No confirmed branch submission exists for this branch. Submit it from the final review screen.',
        'info',
      );
      document.getElementById('referenceNumber').textContent = 'No submission';
      return;
    }
    const branchName = getBranchName();
    const location =
      [currentBranch.city, currentBranch.district].filter(Boolean).join(', ') ||
      currentBranch.address ||
      'Location not provided';
    const referenceNumber = currentBranch.referenceNumber;
    const submittedAt = currentBranch.submittedAt;
    const score = currentBranch.aiReview?.score ?? currentBranch.accessibilityScore ?? 0;
    document.getElementById('branchName').textContent = branchName;
    document.getElementById('referenceNumber').textContent = referenceNumber;
    document.getElementById('submittedDate').textContent = formatDate(submittedAt);
    document.getElementById('branchLocation').textContent = location;
    document.getElementById('accessibilityScore').textContent = `${score}%`;
  };
  const updateBranchReference = async (referenceNumber, submittedAt) => {
    const branches = await getStoredObject(storageKeys.branches, []);
    const branchIndex = branches.findIndex((branch) => {
      return String(branch.id) === String(currentBranch.id);
    });
    const updatedBranch = {
      ...currentBranch,
      referenceNumber,
      submittedAt,
      status: 'pending-review',
      statusLabel: 'Pending Review',
      isPublished: false,
    };
    if (branchIndex >= 0) {
      branches[branchIndex] = updatedBranch;
    } else {
      branches.push(updatedBranch);
    }
    await WusoolServices.rawWrite(storageKeys.branches, JSON.stringify(branches));
    await WusoolServices.rawWrite(storageKeys.currentDraft, JSON.stringify(updatedBranch));
    currentBranch = updatedBranch;
  };
  const configureNavigation = () => {
    const branchId = encodeURIComponent(currentBranch.id);
    document.getElementById('trackStatusLink').href = `./branch-review-status.html?id=${branchId}`;
    WusoolUI.listen(document.getElementById('logoutButton'), 'click', async () => {
      await WusoolServices.rawRemove(storageKeys.loggedIn);
      window.location.href = './organization-login.html';
    });
  };
  const configureSidebar = () => {
    const sidebar = document.getElementById('organizationSidebar');
    const toggleButton = document.getElementById('sidebarToggle');
    const backdrop = document.getElementById('sidebarBackdrop');
    const closeSidebar = () => {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    };
    WusoolUI.listen(toggleButton, 'click', () => {
      sidebar.classList.toggle('show');
      backdrop.classList.toggle('show');
    });
    WusoolUI.listen(backdrop, 'click', closeSidebar);
    WusoolUI.listen(window, 'resize', () => {
      if (window.innerWidth >= 992) {
        closeSidebar();
      }
    });
  };
  const getBranchName = () => {
    return currentBranch.branchName || currentBranch.name || 'New Branch';
  };
  const formatDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  const createReferenceNumber = () => {
    const number = Date.now().toString().slice(-8);
    return `BR-${number}`;
  };
  const getStoredObject = async (storageKey, fallbackValue) => {
    try {
      const storedValue = await WusoolServices.rawRead(storageKey);
      return storedValue ? JSON.parse(storedValue) : fallbackValue;
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      console.error(`Unable to read ${storageKey}:`, error);
      return fallbackValue;
    }
  };
});
