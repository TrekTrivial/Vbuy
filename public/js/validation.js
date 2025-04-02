"use strict";

const username = document.querySelector(".username");

const validateUsername = () => {
  let isValid = true;
  if (username.value.trim() == "" || username.value.trim().length > 20) {
    document.querySelector(".username-error span").innerHTML =
      "Username is invalid!";
    document.querySelector(".username-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".username-error").style.visibility = "hidden";
  }
  return isValid;
};

document.querySelector(".available-btn").addEventListener("click", async e => {
  e.preventDefault();

  if (!validateUsername()) {
    return;
  }

  const userID = username.value.trim().toLowerCase().split(" ").join("");

  try {
    const response = await fetch(`${API_BASE_URL}/user/user/${userID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    const data = await response.json();
    if (data.count == 0) {
      document.querySelector(".username-tick").removeAttribute("hidden");
      document.querySelector(".email").removeAttribute("disabled");
      document.querySelector(".available-btn").style.pointerEvents = "none";
      document.querySelector(".verify-btn").style.pointerEvents = "auto";
      username.setAttribute("disabled", "true");
    } else {
      document.querySelector(".username-tick").setAttribute("hidden", "true");
      document.querySelector(".username-error span").innerHTML =
        "This username is unavailable!";
      document.querySelector(".username-error").style.visibility = "visible";
      return;
    }
  } catch (err) {
    console.error(err);
  }
});

const email = document.querySelector(".email");
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const validateEmail = () => {
  let isValid = true;
  if (!emailRegex.test(email.value)) {
    document.querySelector(".email-error span").innerHTML = "Email is invalid!";
    document.querySelector(".email-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".email-error").style.visibility = "hidden";
  }
  return isValid;
};

document.querySelector(".verify-btn").addEventListener("click", async e => {
  e.preventDefault();

  if (!validateEmail()) {
    return;
  }

  try {
    const result = await fetch(`${API_BASE_URL}/user/users/${email.value}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!result.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    const dataR = await result.json();

    if (dataR.count == 0) {
      const body = {
        name: username.value,
        email: email.value,
      };

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
      document.querySelector(".verify-btn").style.pointerEvents = "none";
      document.querySelector(".otp-text").style.visibility = "visible";
      document.querySelectorAll(".otp").forEach(input => {
        input.removeAttribute("disabled");
      });
      document.querySelector(".otp-btn").style.pointerEvents = "auto";
      document.querySelector(".resend-otp-btn").style.pointerEvents = "auto";
    } else {
      document.querySelector(".email-error span").innerHTML =
        "Email is already registered!";
      document.querySelector(".email-error").style.visibility = "visible";
      return;
    }
  } catch (err) {
    console.error(err);
  }
});

const otpInput = document.querySelectorAll(".otp");

const validateOTP = otp => {
  let isValid = true;
  if (otp.length !== 6) {
    document.querySelector(".otp-error span").innerHTML = "Invalid OTP!";
    document.querySelector(".otp-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".otp-error").style.visibility = "hidden";
  }
  return isValid;
};

document.querySelector(".otp-btn").addEventListener("click", async e => {
  e.preventDefault();

  const otpValue = Array.from(otpInput)
    .map(input => input.value)
    .join("");

  if (!validateOTP(otpValue)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user/verify_otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.value, otp: otpValue }),
    });

    if (response.status === 403) {
      document.querySelector(".otp-error span").innerHTML = "Invalid OTP";
      document.querySelector(".otp-error").style.visibility = "visible";
      return;
    } else if (response.status === 400) {
      document.querySelector(".otp-error span").innerHTML =
        "OTP has expired. Please request a new one!";
      document.querySelector(".otp-error").style.visibility = "visible";
      return;
    }
    if (!response.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    document.querySelector(".otp-text").style.visibility = "hidden";
    document.querySelector(".otp-error").style.visibility = "hidden";
    document.querySelector(".email-tick").removeAttribute("hidden");
    otpInput.forEach(input => {
      input.setAttribute("disabled", "true");
    });
    document.querySelector(".otp-btn").style.pointerEvents = "none";
    document.querySelector(".resend-otp-btn").style.pointerEvents = "none";
    document.querySelector(".name").removeAttribute("disabled");
    document.querySelector(".mobile").removeAttribute("disabled");
    document.querySelector(".pwd").removeAttribute("disabled");
    document.querySelector(".pwd-cfm").removeAttribute("disabled");
    document.querySelector(".account-next-btn").style.pointerEvents = "auto";
  } catch (err) {
    console.error(err);
  }
});

