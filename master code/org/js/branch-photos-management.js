'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const branchesStorageKey = 'wusoolOrganizationBranches';
  const requiredPhotoCount = 1; // Presence indicator, not a requirement.
  let organizationBranches = [];
  let filteredBranches = [];
  WusoolUI.ready(async () => {
    await loadBranches();
    configureFilters();
    renderPage();
  });
  const defaultBranches = [];
  const loadBranches = async () => {
    const storedBranches = await WusoolServices.rawRead(branchesStorageKey);
    if (!storedBranches) {
      organizationBranches = defaultBranches;
      await saveBranches();
    } else {
      try {
        organizationBranches = JSON.parse(storedBranches);
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        console.error('Unable to load branches:', error);
        organizationBranches = defaultBranches;
      }
    }
    filteredBranches = [...organizationBranches];
  };
  const saveBranches = async () => {
    await WusoolServices.rawWrite(branchesStorageKey, JSON.stringify(organizationBranches));
  };
  const configureFilters = () => {
    const searchInput = document.getElementById('branchSearch');
    const statusFilter = document.getElementById('photoStatusFilter');
    const clearFiltersButton = document.getElementById('clearFiltersButton');
    WusoolUI.listen(searchInput, 'input', filterBranches);
    WusoolUI.listen(statusFilter, 'change', filterBranches);
    WusoolUI.listen(clearFiltersButton, 'click', () => {
      searchInput.value = '';
      statusFilter.value = 'all';
      filterBranches();
    });
  };
  const filterBranches = () => {
    const searchValue = document.getElementById('branchSearch').value.trim().toLowerCase();
    const selectedStatus = document.getElementById('photoStatusFilter').value;
    filteredBranches = organizationBranches.filter((branch) => {
      const branchName = branch.name || '';
      const branchCity = branch.city || '';
      const searchableText = `${branchName} ${branchCity}`.toLowerCase();
      const matchesSearch = searchableText.includes(searchValue);
      const photoStatus = getBranchPhotoStatus(branch);
      const matchesStatus = selectedStatus === 'all' || selectedStatus === photoStatus;
      return matchesSearch && matchesStatus;
    });
    renderBranches();
  };
  const renderPage = () => {
    renderStatistics();
    renderBranches();
  };
  const renderStatistics = () => {
    const completeBranches = organizationBranches.filter((branch) => {
      return getBranchPhotoStatus(branch) === 'complete';
    }).length;
    const incompleteBranches = organizationBranches.filter((branch) => {
      return getBranchPhotoStatus(branch) !== 'complete';
    }).length;
    const totalPhotos = organizationBranches.reduce((total, branch) => {
      return total + getBranchPhotos(branch).length;
    }, 0);
    setTextContent('totalBranches', organizationBranches.length);
    setTextContent('completeBranches', completeBranches);
    setTextContent('incompleteBranches', incompleteBranches);
    setTextContent('totalPhotos', totalPhotos);
  };
  const renderBranches = () => {
    const branchesContainer = document.getElementById('branchesContainer');
    const emptyState = document.getElementById('emptyState');
    const resultsText = document.getElementById('resultsText');
    WusoolUI.html(branchesContainer, '');
    resultsText.textContent =
      `Showing ${filteredBranches.length} ` +
      `${filteredBranches.length === 1 ? 'branch' : 'branches'}`;
    if (filteredBranches.length === 0) {
      branchesContainer.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
    }
    branchesContainer.classList.remove('d-none');
    emptyState.classList.add('d-none');
    filteredBranches.forEach((branch) => {
      WusoolUI.insertHTML(branchesContainer, 'beforeend', createBranchCard(branch));
    });
  };
  const createBranchCard = (branch) => {
    const branchPhotos = getBranchPhotos(branch);
    const photoCount = branchPhotos.length;
    const photoStatus = getBranchPhotoStatus(branch);
    const statusInformation = getStatusInformation(photoStatus);
    const progressPercentage = Math.min(Math.round((photoCount / requiredPhotoCount) * 100), 100);
    const progressClass =
      photoStatus === 'complete' ? '' : photoStatus === 'no-photos' ? 'empty' : 'incomplete';
    return `
        <div class="col-12 col-md-6 col-xl-4">
            <article class="branch-photo-card h-100">

                <div class="branch-photo-cover">
                    <i class="bi bi-building"></i>

                    <span class="photo-count">
                        <i class="bi bi-images me-1"></i>
                        ${photoCount} Media items
                    </span>
                </div>

                <div class="branch-photo-body">

                    <div
                        class="d-flex justify-content-between align-items-start gap-3 mb-3"
                    >
                        <div>
                            <h2 class="h5 fw-bold mb-1">
                                ${escapeHtml(branch.name || 'Unnamed Branch')}
                            </h2>

                            <p class="branch-location mb-0">
                                <i class="bi bi-geo-alt me-1"></i>

                                ${escapeHtml(branch.city || 'Location not provided')}
                            </p>
                        </div>

                        <span
                            class="photo-status ${photoStatus}"
                        >
                            <i class="bi ${statusInformation.icon}"></i>
                            ${statusInformation.label}
                        </span>
                    </div>

                    <p class="small text-secondary mb-2">
                        ${escapeHtml(branch.address || 'Branch address not provided')}
                    </p>

                    <div
                        class="d-flex justify-content-between small mb-2"
                    >
                        <span>
                            Optional media provided
                        </span>

                        <strong>
                            ${progressPercentage}%
                        </strong>
                    </div>

                    <div
                        class="photo-progress mb-4"
                        role="progressbar"
                        aria-label="Optional media provided"
                        aria-valuenow="${progressPercentage}"
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        <div
                            class="photo-progress-bar ${progressClass}"
                            style="width: ${progressPercentage}%"
                        ></div>
                    </div>

                    <div class="d-grid gap-2">

                        <a
                            href="./branch-photos.html?id=${encodeURIComponent(branch.id)}"
                            class="btn btn-wusool"
                        >
                            <i class="bi bi-images me-2"></i>
                            Manage Photos
                        </a>

                        <a
                            href="./organization-branch-details.html?id=${encodeURIComponent(branch.id)}"
                            class="btn btn-outline-wusool"
                        >
                            View Branch Details
                        </a>

                    </div>

                </div>

            </article>
        </div>
    `;
  };
  const getBranchPhotos = (branch) => {
    return [...(Array.isArray(branch.photos)?branch.photos:[]),...(Array.isArray(branch.videos)?branch.videos:[])];
  };
  const getBranchPhotoStatus = (branch) => {
    const photoCount = getBranchPhotos(branch).length;
    if (photoCount === 0) {
      return 'no-photos';
    }
    if (photoCount >= requiredPhotoCount) {
      return 'complete';
    }
    return 'incomplete';
  };
  const getStatusInformation = (status) => {
    const statuses = {
      complete: {
        label: 'Provided (optional)',
        icon: 'bi-check-circle-fill',
      },
      incomplete: {
        label: 'Provided (optional)',
        icon: 'bi-exclamation-circle-fill',
      },
      'no-photos': {
        label: 'Not provided (optional)',
        icon: 'bi-image',
      },
    };
    return statuses[status];
  };
  const setTextContent = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  };
  const escapeHtml = (value) => {
    const temporaryElement = document.createElement('div');
    temporaryElement.textContent = String(value);
    return temporaryElement.innerHTML;
  };
});
