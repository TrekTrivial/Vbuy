"use strict";

const tabs = [
  document.querySelector(".account-details"),
  document.querySelector(".address-details"),
  document.querySelector(".bank-details"),
];

const tabHeaders = [
  document.querySelector(".acc-tab"),
  document.querySelector(".addr-tab"),
  document.querySelector(".bank-tab"),
];

let currentTab = 0;

const showTab = index => {
  tabs.forEach((tab, i) => {
    tab.style.display = i === index ? "flex" : "none";
  });

  tabHeaders.forEach((tabHeader, i) => {
    tabHeader.style.borderBottom = i === index ? "4px solid #3e3e3e" : "none";
  });
};

function nextTab(nextIndex) {
  currentTab = nextIndex;
  showTab(currentTab);
}

function prevTab(prevIndex) {
  currentTab = prevIndex;
  showTab(currentTab);
}

showTab(currentTab);