const mobileRegex = /^[6-9]\d{9}$/;
const name = document.querySelector(".name");
const mobile = document.querySelector(".mobile");
const pwd = document.querySelector(".pwd");
const pwd_cfm = document.querySelector(".pwd-cfm");

const validateOtherInfo = () => {
  let isValid = true;
  if (name.value.trim().split(" ").length < 2 || name.value.trim() == "") {
    document.querySelector(".name-error span").innerHTML = "Enter full name!";
    document.querySelector(".name-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".name-error").style.visibility = "hidden";
  }

  if (mobile.value == "" || !mobileRegex.test(mobile.value)) {
    document.querySelector(".mobile-error span").innerHTML =
      "Mobile number is invalid!";
    document.querySelector(".mobile-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".mobile-error").style.visibility = "hidden";
  }

  if (
    pwd.value.length < 10 ||
    pwd.value !== pwd_cfm.value ||
    pwd.value.trim() == "" ||
    pwd_cfm.value.trim() == ""
  ) {
    document.querySelector(".pwd-error span").innerHTML = "Invalid passwords!";
    document.querySelector(".pwd-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".pwd-error").style.visibility = "hidden";
  }
  return isValid;
};

document.querySelector(".account-next-btn").addEventListener("click", e => {
  e.preventDefault();

  if (!validateOtherInfo()) {
    return;
  }

  nextTab(1);
});

document.querySelector(".address-back-btn").addEventListener("click", e => {
  e.preventDefault();

  prevTab(0);
});

const pincodeRegex = /^[1-9][0-9]{5}$/;
const street = document.querySelector(".street");
const city = document.querySelector(".city");
const state = document.querySelector(".states");
const pincode = document.querySelector(".pincode");

const validateAddress = () => {
  let isValid = true;
  if (street.value.trim() == "") {
    document.querySelector(".street-error span").innerHTML = "Invalid input!";
    document.querySelector(".street-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".street-error").style.visibility = "hidden";
  }

  if (city.value.trim() == "") {
    document.querySelector(".city-error span").innerHTML = "Invalid input!";
    document.querySelector(".city-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".city-error").style.visibility = "hidden";
  }

  if (state.value.trim() == "") {
    document.querySelector(".state-error span").innerHTML = "Select a state!";
    document.querySelector(".state-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".state-error").style.visibility = "hidden";
  }

  if (pincode.value.trim() == "" || !pincodeRegex.test(pincode.value.trim())) {
    document.querySelector(".pincode-error span").innerHTML =
      "Invalid pincode!";
    document.querySelector(".pincode-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".pincode-error").style.visibility = "hidden";
  }
  return isValid;
};

document.querySelector(".address-next-btn").addEventListener("click", e => {
  e.preventDefault();

  if (!validateAddress()) {
    return;
  }

  nextTab(2);
});

document.querySelector(".bank-back-btn").addEventListener("click", e => {
  e.preventDefault();

  prevTab(1);
});

const vpaRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/;
let acc_type;
const accountNumber = document.querySelector(".acc-no");
const accountHolderName = document.querySelector(".acc-name");
const ifsc = document.querySelector(".ifsc");
const branch = document.querySelector(".branch");
const vpa_id = document.querySelector(".vpa");
const vpa_name = document.querySelector(".vpa-name");

document.querySelector(".type-bank").addEventListener("change", e => {
  acc_type = "bank";
  accountNumber.removeAttribute("disabled");
  accountHolderName.removeAttribute("disabled");
  ifsc.removeAttribute("disabled");
  document.querySelector(".ifsc-btn").removeAttribute("disabled");

  vpa_id.setAttribute("disabled", "true");
  vpa_name.setAttribute("disabled", "true");

  document.querySelector(".ifsc-btn").style.pointerEvents = "auto";
  document.querySelector(".bank-next-btn").style.pointerEvents = "none";
});

document.querySelector(".type-vpa").addEventListener("change", e => {
  acc_type = "vpa";
  accountNumber.setAttribute("disabled", "true");
  accountHolderName.setAttribute("disabled", "true");
  ifsc.setAttribute("disabled", "true");
  document.querySelector(".ifsc-btn").setAttribute("disabled", "true");

  vpa_id.removeAttribute("disabled");
  vpa_name.removeAttribute("disabled");

  document.querySelector(".ifsc-btn").style.pointerEvents = "none";
  document.querySelector(".bank-next-btn").style.pointerEvents = "auto";
});

const validateBank = type => {
  let isValid = true;

  if (type === "bank") {
    if (accountNumber.value == "" || isNaN(accountNumber.value)) {
      document.querySelector(".acc-no-error span").innerHTML =
        "Invalid account number!";
      document.querySelector(".acc-no-error").style.visibility = "visible";
      isValid = false;
    } else {
      document.querySelector(".acc-no-error").style.visibility = "hidden";
    }

    if (accountHolderName.value == "") {
      document.querySelector(".acc-name-error span").innerHTML =
        "Invalid account holder name!";
      document.querySelector(".acc-name-error").style.visibility = "visible";
      isValid = false;
    } else {
      document.querySelector(".acc-name-error").style.visibility = "hidden";
    }

    if (ifsc.value.length !== 11) {
      document.querySelector(".ifsc-error span").innerHTML =
        "Invalid IFS code!";
      document.querySelector(".ifsc-error").style.visibility = "visible";
      isValid = false;
    } else {
      document.querySelector(".ifsc-error").style.visibility = "hidden";
    }
  } else if (type === "vpa") {
    if (vpa_id.value == "" || !vpaRegex.test(vpa_id.value)) {
      document.querySelector(".vpa-error span").innerHTML = "Invalid VPA ID!";
      document.querySelector(".vpa-error").style.visibility = "visible";
      isValid = false;
    } else {
      document.querySelector(".vpa-error").style.visibility = "hidden";
    }

    if (vpa_name.value == "") {
      document.querySelector(".vpa-name-error span").innerHTML =
        "Invalid name!";
      document.querySelector(".vpa-name-error").style.visibility = "visible";
      isValid = false;
    } else {
      document.querySelector(".vpa-name-error").style.visibility = "hidden";
    }
  }
  return isValid;
};

document.querySelector(".ifsc-btn").addEventListener("click", async e => {
  e.preventDefault();

  if (!validateBank("bank")) {
    return;
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
    document.querySelector(".bank-next-btn").style.pointerEvents = "auto";
    document.querySelector(".bank-tick").removeAttribute("hidden");
  } catch (err) {
    console.error(err);
  }
});

document.querySelector(".bank-next-btn").addEventListener("click", async e => {
  e.preventDefault();

  const userDetails = {
    userID: username.value,
    firstName: name.value.trim().split(" ")[0],
    lastName: name.value.trim().split(" ")[1],
    email: email.value,
    password: pwd.value,
    mobile_no: mobile.value,
    street: street.value,
    city: city.value,
    state_: state.value,
    pincode: pincode.value,
  };

  try {
    if (acc_type === "vpa") {
      if (!validateBank("vpa")) {
        return;
      }

      const bankDetails = {
        vpa_id: vpa_id.value,
        vpa_name: vpa_name.value,
      };

      const response1 = await fetch(`${API_BASE_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      if (!response1.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      const data1 = await response1.json();

      const response2 = await fetch(
        `${API_BASE_URL}/user/bank_details/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: username.value,
            type: "vpa",
            bankDetails,
          }),
        }
      );

      if (!response2.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      document.cookie = `token=${data1.token}; path=/; max-age=86400; SameSite=Strict`;
      alert("Registered successfully!");
      window.location.href = "/";
    } else if (acc_type === "bank") {
      const bankDetails = {
        accountNumber: accountNumber.value,
        ifsc: ifsc.value,
        accountHolderName: accountHolderName.value,
      };

      const response3 = await fetch(`${API_BASE_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      if (!response3.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      const data3 = await response3.json();

      const response4 = await fetch(
        `${API_BASE_URL}/user/bank_details/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: username.value,
            type: "bank",
            bankDetails,
          }),
        }
      );

      if (!response4.ok) {
        alert("Something went wrong!");
        throw new Error("Error");
      }

      document.cookie = `token=${data3.token}; path=/; max-age=86400; SameSite=Strict`;
      alert("Registered successfully!");
      window.location.href = "/";
    }
  } catch (err) {
    console.error(err);
  }
});

document.addEventListener("DOMContentLoaded", function () {
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
});
