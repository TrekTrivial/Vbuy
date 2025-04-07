"use strict";

const params = new URLSearchParams(window.location.search);
const orderID = params.get("q");
document.querySelector(".order-heading").innerHTML = `Order #${orderID}`;
document.querySelector(".order-id").innerHTML = `${orderID}`;

const token = getTokenFromCookies();

if (!isTokenValid(token)) {
  alert("Unauthorized! Please log in first!");
  window.location.href = "/login";
}

async function makeCartTable(cart) {
  const table = document.querySelector(".items-table");

  const len = cart.isbn.length;

  try {
    for (let i = 0; i < len; ++i) {
      const row = document.createElement("tr");

      const isbn = cart.isbn[i];

      const response = await fetch(`${API_BASE_URL}/orders/book/${isbn}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      const details = await response.json();

      row.innerHTML = `
          <td>${i + 1}</td>
          <td>${isbn}</td>
          <td>${details.title}, ${details.authors}</td>
          <td>${cart.costPrice[i]}</td>
          <td>${cart.quantity[i]}</td>
          <td>${cart.costPrice[i] * cart.quantity[i]}</td>
      `;
      table.appendChild(row);
    }
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch(`${API_BASE_URL}/orders/cart/done`, {
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

  await makeCartTable(data[0]);

  let totalItems = 0;
  data[0].quantity.forEach(num => (totalItems += num));

  document.querySelector(".order-count").innerHTML = totalItems;
  document.querySelector(
    ".order-total"
  ).innerHTML = `Rs. ${data[0].cartTotal}.00`;

  const response1 = await fetch(`${API_BASE_URL}/orders/shipping/${orderID}`, {
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

  document
    .querySelector(".track-order-btn")
    .setAttribute("href", `https://shiprocket.co/tracking/${data1.AWBnumber}`);

  document
    .querySelector(".invoice-btn")
    .setAttribute("href", data1.invoiceLink);
  document.querySelector(".ship-status").innerHTML =
    data1.AWBnumber === "" ||
    data1.AWBnumber === undefined ||
    data1.AWBnumber === null
      ? "Await pickup info"
      : data1.shippingStatus;
  document.querySelector(".awb").innerHTML =
    data1.AWBnumber === "" ||
    data1.AWBnumber === undefined ||
    data1.AWBnumber === null
      ? "N/A"
      : data1.AWBnumber;
  document.querySelector(".ship").innerHTML = data1.ship_orderID;
  document.querySelector(".awb-name").innerHTML =
    data1.AWB_transporter === "" ||
    data1.AWB_transporter === undefined ||
    data1.AWB_transporter === null
      ? "N/A"
      : data1.AWB_transporter;

  const response2 = await fetch(`${API_BASE_URL}/orders/myorders/${orderID}`, {
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

  document.querySelector(".order-date").innerHTML = data2.orderDate;
  document.querySelector(".order-status").innerHTML = data2.orderStatus;

  const response3 = await fetch(`${API_BASE_URL}/user/profile/address`, {
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

  document.querySelector(
    ".address"
  ).innerHTML = `${data3.street}, ${data3.city}, ${data3.state}, ${data3.pincode}`;

  const response4 = await fetch(`${API_BASE_URL}/user/profile/address`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response4.ok) {
    alert("Something went wrong!");
    throw new Error("Error");
  }

  const data4 = await response4.json();
});

document
  .querySelector(".cancel-order-btn")
  .addEventListener("click", async e => {
    e.preventDefault();

    const order_id = document.querySelector(".ship").innerHTML;

    try {
      const result = await fetch(`${API_BASE_URL}/orders/cancel/${order_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!result.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  });
