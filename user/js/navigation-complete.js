"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const savedSession = localStorage.getItem("wusool-navigation-session");

  if (!savedSession) {
    window.location.href = "./my-visits.html";
    return;
  }

  let session;

  try {
    session = JSON.parse(savedSession);
  } catch {
    window.location.href = "./my-visits.html";
    return;
  }

  const guidanceLabels = {
    text: "Text",
    voice: "Voice",
    both: "Text & Voice",
  };

  document.getElementById("completePlace").textContent =
    session.placeName || "Not available";
  document.getElementById("completeBranch").textContent =
    session.branchName || "Not available";
  document.getElementById("completeDestination").textContent =
    session.destination || "Not available";
  document.getElementById("completeGuidance").textContent =
    guidanceLabels[session.guidanceMethod] || "Text & Voice";

  document.getElementById("visitDetailsLink").href =
    `./visit-details.html?id=${session.visitId}`;
});
