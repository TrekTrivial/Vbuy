"use strict";

const subject = document.querySelector(".subject");
const message = document.querySelector(".message");

const validateTicketData = () => {
  let isValid = true;

  if (subject.value === "") {
    document.querySelector(".subject-error span").innerHTML = "Invalid input!";
    document.querySelector(".subject-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".subject-error").style.visibility = "hidden";
  }

  if (message.value === "") {
    document.querySelector(".message-error span").innerHTML = "Invalid input!";
    document.querySelector(".message-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".message-error").style.visibility = "hidden";
  }
  return isValid;
};

document
  .querySelector(".submit-ticket-btn")
  .addEventListener("click", async e => {
    e.preventDefault();

    const token = getTokenFromCookies();
    if (!isTokenValid(token)) {
      alert("Unauthorized! Please login first!");
      return;
    }

    if (!validateTicketData()) {
      return;
    }

    const ticket = {
      issueSubject: subject.value,
      issueMessage: message.value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/support/raise`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      });

      if (!response.ok) {
        alert("Something went wrong!");
        throw new error("Error");
      }

      const data = await response.json();

      if (response.ok) {
        alert("Support ticket created!");
        window.location.href = `/ticket?q=${encodeURIComponent(data.ticketID)}`;
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  });
