
"use strict";

const entries = WusoolDataService.getAuditLog();

const container = document.querySelector(
    ".container-fluid.px-3.px-md-4.px-xl-5.py-4"
);

const safeJson = (value) => {
    if (!value) {
        return "-";
    }

    return JSON.stringify(value, null, 2)
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

if (container) {
    container.innerHTML = `
        <article class="content-card">
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead>
                        <tr>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>ID</th>
                            <th>Time</th>
                            <th>Details</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${
                            entries.length
                                ? entries.map((entry) => `
                                    <tr>
                                        <td>${entry.actor}</td>
                                        <td>${entry.action}</td>
                                        <td>${entry.entityType}</td>
                                        <td><code>${entry.entityId}</code></td>
                                        <td>${new Date(entry.timestamp).toLocaleString()}</td>
                                        <td>
                                            <button
                                                class="btn btn-sm btn-outline-secondary"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#audit-${entry.id}"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>

                                    <tr class="collapse" id="audit-${entry.id}">
                                        <td colspan="6">
                                            <div class="row g-3">
                                                <div class="col-md-6">
                                                    <strong class="d-block mb-2">Before</strong>
                                                    <pre class="bg-light p-3 rounded-3">${safeJson(entry.oldValue)}</pre>
                                                </div>
                                                <div class="col-md-6">
                                                    <strong class="d-block mb-2">After</strong>
                                                    <pre class="bg-light p-3 rounded-3">${safeJson(entry.newValue)}</pre>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                `).join("")
                                : `
                                    <tr>
                                        <td colspan="6" class="text-center py-5 text-secondary">
                                            No audit entries yet.
                                        </td>
                                    </tr>
                                `
                        }
                    </tbody>
                </table>
            </div>
        </article>
    `;
}
