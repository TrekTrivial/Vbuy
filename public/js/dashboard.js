"use strict";

function addOrderRow(order) {
  const table = document.querySelector(".order-table");
  const row = document.createElement("tr");

  row.innerHTML = `
        <td>${order.orderID}</td>
        <td>${order.orderTotal}</td>
        <td>${order.orderDate}</td>
        <td>${order.orderStatus}</td>
        <td><a href="/order?q=${encodeURIComponent(
          order.orderID
        )}">View order</a></td>
    `;

  table.appendChild(row);
}

function addTicketRow(ticket) {
  const table = document.querySelector(".ticket-table");
  const row = document.createElement("tr");

  row.innerHTML = `
          <td>${ticket.ticketID}</td>
          <td>${ticket.issueSubject}</td>
          <td>${ticket.issueMessage}</td>
          <td>${ticket.replyMessage === null ? "N/A" : ticket.replyMessage}</td>
          <td>${ticket.ticketStatus}</td>
          <td><a href="/ticket?q=${encodeURIComponent(
            ticket.ticketID
          )}">View ticket</a></td>
      `;

  table.appendChild(row);
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const activeTab = params.get("tab");

  if (activeTab) {
    document.querySelectorAll(".tab").forEach(tab => {
      tab.style.display = "none";
    });

    const tabToShow = document.querySelector(`.tab.${activeTab}`);
    if (tabToShow) {
      tabToShow.style.display = "flex";
    }
  }

  const token = getTokenFromCookies();

  if (!isTokenValid(token)) {
    alert("Unauthorized! Please log in first!");
    window.location.href = "/login";
  }

  const otpInputs = document.querySelectorAll(".otp");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", e => {
      if (!/^\d$/.test(e.data)) {
        input.value = "";
        return;
      }

      if (input.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Backspace" && index > 0 && !input.value) {
        otpInputs[index - 1].focus();
      }
    });
  });

  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
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

    document.querySelector(
      ".name-container p"
    ).innerHTML = `${data.firstName} ${data.lastName}`;
    document.querySelector(".email").value = data.email;
    document.querySelector(".mobile").value = data.mobile_no;

    const response1 = await fetch(`${API_BASE_URL}/user/profile/address`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response1.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    const data1 = await response1.json();

    document.querySelector(".street").value = data1.street;
    document.querySelector(".city").value = data1.city;
    document.querySelector(".state").value = data1.state;
    document.querySelector(".pincode").value = data1.pincode;

    const response2 = await fetch(`${API_BASE_URL}/user/bank_details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response2.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    const data2 = await response2.json();

    if (!data2.vpaID) {
      document.querySelector(".bank-acc-container").style.display = "block";
      document.querySelector(".vpa-container").style.display = "none";

      document.querySelector(".acc-no").value = data2.accountNumber;
      document.querySelector(".acc-name").value = data2.accountHolderName;
      document.querySelector(".ifsc").value = data2.ifsc;
      document.querySelector(".branch").value = data2.bank;
      document.querySelector(".bank-type-container p").innerHTML =
        "Bank account";
      document.querySelector(".bank-change-btn").innerHTML = "Change to VPA";
    } else {
      document.querySelector(".bank-acc-container").style.display = "none";
      document.querySelector(".vpa-container").style.display = "block";
      document.querySelector(".vpa").value = data2.vpaID;
      document.querySelector(".vpa-name").value = data2.accountHolderName;
      document.querySelector(".bank-type-container p").innerHTML = "VPA";
      document.querySelector(".bank-change-btn").innerHTML = "Change to bank";
    }

    const response3 = await fetch(`${API_BASE_URL}/orders/myorders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response3.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    const data3 = await response3.json();
    if (data3.length === 0) {
      document.querySelector(".no-orders").style.display = "block";
      document.querySelector(".sub-order-container").style.display = "none";
    } else if (data3.length > 0) {
      document.querySelector(".no-orders").style.display = "none";
      document.querySelector(".sub-order-container").style.display = "block";
      data3.forEach(addOrderRow);
    }

    const response4 = await fetch(`${API_BASE_URL}/support/tickets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response4.status === 404) {
      document.querySelector(".no-tickets").style.display = "block";
      document.querySelector(".sub-ticket-container").style.display = "none";
    } else if (!response4.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    } else if (response4.ok) {
      document.querySelector(".no-tickets").style.display = "none";
      document.querySelector(".sub-ticket-container").style.display = "block";
      const data4 = await response4.json();
      data4.forEach(addTicketRow);
    }
  } catch (err) {
    console.error(err);
  }
});

document.querySelector(".profile-tab").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".profile-tab").style.borderRight =
    "3px solid #3e3e3e";
  document.querySelector(".profile-tab").style.background = "#ccc";

  document.querySelector(".orders-tab").style.borderRight = "none";
  document.querySelector(".orders-tab").style.background = "none";

  document.querySelector(".tickets-tab").style.borderRight = "none";
  document.querySelector(".tickets-tab").style.background = "none";

  document.querySelector(".settings-tab").style.borderRight = "none";
  document.querySelector(".settings-tab").style.background = "none";

  document.querySelector(".profile-container").style.display = "flex";
  document.querySelector(".orders-container").style.display = "none";
  document.querySelector(".tickets-container").style.display = "none";
  document.querySelector(".settings-container").style.display = "none";

  document.querySelector(".prof-container").style.display = "grid";
  document.querySelector(".acc-details-tab").style.borderBottom =
    "4px solid #3e3e3e";
  document.querySelector(".acc-details-tab").style.background = "#ccc";
  document.querySelector(".address-container").style.display = "none";
  document.querySelector(".bank-container").style.display = "none";
});

document.querySelector(".acc-details-tab").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".profile-tab").style.borderRight =
    "3px solid #3e3e3e";
  document.querySelector(".profile-tab").style.background = "#ccc";

  document.querySelector(".profile-container").style.display = "flex";
  document.querySelector(".orders-container").style.display = "none";
  document.querySelector(".tickets-container").style.display = "none";
  document.querySelector(".settings-container").style.display = "none";

  document.querySelector(".prof-container").style.display = "grid";
  document.querySelector(".acc-details-tab").style.borderBottom =
    "4px solid #3e3e3e";
  document.querySelector(".acc-details-tab").style.background = "#ccc";
  document.querySelector(".addr-tab").style.borderBottom = "none";
  document.querySelector(".addr-tab").style.background = "none";
  document.querySelector(".bank-tab").style.borderBottom = "none";
  document.querySelector(".bank-tab").style.background = "none";
  document.querySelector(".address-container").style.display = "none";
  document.querySelector(".bank-container").style.display = "none";
});

document.querySelector(".addr-tab").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".profile-tab").style.borderRight =
    "3px solid #3e3e3e";
  document.querySelector(".profile-tab").style.background = "#ccc";

  document.querySelector(".profile-container").style.display = "flex";
  document.querySelector(".orders-container").style.display = "none";
  document.querySelector(".tickets-container").style.display = "none";
  document.querySelector(".settings-container").style.display = "none";

  document.querySelector(".prof-container").style.display = "none";

  document.querySelector(".acc-details-tab").style.borderBottom = "none";
  document.querySelector(".acc-details-tab").style.background = "none";
  document.querySelector(".addr-tab").style.borderBottom = "4px solid #3e3e3e";
  document.querySelector(".addr-tab").style.background = "#ccc";
  document.querySelector(".bank-tab").style.borderBottom = "none";
  document.querySelector(".bank-tab").style.background = "none";
  document.querySelector(".address-container").style.display = "flex";
  document.querySelector(".bank-container").style.display = "none";
});

document.querySelector(".bank-tab").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".profile-tab").style.borderRight =
    "3px solid #3e3e3e";
  document.querySelector(".profile-tab").style.background = "#ccc";

  document.querySelector(".profile-container").style.display = "flex";
  document.querySelector(".orders-container").style.display = "none";
  document.querySelector(".tickets-container").style.display = "none";
  document.querySelector(".settings-container").style.display = "none";

  document.querySelector(".prof-container").style.display = "none";

  document.querySelector(".acc-details-tab").style.borderBottom = "none";
  document.querySelector(".acc-details-tab").style.background = "none";
  document.querySelector(".addr-tab").style.borderBottom = "none";
  document.querySelector(".addr-tab").style.background = "none";
  document.querySelector(".bank-tab").style.borderBottom = "4px solid #3e3e3e";
  document.querySelector(".bank-tab").style.background = "#ccc";

  document.querySelector(".address-container").style.display = "none";
  document.querySelector(".bank-container").style.display = "flex";
});

document.querySelector(".orders-tab").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".profile-tab").style.borderRight = "none";
  document.querySelector(".profile-tab").style.background = "none";

  document.querySelector(".orders-tab").style.borderRight = "3px solid #3e3e3e";
  document.querySelector(".orders-tab").style.background = "#ccc";

  document.querySelector(".tickets-tab").style.borderRight = "none";
  document.querySelector(".tickets-tab").style.background = "none";

  document.querySelector(".settings-tab").style.borderRight = "none";
  document.querySelector(".settings-tab").style.background = "none";

  document.querySelector(".profile-container").style.display = "none";
  document.querySelector(".orders-container").style.display = "flex";
  document.querySelector(".tickets-container").style.display = "none";
  document.querySelector(".settings-container").style.display = "none";
});

document.querySelector(".tickets-tab").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".profile-tab").style.borderRight = "none";
  document.querySelector(".profile-tab").style.background = "none";

  document.querySelector(".orders-tab").style.borderRight = "none";
  document.querySelector(".orders-tab").style.background = "none";

  document.querySelector(".tickets-tab").style.borderRight =
    "3px solid #3e3e3e";
  document.querySelector(".tickets-tab").style.background = "#ccc";

  document.querySelector(".settings-tab").style.borderRight = "none";
  document.querySelector(".settings-tab").style.background = "none";

  document.querySelector(".profile-container").style.display = "none";
  document.querySelector(".orders-container").style.display = "none";
  document.querySelector(".tickets-container").style.display = "flex";
  document.querySelector(".settings-container").style.display = "none";
});

document.querySelector(".settings-tab").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".profile-tab").style.borderRight = "none";
  document.querySelector(".profile-tab").style.background = "none";

  document.querySelector(".orders-tab").style.borderRight = "none";
  document.querySelector(".orders-tab").style.background = "none";

  document.querySelector(".tickets-tab").style.borderRight = "none";
  document.querySelector(".tickets-tab").style.background = "none";

  document.querySelector(".settings-tab").style.borderRight =
    "3px solid #3e3e3e";
  document.querySelector(".settings-tab").style.background = "#ccc";

  document.querySelector(".profile-container").style.display = "none";
  document.querySelector(".orders-container").style.display = "none";
  document.querySelector(".tickets-container").style.display = "none";
  document.querySelector(".settings-container").style.display = "flex";
});

document.querySelector(".del-acc-btn").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".del-cfm-label").removeAttribute("hidden");
  document.querySelector(".del-cfm").removeAttribute("hidden");
  document.querySelector(".del-cfm-btn").removeAttribute("hidden");
});

document.querySelector(".del-cfm").addEventListener("change", function (e) {
  e.preventDefault();

  if (this.value === "Confirm") {
    document.querySelector(".del-cfm-btn").style.pointerEvents = "auto";
  } else {
    document.querySelector(".del-cfm-btn").style.pointerEvents = "none";
  }
});

document.querySelector(".del-cfm-btn").addEventListener("click", async e => {
  e.preventDefault();

  const token = getTokenFromCookies();

  try {
    const response = await fetch(`${API_BASE_URL}/user/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    window.location.href = "/";
  } catch (err) {
    console.error(err);
  }
});

