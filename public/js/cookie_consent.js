document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("cookieConsent")) {
    setTimeout(() => {
      document.getElementById("cookie-banner").classList.add("show");
    }, 3000);
  }

  document.getElementById("accept-cookies").addEventListener("click", e => {
    localStorage.setItem("cookieConsent", "true");
    document.getElementById("cookie-banner").classList.remove("show");

    setTimeout(() => {
      document.getElementById("cookie-banner").style.display = "none";
    }, 500);
  });
});
