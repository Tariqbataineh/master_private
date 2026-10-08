"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const ticketStorageKey = "wusoolUserTickets";
  const defaultTickets = [];
  let tickets = [];
  let selectedTicket = null;
  WusoolUI.ready(async () => {
    await initializeTicketDetails();
  });
  const initializeTicketDetails = async () => {
    tickets = await loadTickets();
    const ticketId = getTicketId();
    selectedTicket = tickets.find(ticket => {
      return ticket.id === ticketId;
    });
    if (!selectedTicket) {
      showTicketNotFound();
      return;
    }
    displayTicket();
    connectTicketEvents();
  };
  const loadTickets = async () => {
    const storedTickets = await WusoolServices.rawRead(ticketStorageKey);
    if (storedTickets) {
      try {
        const parsedTickets = JSON.parse(storedTickets);
        if (Array.isArray(parsedTickets)) {
          return parsedTickets;
        }
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        console.error("Unable to load tickets:", error);
      }
    }
    await WusoolServices.rawWrite(ticketStorageKey, JSON.stringify(defaultTickets));
    return [...defaultTickets];
  };
  const getTicketId = () => {
    const parameters = new URLSearchParams(window.location.search);
    return parameters.get("id") || 1;
  };
  const displayTicket = () => {
    document.getElementById("ticketNumber").textContent = `#${WusoolUI.escape(selectedTicket.number)}`;
    document.getElementById("ticketSubject").textContent = selectedTicket.subject;
    document.getElementById("ticketType").textContent = selectedTicket.type;
    document.getElementById("ticketDate").textContent = formatDate(selectedTicket.createdAt);
    document.getElementById("ticketDescription").textContent = selectedTicket.description;
    document.getElementById("userName").textContent = selectedTicket.user.name;
    document.getElementById("userEmail").textContent = selectedTicket.user.email;
    document.getElementById("userPhone").textContent = selectedTicket.user.phone;
    document.getElementById("branchName").textContent = selectedTicket.branch.name;
    document.getElementById("branchLocation").textContent = selectedTicket.branch.location;
    document.getElementById("viewBranchLink").href = `./organization-branch-details.html?id=${WusoolUI.escape(selectedTicket.branch.id)}`;
    document.getElementById("ticketStatus").value = selectedTicket.status;
    document.title = `${WusoolUI.escape(selectedTicket.number)} | Wusool`;
    updateStatusBadge();
    renderTicketImages();
    renderResponseHistory();
  };
  const connectTicketEvents = () => {
    WusoolUI.listen(document.getElementById("saveStatusButton"), "click", saveTicketStatus);
    WusoolUI.listen(document.getElementById("ticketReplyForm"), "submit", sendTicketResponse);
    WusoolUI.listen(document.getElementById("ticketReply"), "input", updateReplyCount);
  };
  const saveTicketStatus = async () => {
    selectedTicket.status = document.getElementById("ticketStatus").value;
    addHistoryItem("Organization Manager", `Ticket status changed to ${getStatusLabel(selectedTicket.status)}.`);
    await saveTickets();
    updateStatusBadge();
    renderResponseHistory();
    showSuccessMessage("Ticket status updated successfully.");
  };
  const sendTicketResponse = async event => {
    event.preventDefault();
    const form = document.getElementById("ticketReplyForm");
    const replyInput = document.getElementById("ticketReply");
    const responseMessage = replyInput.value.trim();
    if (!responseMessage) {
      form.classList.add("was-validated");
      return;
    }
    selectedTicket.responses.push({
      sender: "Organization Manager",
      message: responseMessage,
      createdAt: new Date().toISOString()
    });
    if (selectedTicket.status === "open") {
      selectedTicket.status = "in-progress";
      document.getElementById("ticketStatus").value = "in-progress";
    }
    await saveTickets();
    updateStatusBadge();
    renderResponseHistory();
    replyInput.value = "";
    form.classList.remove("was-validated");
    updateReplyCount();
    showSuccessMessage("Response saved to the shared support conversation. Email delivery has not been confirmed.");
  };
  const addHistoryItem = (sender, message) => {
    selectedTicket.responses.push({
      sender,
      message,
      createdAt: new Date().toISOString()
    });
  };
  const saveTickets = async () => {
    const ticketIndex = tickets.findIndex(ticket => {
      return ticket.id === selectedTicket.id;
    });
    if (ticketIndex !== -1) {
      tickets[ticketIndex] = selectedTicket;
    }
    await WusoolServices.rawWrite(ticketStorageKey, JSON.stringify(tickets));
  };
  const updateStatusBadge = () => {
    const statusBadge = document.getElementById("ticketStatusBadge");
    statusBadge.className = `ticket-status status-${WusoolUI.escape(selectedTicket.status)}`;
    statusBadge.textContent = getStatusLabel(selectedTicket.status);
  };
  const getStatusLabel = status => {
    const statusLabels = {
      open: "Open",
      "in-progress": "In Progress",
      resolved: "Resolved"
    };
    return statusLabels[status] || "Open";
  };
  const renderTicketImages = () => {
    const imagesContainer = document.getElementById("ticketImagesContainer");
    const emptyAttachments = document.getElementById("emptyAttachments");
    WusoolUI.html(imagesContainer, "");
    if (!selectedTicket.images || selectedTicket.images.length === 0) {
      emptyAttachments.classList.remove("d-none");
      return;
    }
    emptyAttachments.classList.add("d-none");
    selectedTicket.images.forEach((image, index) => {
      const imageColumn = document.createElement("div");
      imageColumn.className = "col-12 col-md-6";
      WusoolUI.html(imageColumn, `
            <img
                src="${escapeHtml(image)}"
                class="ticket-image"
                alt="Ticket evidence ${index + 1}"
            >
        `);
      imagesContainer.appendChild(imageColumn);
    });
  };
  const renderResponseHistory = () => {
    const historyContainer = document.getElementById("responseHistory");
    WusoolUI.html(historyContainer, "");
    if (!selectedTicket.responses || selectedTicket.responses.length === 0) {
      WusoolUI.html(historyContainer, `
            <p class="text-secondary mb-0">
                No responses have been added yet.
            </p>
        `);
      return;
    }
    [...selectedTicket.responses].reverse().forEach(response => {
      const historyItem = document.createElement("article");
      historyItem.className = "history-item";
      WusoolUI.html(historyItem, `
                <div class="history-icon">
                    <i class="bi bi-chat-left-text"></i>
                </div>

                <div>
                    <div
                        class="d-flex flex-column flex-sm-row
                               justify-content-between gap-2"
                    >
                        <strong>
                            ${escapeHtml(response.sender)}
                        </strong>

                        <span class="history-date">
                            ${formatDate(response.createdAt)}
                        </span>
                    </div>

                    <p class="text-secondary mb-0 mt-2">
                        ${escapeHtml(response.message)}
                    </p>
                </div>
            `);
      historyContainer.appendChild(historyItem);
    });
  };
  const updateReplyCount = () => {
    const replyLength = document.getElementById("ticketReply").value.length;
    document.getElementById("replyCharacterCount").textContent = replyLength;
  };
  const showSuccessMessage = message => {
    const successAlert = document.getElementById("successAlert");
    document.getElementById("successMessage").textContent = message;
    successAlert.classList.remove("d-none");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    window.setTimeout(() => {
      successAlert.classList.add("d-none");
    }, 4000);
  };
  const formatDate = dateValue => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(dateValue));
  };
  const escapeHtml = value => {
    const temporaryElement = document.createElement("div");
    temporaryElement.textContent = String(value ?? "");
    return temporaryElement.innerHTML;
  };
  const showTicketNotFound = () => {
    WusoolUI.html(document.querySelector("main"), `
        <section class="container py-5 text-center">
            <i class="bi bi-ticket-detailed display-2 text-warning"></i>

            <h1 class="mt-3">Ticket Not Found</h1>

            <p class="text-secondary">
                The requested ticket does not exist.
            </p>

            <a
                href="./visitor-tickets.html"
                class="btn btn-wusool"
            >
                Return to User Tickets
            </a>
        </section>
    `);
  };
});
