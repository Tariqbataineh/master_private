
"use strict";

const KEY = "documents";
let documents = WusoolFeatureStore.read(KEY, []);
const orgSelect = document.getElementById("documentOrganization");
const list = document.getElementById("documentsList");
const search = document.getElementById("documentSearch");

const loadOrganizations = () => {
    orgSelect.innerHTML = WusoolDataService.getOrganizations()
        .map((item) => `<option value="${item.id}">${item.name}</option>`)
        .join("");
};

const persist = () => WusoolFeatureStore.write(KEY, documents);

const render = () => {
    const q = search.value.trim().toLowerCase();

    const filtered = documents.filter((item) => {
        const org = WusoolDataService.getOrganizationById(item.organizationId);

        return [
            item.name,
            item.type,
            item.status,
            org?.name || ""
        ].join(" ").toLowerCase().includes(q);
    });

    list.innerHTML = filtered.length
        ? filtered.map((item) => {
            const org = WusoolDataService.getOrganizationById(item.organizationId);

            return `
                <div class="admin-feature-row">
                    <span class="item-icon"><i class="bi bi-file-earmark-text"></i></span>

                    <div class="flex-grow-1">
                        <strong class="d-block">${item.name}</strong>
                        <small class="text-secondary">
                            ${item.type} · ${org?.name || "Unknown organization"}
                            ${item.expiry ? ` · Expires ${item.expiry}` : ""}
                        </small>
                    </div>

                    <span class="badge ${item.status === "Approved" ? "badge-soft-success" : item.status === "Rejected" ? "badge-soft-danger" : "badge-soft-warning"}">
                        ${item.status}
                    </span>

                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-success" data-status="${item.id}" data-value="Approved">Approve</button>
                        <button class="btn btn-sm btn-outline-warning" data-status="${item.id}" data-value="Pending">Pending</button>
                        <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join("")
        : `<p class="text-secondary mb-0">No documents found.</p>`;
};

document.getElementById("addDocument").addEventListener("click", () => {
    const name = document.getElementById("documentName").value.trim();

    if (!name) {
        WusoolAdmin.toast("Enter a file name.", "warning");
        return;
    }

    documents.unshift({
        id: WusoolFeatureStore.id("document"),
        organizationId: orgSelect.value,
        type: document.getElementById("documentType").value,
        name,
        expiry: document.getElementById("documentExpiry").value,
        status: "Pending",
        createdAt: new Date().toISOString()
    });

    persist();
    render();
});

list.addEventListener("click", (event) => {
    const status = event.target.closest("[data-status]");
    const remove = event.target.closest("[data-delete]");

    if (status) {
        const item = documents.find((x) => x.id === status.dataset.status);
        if (item) {
            item.status = status.dataset.value;
            persist();
            render();
        }
    }

    if (remove) {
        documents = documents.filter((x) => x.id !== remove.dataset.delete);
        persist();
        render();
    }
});

search.addEventListener("input", render);

loadOrganizations();
render();
