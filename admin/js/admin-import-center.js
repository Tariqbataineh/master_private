
"use strict";

let parsedRows = [];

const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);

    if (!lines.length) {
        return [];
    }

    const headers = lines[0].split(",").map((x) => x.trim());

    return lines.slice(1).map((line) => {
        const values = line.split(",");

        return headers.reduce((obj, header, index) => {
            obj[header] = (values[index] || "").trim();
            return obj;
        }, {});
    });
};

document.getElementById("previewImport").addEventListener("click", async () => {
    const file = document.getElementById("importFile").files?.[0];

    if (!file) {
        WusoolAdmin.toast("Choose a file.", "warning");
        return;
    }

    const text = await file.text();

    try {
        parsedRows =
            file.name.toLowerCase().endsWith(".json")
                ? JSON.parse(text)
                : parseCsv(text);

        if (!Array.isArray(parsedRows)) {
            throw new Error("File must contain an array of rows.");
        }

        document.getElementById("importPreview").textContent =
            JSON.stringify(parsedRows.slice(0, 20), null, 2);

        document.getElementById("runImport").disabled =
            parsedRows.length === 0;

        WusoolAdmin.toast(`${parsedRows.length} rows ready.`);
    } catch (error) {
        parsedRows = [];
        document.getElementById("importPreview").textContent = error.message;
        document.getElementById("runImport").disabled = true;
    }
});

document.getElementById("runImport").addEventListener("click", () => {
    const entity = document.getElementById("importEntity").value;

    const savers = {
        organizations: (row) => WusoolDataService.saveOrganization(row),
        branches: (row) => WusoolDataService.saveBranch(row),
        users: (row) => WusoolDataService.saveUser(row)
    };

    parsedRows.forEach((row) => savers[entity](row));

    WusoolAdmin.toast(`${parsedRows.length} rows imported.`);
});
