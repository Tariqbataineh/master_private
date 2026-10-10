'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const branchStorageKey = 'wusoolOrganizationBranches';
  const defaultBranches = [];
  let branches = [];
  let selectedBranchId = 1;
  WusoolUI.ready(async () => {
    await initializeEditBranchPage();
  });
  const initializeEditBranchPage = async () => {
    branches = await loadBranches();
    selectedBranchId = getBranchId();
    const selectedBranch = branches.find((branch) => {
      return branch.id === selectedBranchId;
    });
    if (!selectedBranch) {
      showBranchNotFound();
      return;
    }
    displayBranchInformation(selectedBranch);
    updatePageLinks();
    connectPageEvents();
  };
  const loadBranches = async () => {
    const savedBranches = await WusoolServices.rawRead(branchStorageKey);
    if (savedBranches) {
      try {
        const parsedBranches = JSON.parse(savedBranches);
        if (Array.isArray(parsedBranches)) {
          return parsedBranches;
        }
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        console.error('Unable to load branches:', error);
      }
    }
    await WusoolServices.rawWrite(branchStorageKey, JSON.stringify(defaultBranches));
    return [...defaultBranches];
  };
  const getBranchId = () => {
    const parameters = new URLSearchParams(window.location.search);
    return parameters.get('id') || 1;
  };
  const displayBranchInformation = (branch) => {
    document.getElementById('branchName').value = branch.name;
    document.getElementById('branchType').value = branch.type;
    document.getElementById('branchPhone').value = branch.phone;
    document.getElementById('branchEmail').value = branch.email || '';
    document.getElementById('branchDescription').value = branch.description || '';
    document.getElementById('branchCity').value = branch.city;
    document.getElementById('branchArea').value = branch.area;
    document.getElementById('branchAddress').value = branch.address;
    document.getElementById('branchLatitude').value = branch.latitude ?? '';
    document.getElementById('branchLongitude').value = branch.longitude ?? '';
    document.getElementById('branchActive').checked = branch.active;
    document.getElementById('approvalStatus').textContent = branch.approvalStatus;
    updateDescriptionCount();
    document.title = `Edit ${WusoolUI.escape(branch.name)} | Wusool`;
  };
  const updatePageLinks = () => {
    document.getElementById('workingHoursLink').href =
      `./branch-working-hours.html?id=${selectedBranchId}`;
    document.getElementById('accessibilityLink').href =
      `./branch-accessibility.html?id=${selectedBranchId}`;
    document.getElementById('cancelEditLink').href =
      `./organization-branch-details.html?id=${selectedBranchId}`;
  };
  const connectPageEvents = () => {
    WusoolUI.listen(document.getElementById('editBranchForm'), 'submit', saveBranchChanges);
    WusoolUI.listen(document.getElementById('branchDescription'), 'input', updateDescriptionCount);
  };
  const updateDescriptionCount = () => {
    const description = document.getElementById('branchDescription').value;
    document.getElementById('descriptionCount').textContent = description.length;
  };
  const saveBranchChanges = async (event) => {
    event.preventDefault();
    const form = document.getElementById('editBranchForm');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    successAlert.classList.add('d-none');
    errorAlert.classList.add('d-none');
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      errorAlert.classList.remove('d-none');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }
    const branchIndex = branches.findIndex((branch) => {
      return branch.id === selectedBranchId;
    });
    if (branchIndex === -1) {
      return;
    }
    branches[branchIndex] = {
      ...branches[branchIndex],
      name: document.getElementById('branchName').value.trim(),
      type: document.getElementById('branchType').value,
      phone: document.getElementById('branchPhone').value.trim(),
      email: document.getElementById('branchEmail').value.trim(),
      description: document.getElementById('branchDescription').value.trim(),
      city: document.getElementById('branchCity').value,
      area: document.getElementById('branchArea').value.trim(),
      address: document.getElementById('branchAddress').value.trim(),
      ...window.WusoolLocation.fields({
        googlePlaceId: document.querySelector('[data-location-place-id]')?.value,
        governorate: document.querySelector('[data-location-governorate]')?.value,
        latitude: document.getElementById('branchLatitude').value,
        longitude: document.getElementById('branchLongitude').value,
      }),
      active: document.getElementById('branchActive').checked,
      lastUpdated: new Date().toISOString(),
    };
    await WusoolServices.rawWrite(branchStorageKey, JSON.stringify(branches));
    form.classList.remove('was-validated');
    successAlert.classList.remove('d-none');
    const saved = await WusoolServices.getBranchById(selectedBranchId);
    if (saved) window.location.href = window.WusoolBranchWorkflow.route(saved);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  const showBranchNotFound = () => {
    const mainContent = document.querySelector('main');
    WusoolUI.html(
      mainContent,
      `
        <section class="container py-5 text-center">
            <i class="bi bi-building-x display-2 text-warning"></i>

            <h1 class="mt-3">Branch Not Found</h1>

            <p class="text-secondary">
                The requested branch does not exist.
            </p>

            <a
                href="./branches.html"
                class="btn btn-wusool"
            >
                Return to Branches
            </a>
        </section>
    `,
    );
  };
});
