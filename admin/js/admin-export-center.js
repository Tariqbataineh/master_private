
"use strict";

const getters = {
    organizations: () => WusoolDataService.getOrganizations(),
    branches: () => WusoolDataService.getBranches(),
    users: () => WusoolDataService.getUsers(),
    tickets: () => WusoolDataService.getTickets(),
    reviews: () => WusoolDataService.getReviews(),
    subscriptions: () => WusoolDataService.getSubscriptions()
};

const toCsv = (rows) => {
    if (!rows.length) {
        return "";
    }

    const headers = Array.from(
        new Set(rows.flatMap((row) => Object.keys(row)))
    );

    const escape = (value) => {
        const text =
            typeof value === "object"
                ? JSON.stringify(value)
                : String(value ?? "");

        return `"${text.replace(/"/g, '""')}"`;
    };

    return [
        headers.map(escape).join(","),
        ...rows.map((row) =>
            headers.map((header) => escape(row[header])).join(",")
        )
    ].join("\n");
};

document.getElementById("exportButton").addEventListener("click", () => {
    const entity = document.getElementById("exportEntity").value;
    const format = document.getElementById("exportFormat").value;
    const rows = getters[entity]();

    if (format === "json") {
        WusoolAdmin.downloadText(
            `${entity}.json`,
            JSON.stringify(rows, null, 2),
            "application/json"
        );
    } else {
        WusoolAdmin.downloadText(
            `${entity}.csv`,
            toCsv(rows),
            "text/csv"
        );
    }
});
