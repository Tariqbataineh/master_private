
"use strict";

const rows = WusoolDataService.getOrganizations().map((org) => {
    const branches = WusoolDataService.getBranches({
        organizationId: org.id
    });

    const avg = branches.length
        ? Math.round(
            branches.reduce((sum, x) => sum + Number(x.accessibilityScore || 0), 0) /
            branches.length
        )
        : 0;

    return {
        name: org.name,
        count: branches.length,
        avg,
        approved: branches.filter((x) => x.status === "approved").length,
        review: branches.filter((x) => x.status === "needs review" || x.status === "pending").length
    };
});

document.getElementById("benchmarkBody").innerHTML = rows.map((row) => `
    <tr>
        <td><strong>${row.name}</strong></td>
        <td>${row.count}</td>
        <td>${row.avg}%</td>
        <td>${row.approved}</td>
        <td>${row.review}</td>
    </tr>
`).join("");