document.querySelector(".change-email").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".email").removeAttribute("disabled");
  document.querySelector(".otp-btn").style.pointerEvents = "auto";
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const email = document.querySelector(".email");

  document.querySelector(".otp-btn").addEventListener("click", async ev => {
    ev.preventDefault();

    if (email.value == "" || !emailRegex.test(email.value)) {
      document.querySelector(".email-error span").innerHTML =
        "Email is invalid!";
      document.querySelector(".email-error").style.visibility = "visible";
      return;
    } else {
      document.querySelector(".email-error").style.visibility = "hidden";
    }

    const name = document.querySelector(".name-container p");
    const body = {
      name: name.innerHTML,
      email: email.value,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/user/request_otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      const data = await response.json();

      email.setAttribute("disabled", "true");
      document.querySelector(".otp-btn").style.pointerEvents = "none";
      document.querySelector(".otp-container").style.display = "flex";

      document
        .querySelector(".verify-otp-btn")
        .addEventListener("click", async eve => {
          eve.preventDefault();
          const otpInput = document.querySelectorAll(".otp");

          const otpValue = Array.from(otpInput)
            .map(input => input.value)
            .join("");

          if (otpValue.length !== 6) {
            document.querySelector(".otp-error span").innerHTML =
              "Invalid OTP!";
            document.querySelector(".otp-error").style.visibility = "visible";
            return;
          } else {
            document.querySelector(".otp-error").style.visibility = "hidden";
          }

          const response1 = await fetch(`${API_BASE_URL}/user/verify_otp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email.value, otp: otpValue }),
          });

          if (response1.status === 403) {
            document.querySelector(".otp-error span").innerHTML = "Invalid OTP";
            document.querySelector(".otp-error").style.visibility = "visible";
            return;
          } else if (response1.status === 400) {
            document.querySelector(".otp-error span").innerHTML =
              "OTP has expired. Please request a new one!";
            document.querySelector(".otp-error").style.visibility = "visible";
            return;
          }
          if (!response1.ok) {
            alert("Something went wrong!");
            throw new Error("Error");
          }

          const token = getTokenFromCookies();

          const response2 = await fetch(`${API_BASE_URL}/user/update`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: email.value }),
          });

          if (!response2.ok) {
            alert("Something went wrong!");
            throw new Error("Error");
          }

          document.querySelector(".otp-tick").removeAttribute("hidden");
          document.querySelector(".verify-otp-btn").style.pointerEvents =
            "none";
          document.querySelector(".otp").setAttribute("disabled", "true");
          setTimeout(() => {
            document.querySelector(".otp-container").style.display = "none";
          }, 3000);
        });
    } catch (err) {
      console.error(err);
    }
  });
});

document.querySelector(".change-mobile").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".mobile").removeAttribute("disabled");
  document.querySelector(".mobile-btn").style.pointerEvents = "auto";

  document.querySelector(".mobile-btn").addEventListener("click", async ev => {
    ev.preventDefault();

    const token = getTokenFromCookies();

    const mobile = document.querySelector(".mobile");

    const mobileRegex = /^[6-9]\d{9}$/;
    if (mobile.value == "" || !mobileRegex.test(mobile.value)) {
      document.querySelector(".mobile-error span").innerHTML =
        "Mobile number is invalid!";
      document.querySelector(".mobile-error").style.visibility = "visible";
      return;
    } else {
      document.querySelector(".mobile-error").style.visibility = "hidden";
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobile_no: mobile.value }),
      });

      if (!response.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      document.querySelector(".mobile").setAttribute("disabled", "true");
      document.querySelector(".mobile-btn").style.pointerEvents = "none";
    } catch (err) {
      console.error(err);
    }
  });
});

document.querySelector(".change-pwd").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".pwd-change-container").style.display = "flex";

  document
    .querySelector(".pwd-verify-btn")
    .addEventListener("click", async ev => {
      ev.preventDefault();

      const oldPassword = document.querySelector(".old-pwd");
      const token = getTokenFromCookies();

      try {
        const response = await fetch(`${API_BASE_URL}/user/verify_pwd`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: oldPassword.value }),
        });

        if (response.status === 400) {
          document.querySelector(".old-pwd-error span").innerHTML =
            "Wrong password";
          document.querySelector(".old-pwd-error").style.visibility = "visible";
          return;
        } else if (!response.ok) {
          alert("Something went wrong!");
          throw new Error("Error");
        }

        document.querySelector(".pwd-tick").removeAttribute("hidden");
        document.querySelector(".old-pwd").setAttribute("disabled", "true");
        document.querySelector(".new-pwd").removeAttribute("disabled");
        document.querySelector(".new-cfm-pwd").removeAttribute("disabled");
        document.querySelector(".pwd-cancel-btn").style.pointerEvents = "auto";
        document.querySelector(".pwd-change-btn").style.pointerEvents = "auto";
        document.querySelector(".pwd-verify-btn").style.pointerEvents = "none";

        document
          .querySelector(".pwd-change-btn")
          .addEventListener("click", async eve => {
            eve.preventDefault();

            const newPassword = document.querySelector(".new-pwd");
            const newCfmPassword = document.querySelector(".new-cfm-pwd");

            if (
              newPassword.value.length < 10 ||
              newPassword.value !== newCfmPassword.value ||
              newPassword.value.trim() == "" ||
              newCfmPassword.value.trim() == ""
            ) {
              document.querySelector(".new-pwd-error span").innerHTML =
                "Invalid passwords!";
              document.querySelector(".new-pwd-error").style.visibility =
                "visible";
              return;
            } else {
              document.querySelector(".new-pwd-error").style.visibility =
                "hidden";
            }

            const response1 = await fetch(`${API_BASE_URL}/user/update`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ passwd: newPassword.value }),
            });

            if (!response1.ok) {
              alert("Something went wrong!");
              throw new Error("Error");
            }

            document.querySelector(".new-pwd-tick").removeAttribute("hidden");
            document.querySelector(".new-pwd").setAttribute("disabled", "true");
            document
              .querySelector(".new-cfm-pwd")
              .setAttribute("disabled", "true");
            setTimeout(() => {
              document.querySelector(".pwd-change-container").style.display =
                "none";
            }, 3000);
          });
      } catch (err) {
        console.error(err);
      }
    });
});

document.querySelector(".pwd-cancel-btn").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".old-pwd").removeAttribute("disabled");
  document.querySelector(".new-pwd").setAttribute("disabled", "true");
  document.querySelector(".new-cfm-pwd").setAttribute("disabled", "true");
  document.querySelector(".pwd-verify-btn").style.pointerEvents = "auto";
  document.querySelector(".pwd-change-btn").style.pointerEvents = "none";
  document.querySelector(".pwd-change-container").style.display = "none";
});

document.querySelector(".address-btn").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".street").removeAttribute("disabled");
  document.querySelector(".city").removeAttribute("disabled");
  document.querySelector(".state").removeAttribute("disabled");
  document.querySelector(".pincode").removeAttribute("disabled");
  document.querySelector(".address-cfm-btn").style.pointerEvents = "auto";
});

document
  .querySelector(".address-cfm-btn")
  .addEventListener("click", async e => {
    e.preventDefault();

    const street = document.querySelector(".street");
    const city = document.querySelector(".city");
    const state = document.querySelector(".state");
    const pincode = document.querySelector(".pincode");

    const body = {
      street: street.value,
      city: city.value,
      state_: state.value,
      pincode: pincode.value,
    };

    const token = getTokenFromCookies();

    try {
      const response = await fetch(`${API_BASE_URL}/user/update/address`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      document.querySelector(".addr-tick").removeAttribute("hidden");
      document.querySelector(".street").setAttribute("disabled", "true");
      document.querySelector(".city").setAttribute("disabled", "true");
      document.querySelector(".state").setAttribute("disabled", "true");
      document.querySelector(".pincode").setAttribute("disabled", "true");
      document.querySelector(".address-cfm-btn").style.pointerEvents = "none";
    } catch (err) {
      console.error(err);
    }
  });

document.querySelector(".bank-btn").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector(".bank-change-btn").style.pointerEvents = "auto";
  document.querySelector(".bank-cfm-btn").style.pointerEvents = "auto";
  document.querySelector(".vpa").removeAttribute("disabled");
  document.querySelector(".vpa-name").removeAttribute("disabled");
  document.querySelector(".acc-no").removeAttribute("disabled");
  document.querySelector(".acc-name").removeAttribute("disabled");
  document.querySelector(".ifsc").removeAttribute("disabled");
  document.querySelector(".ifsc-verify-btn").style.pointerEvents = "auto";
});

document.querySelector(".bank-change-btn").addEventListener("click", e => {
  e.preventDefault();

  const type = document.querySelector(".bank-type-container p");

  if (type.innerHTML === "VPA") {
    document.querySelector(".bank-acc-container").style.display = "block";
    document.querySelector(".vpa-container").style.display = "none";

    document.querySelector(".acc-no").value = "";
    document.querySelector(".acc-name").value = "";
    document.querySelector(".ifsc").value = "";
    document.querySelector(".branch").value = "";

    document.querySelector(".bank-type-container p").innerHTML = "Bank account";
    document.querySelector(".bank-change-btn").style.display = "none";
    document.querySelector(".bank-cfm-btn").style.pointerEvents = "none";
    document.querySelector(".ifsc-verify-btn").style.pointerEvents = "auto";
  } else if (type.innerHTML === "Bank account") {
    document.querySelector(".bank-acc-container").style.display = "none";
    document.querySelector(".vpa-container").style.display = "block";

    document.querySelector(".vpa").value = "";
    document.querySelector(".vpa-name").value = "";

    document.querySelector(".bank-type-container p").innerHTML = "VPA";
    document.querySelector(".bank-change-btn").style.display = "none";
  }
});

document
  .querySelector(".ifsc-verify-btn")
  .addEventListener("click", async e => {
    e.preventDefault();

    const accountNumber = document.querySelector(".acc-no");
    const accountHolderName = document.querySelector(".acc-name");
    const ifsc = document.querySelector(".ifsc");
    const branch = document.querySelector(".branch");

    if (accountNumber.value == "" || isNaN(accountNumber.value)) {
      document.querySelector(".acc-no-error span").innerHTML =
        "Invalid account number!";
      document.querySelector(".acc-no-error").style.visibility = "visible";
      return;
    } else {
      document.querySelector(".acc-no-error").style.visibility = "hidden";
    }

    if (accountHolderName.value == "") {
      document.querySelector(".acc-name-error span").innerHTML =
        "Invalid account holder name!";
      document.querySelector(".acc-name-error").style.visibility = "visible";
      return;
    } else {
      document.querySelector(".acc-name-error").style.visibility = "hidden";
    }

    if (ifsc.value.length !== 11) {
      document.querySelector(".ifsc-error span").innerHTML =
        "Invalid IFS code!";
      document.querySelector(".ifsc-error").style.visibility = "visible";
      return;
    } else {
      document.querySelector(".ifsc-error").style.visibility = "hidden";
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/validate_ifsc/${ifsc.value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      const data = await response.json();

      branch.value = data.bank_branch;
      document.querySelector(".ifsc-verify-btn").style.pointerEvents = "none";
      document.querySelector(".bank-cfm-btn").style.pointerEvents = "auto";
    } catch (err) {
      console.error(err);
    }
  });

document.querySelector(".bank-cfm-btn").addEventListener("click", async e => {
  e.preventDefault();

  const token = getTokenFromCookies();

  const type = document.querySelector(".bank-type-container p");

  if (type.innerHTML === "Bank account") {
    const accountNumber = document.querySelector(".acc-no");
    const accountHolderName = document.querySelector(".acc-name");
    const ifsc = document.querySelector(".ifsc");

    const bankDetails = {
      accountNumber: accountNumber.value,
      ifsc: ifsc.value,
      accountHolderName: accountHolderName.value,
    };

    const response = await fetch(`${API_BASE_URL}/user/bank_details/modify`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "bank",
        bankDetails,
      }),
    });

    if (!response.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    document.querySelector(".bank-tick").removeAttribute("hidden");
    setTimeout(() => {
      document.querySelector(".bank-tick").setAttribute("hidden", "true");
    }, 3000);
    accountNumber.setAttribute("disabled", "true");
    accountHolderName.setAttribute("disabled", "true");
    ifsc.setAttribute("disabled", "true");
  } else if (type.innerHTML === "VPA") {
    const vpa_id = document.querySelector(".vpa");
    const vpa_name = document.querySelector(".vpa-name");
    const bankDetails = {
      vpa_id: vpa_id.value,
      vpa_name: vpa_name.value,
    };

    const response = await fetch(`${API_BASE_URL}/user/bank_details/modify`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "vpa",
        bankDetails,
      }),
    });

    if (!response.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    document.querySelector(".bank-tick").removeAttribute("hidden");
    setTimeout(() => {
      document.querySelector(".bank-tick").setAttribute("hidden", "true");
    }, 3000);
    vpa_id.setAttribute("disabled", "true");
    vpa_name.setAttribute("disabled", "true");
  }
});
