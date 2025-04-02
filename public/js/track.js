"use strict";

const awb = document.querySelector(".awb");

const validateAWB = () => {
  let isValid = true;
  if (awb.value === "") {
    document.querySelector(".awb-error span").innerHTML = "Invalid input!";
    document.querySelector(".awb-error").style.visibility = "visible";
    isValid = false;
  } else {
    document.querySelector(".awb-error").style.visibility = "hidden";
  }
  return isValid;
};

document.querySelector(".track-btn").addEventListener("click", e => {
  e.preventDefault();

  if (!validateAWB()) {
    return;
  }

  const AWBnumber = awb.value;
  window.open(`https://shiprocket.co/tracking/${AWBnumber}`, "_blank");
});
