"use strict";

const username = document.querySelector(".username");
const password = document.querySelector(".pwd");

document.querySelector(".login-btn").addEventListener("click", async e => {
  e.preventDefault();

  const userDetails = {
    userID: username.value,
    password: password.value,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    });

    if (!response.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    const data = await response.json();

    document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
    alert("Logged in!");
    window.location.href = "/";
  } catch (err) {}
});
