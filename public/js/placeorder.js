"use strict";

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

function getFormattedDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = getTokenFromCookies();

  if (!isTokenValid(token)) {
    alert("Unauthorized! Please log in first!");
    window.location.href = "/login";
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user/profile/address`, {
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
      ".address"
    ).innerHTML = `${data.street}, ${data.city}, ${data.state}, ${data.pincode}`;

    const response1 = await fetch(`${API_BASE_URL}/orders/cart`, {
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

    await makeCartTable(data1[0]);

    let totalItems = 0;
    data1[0].quantity.forEach(num => (totalItems += num));

    document.querySelector(".order-count").innerHTML = totalItems;
    document.querySelector(
      ".order-total"
    ).innerHTML = `Rs. ${data1[0].cartTotal}.00`;
    document.querySelector(".cart-id").innerHTML = data1[0].cartID;
  } catch (e) {
    console.error(e);
  }
});

document
  .querySelector(".place-order-btn")
  .addEventListener("click", async e => {
    e.preventDefault();

    const token = getTokenFromCookies();

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/address`, {
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

      const response1 = await fetch(`${API_BASE_URL}/user/profile`, {
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

      const userID = data1.userID;

      const response2 = await fetch(`${API_BASE_URL}/orders/myorders`, {
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

      const count = data2.length;
      const orderID = `VB-${userID}-${count + 1}`;

      const response3 = await fetch(`${API_BASE_URL}/orders/cart`, {
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
      const cart = data3[0];
      const len = cart.isbn.length;

      let order_items = [];

      for (let i = 0; i < len; ++i) {
        const item = {
          name: `${cart.isbn[i]}`,
          sku: `VBUY_${i}`,
          units: cart.quantity[i],
          selling_price: cart.costPrice[i],
          discount: "",
          tax: "",
          hsn: "",
        };
        order_items.push(item);
      }

      const orderDetails = {
        order_id: orderID,
        order_date: getFormattedDateTime(),
        pickup_location: "Home",
        channel_id: "",
        comment: "Test order",
        billing_customer_name: `${data1.firstName}`,
        billing_last_name: `${data1.lastName}`,
        billing_address: `${data.street}`,
        billing_address_2: "",
        billing_city: `${data.city}`,
        billing_pincode: `${data.pincode}`,
        billing_state: `${data.state}`,
        billing_country: "India",
        billing_email: `${data1.email}`,
        billing_phone: `${data1.mobile_no}`,
        shipping_is_billing: false,
        shipping_customer_name: "VBuy",
        shipping_last_name: "",
        shipping_address: "SGSITS College",
        shipping_address_2: "",
        shipping_city: "Indore",
        shipping_pincode: "452003",
        shipping_country: "India",
        shipping_state: "Madhya Pradesh",
        shipping_email: "vbuy@gmail.com",
        shipping_phone: "9891155858",
        order_items,
        payment_method: "Prepaid",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: `${cart.cartTotal}`,
        length: 10,
        breadth: 10,
        height: 20,
        weight: 2,
      };

      const result = await fetch(`${API_BASE_URL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderDetails),
      });

      if (!result.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      const dataR = await result.json();
      const shipment_id = dataR.shipment_id;
      const order_id = dataR.order_id;

      const result1 = await fetch(
        `${API_BASE_URL}/orders/create/awb/${shipment_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!result1.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      const result2 = await fetch(`${API_BASE_URL}/orders/cart/changestatus`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!result2.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      const result3 = await fetch(
        `${API_BASE_URL}/orders/invoice/${order_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!result3.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      window.location.href = `/order?q=${encodeURIComponent(orderID)}`;
    } catch (err) {
      console.error(err);
    }
  });
