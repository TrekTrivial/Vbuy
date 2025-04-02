"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const token = getTokenFromCookies();
  if (!isTokenValid(token)) {
    alert("Unauthorized! Please login first!");
    window.location.href = "/login";
  }
  const params = new URLSearchParams(window.location.search);
  const ticketID = params.get("q");
  document.querySelector(".ticket-heading").innerHTML = `Ticket ${ticketID}`;
  const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    alert("Something went wrong!");
    throw new Error("Error");
  }

  const data = await response.json();

  document.querySelector(".ticket-subject").innerHTML = data.issueSubject;
  document.querySelector(".ticket-message").innerHTML = data.issueMessage;
  document.querySelector(".ticket-reply").innerHTML =
    data.replyMessage === "" || data.replyMessage === null
      ? "N/A"
      : data.replyMessage;
  document.querySelector(".ticket-status").innerHTML = data.ticketStatus;
});
