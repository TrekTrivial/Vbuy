function loadComponent(component, file, callback) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(component).innerHTML = data;
      if (callback) callback();
    });
}

window.addEventListener("DOMContentLoaded", function () {
  loadComponent("header-container", "header.html", () => {
    const logoutButton = document.querySelector(".logout-btn");
    if (logoutButton) {
      logoutButton.addEventListener("click", async e => {
        e.preventDefault();

        const token = getTokenFromCookies();

        try {
          const response = await fetch(`${API_BASE_URL}/user/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            alert("Something went wrong!");
            throw new Error("Error");
          }

          window.location.href = "/login";
        } catch (err) {
          console.error(err);
        }
      });
    }
  });
  loadComponent("footer-container", "footer.html");
});

setTimeout(() => {
  const token = getTokenFromCookies();

  if (isTokenValid(token)) {
    document.querySelector(".dashboard").style.display = "flex";
    document.querySelector(".log-reg").style.display = "none";
  } else {
    document.querySelector(".dashboard").style.display = "none";
    document.querySelector(".log-reg").style.display = "flex";
  }
}, 1000);
