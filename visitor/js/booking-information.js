document.addEventListener("DOMContentLoaded", () => {
  setMinimumBookingDate();
  initializeBookingPreview();
  initializeFormChanges();
});

const setMinimumBookingDate = () => {
  const dateInput = document.getElementById("visitDate");

  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  dateInput.min = `${year}-${month}-${day}`;
};

const initializeBookingPreview = () => {
  const bookingForm = document.getElementById("bookingPreviewForm");

  const modalElement = document.getElementById("loginRequiredModal");

  const loginRequiredModal = new bootstrap.Modal(modalElement);

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    updateBookingSummary();

    loginRequiredModal.show();
  });
};

const initializeFormChanges = () => {
  const formElements = document.querySelectorAll(
    "#bookingPreviewForm select, " + "#bookingPreviewForm input",
  );

  formElements.forEach((element) => {
    element.addEventListener("change", updateBookingSummary);
  });
};

const getSelectedText = (selectId) => {
  const select = document.getElementById(selectId);

  if (!select.value) {
    return "Not selected";
  }

  return select.options[select.selectedIndex].text;
};

const updateBookingSummary = () => {
  const branch = getSelectedText("branch");

  const purpose = getSelectedText("visitPurpose");

  const date = document.getElementById("visitDate").value || "Not selected";

  const time = getSelectedText("visitTime");

  const equipment = getSelectedText("equipment");

  const staffAssistance = document.getElementById("staffAssistance").checked;

  const navigationSupport =
    document.getElementById("navigationSupport").checked;

  const selectedSupport = [];

  if (staffAssistance) {
    selectedSupport.push("Staff Assistance");
  }

  if (navigationSupport) {
    selectedSupport.push("Navigation Support");
  }

  const support =
    selectedSupport.length > 0
      ? selectedSupport.join(", ")
      : "No support selected";

  const bookingSummary = document.getElementById("bookingSummary");

  const summaryContent = document.getElementById("bookingSummaryContent");

  summaryContent.innerHTML = `
        <div class="row">

            <div class="col-md-6">
                <p>
                    <strong>Branch:</strong>
                    ${branch}
                </p>

                <p>
                    <strong>Purpose:</strong>
                    ${purpose}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${date}
                </p>
            </div>

            <div class="col-md-6">
                <p>
                    <strong>Time:</strong>
                    ${time}
                </p>

                <p>
                    <strong>Support:</strong>
                    ${support}
                </p>

                <p>
                    <strong>Equipment:</strong>
                    ${equipment}
                </p>
            </div>

        </div>
    `;

  bookingSummary.classList.remove("d-none");
};
