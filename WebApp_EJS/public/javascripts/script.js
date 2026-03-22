// MODES:
// 0 - AUTO_BEST
// 1 - AUTO_ECO
// 2 - MANUAL
let currentMode = 2;

let isSending = false;

const actuators = { window: 0, fan: 0, door: 0, absorber: 0 };
const espConnections = { indoor: null, outdoor: null };
const apiAvailability = { sensors: true, status: true };
let currentStatusWhy = "";

document.addEventListener("DOMContentLoaded", function () {
  const allDayModeSelect = document.getElementById("allDayModeSelect");

  if (allDayModeSelect) {
    allDayModeSelect.addEventListener("change", async function () {
      const mode = Number(this.value);

      if (document.getElementById("allDayCheck").checked) {
        await setAllDayMode(mode);
      }
    });
  }
});

fetchSensors();
fetchStatus();

// Fetch sensors every 3 seconds and status every 5 seconds to keep the UI updated without overwhelming the server.
setInterval(fetchSensors, 3000);
setInterval(fetchStatus, 5000);

function renderSensorValue(elementId, value, digits) {
  const element = document.getElementById(elementId);

  if (!element) return;

  if (typeof value === "number" && Number.isFinite(value)) {
    element.innerText = typeof digits === "number" ? value.toFixed(digits) : String(value);
    return;
  }

  element.innerText = "--";
}

async function fetchSensors() {
  try {
    const data = await apiCalls.getSensors();
    apiAvailability.sensors = true;
    espConnections.indoor = Boolean(data.connections && data.connections.indoor);
    espConnections.outdoor = Boolean(data.connections && data.connections.outdoor);
    renderSensorValue("tempIndoor", data.indoor.Temp, 1);
    renderSensorValue("humIndoor", data.indoor.H, 1);
    renderSensorValue("airQualityIndoor", data.indoor.AQ);
    renderSensorValue("tempOutdoor", data.outdoor.Temp, 1);
    renderSensorValue("humOutdoor", data.outdoor.H, 1);
    renderSensorValue("airQualityOutdoor", data.outdoor.AQ);
    renderSensorValue("wind", data.wind_speed, 1);
    updateWarnings();
  } catch (e) {
    apiAvailability.sensors = false;
    updateWarnings();
    console.warn(e);
  }
}

function isDeviceConnected(device) {
  if (device === "window" || device === "door") {
    return espConnections.indoor === true;
  }

  if (device === "fan" || device === "absorber") {
    return espConnections.outdoor === true;
  }

  return true;
}

async function fetchStatus() {
  if (isSending) return;

  try {
    const status = await apiCalls.getStatus();
    apiAvailability.status = true;

    currentMode = status.mode;
    currentStatusWhy = typeof status.why === "string" ? status.why : "";
    document.getElementById("modeSelect").value = currentMode === 2 ? 2 : 1;

    Object.assign(actuators, {
      window: status.window,
      door: status.door,
      fan: status.fan,
      absorber: status.absorber
    });

    updateScheduleVisibility();
    updateUI();
  } catch (e) {
    apiAvailability.status = false;
    updateWarnings();
    console.warn(e);
  }
}

function updateUI() {
  document.querySelectorAll(".controls button").forEach(function (btn) {
    const dev = btn.dataset.device;
    btn.disabled = currentMode !== 2 || isSending;
    btn.querySelector(".circle").classList.toggle("active", actuators[dev] === 1);
  });

  document.getElementById("statusMode").innerText =
    currentMode === 2 ? "MANUAL" : currentMode === 1 ? "AUTO_ECO" : "AUTO_BEST";

  document.getElementById("statusWindow").innerText = actuators.window ? "OPEN" : "CLOSED";
  document.getElementById("statusFan").innerText = actuators.fan ? "ON" : "OFF";
  document.getElementById("statusDoor").innerText = actuators.door ? "OPEN" : "CLOSED";
  document.getElementById("statusAbsorber").innerText = actuators.absorber ? "ON" : "OFF";

  updateStatusWhy();
  updateWarnings();
}

function updateStatusWhy() {
  const statusWhy = document.getElementById("statusWhy");

  if (!statusWhy) return;

  if (currentMode === 2) {
    statusWhy.innerText = "Manual Mode, no Status explanation!";
    return;
  }

  if (currentStatusWhy) {
    statusWhy.innerText = currentStatusWhy;
    return;
  }

  statusWhy.innerText = "Automatic mode active. Waiting for the status explanation from the ESP.";
}

function updateWarnings() {
  const warningPanel = document.getElementById("warningPanel");
  const warningSummary = document.getElementById("warningSummary");
  const espCommunicationPanel = document.getElementById("espCommunicationPanel");
  const espWarningList = document.getElementById("espWarningList");

  if (!warningPanel || !warningSummary || !espCommunicationPanel || !espWarningList) return;

  const warnings = [];

  if (!apiAvailability.sensors || !apiAvailability.status) {
    warnings.push("Communication with the ESP controller API is cut off.");
  }

  if (apiAvailability.sensors && espConnections.indoor === false) {
    warnings.push("Communication with the Indoor ESP is cut off.");
  }

  if (apiAvailability.sensors && espConnections.outdoor === false) {
    warnings.push("Communication with the Outdoor ESP is cut off.");
  }

  warningPanel.classList.toggle("hidden", warnings.length === 0);
  espCommunicationPanel.classList.toggle("hidden", warnings.length === 0);

  if (warnings.length === 0) {
    warningSummary.innerText = "No warnings at the moment.";
    espWarningList.innerHTML = "";
    return;
  }

  warningSummary.innerText =
    warnings.length === 1 ? "1 warning requires attention." : `${warnings.length} warnings require attention.`;

  espWarningList.innerHTML = warnings
    .map(function (warning) {
      return `<div class="warning-item">${warning}</div>`;
    })
    .join("");
}

function updateScheduleVisibility() {
  const scheduleTitle = document.querySelector(".schedule h3");

  if (currentMode === 2) {
    document.getElementById("allDayControls").classList.add("hidden");
    document.getElementById("normalSchedule").classList.add("hidden");
    if (scheduleTitle) scheduleTitle.classList.add("hidden");
    return;
  }

  if (scheduleTitle) scheduleTitle.classList.remove("hidden");
  document.getElementById("allDayControls").classList.remove("hidden");

  const allDay = document.getElementById("allDayCheck").checked;
  document.getElementById("normalSchedule").classList.toggle("hidden", allDay);

  const modeLabel = document.querySelector("#allDayControls label[for='allDayModeSelect']");
  const modeSelect = document.getElementById("allDayModeSelect");

  if (modeLabel) modeLabel.classList.toggle("hidden", !allDay);
  if (modeSelect) modeSelect.classList.toggle("hidden", !allDay);
}

async function toggleDevice(btn) {
  if (currentMode !== 2) {
    alert("Only in MANUAL!");
    return;
  }

  if (!isDeviceConnected(btn.dataset.device)) {
    if (btn.dataset.device === "window" || btn.dataset.device === "door") {
      alert("Indoor ESP is not connected. It is not possible to control the window or door.");
      return;
    }

    alert("Outdoor ESP is not connected. It is not possible to control the fan or absorber.");
    return;
  }

  if (btn.dataset.device === "fan" && actuators.window === 0) {
    document.getElementById("statusFan").innerText = "OFF";
    alert("Open the window first!");
    return;
  }

  const dev = btn.dataset.device;

  isSending = true;
  actuators[dev] ^= 1;
  updateUI();

  try {
    await apiCalls.setActuators(actuators);
  } catch (e) {
    alert(e.message || "Connection error");
  }

  isSending = false;
  fetchStatus();
}

async function setMode(value) {
  const mode = Number(value);
  currentMode = mode;

  isSending = true;

  try {
    await apiCalls.setMode(mode);
  } catch (e) {
    alert(e.message || "Failed to set mode");
  }

  isSending = false;
  fetchStatus();
}

async function setAllDayMode(mode) {
  try {
    await apiCalls.setMode(Number(mode));
  } catch (e) {
    alert(e.message || "Failed to set mode");
  }
}

function toggleAllDay() {
  const allDay = document.getElementById("allDayCheck").checked;

  if (allDay) {
    const mode = Number(document.getElementById("allDayModeSelect").value);
    setAllDayMode(mode);
  }

  updateScheduleVisibility();
}

function addScheduleRow() {
  const container = document.getElementById("scheduleRows");
  const row = document.createElement("div");
  row.className = "schedule-row";
  row.innerHTML = '<input type="time" class="start" value="08:00"><input type="time" class="end" value="12:00"><select class="mode"><option value="1">AUTO_ECO</option><option value="0">AUTO_BEST</option></select><button onclick="this.parentElement.remove()">X</button>';
  container.appendChild(row);
}

function clearSchedule() {
  document.getElementById("scheduleRows").innerHTML = "";
  sendSchedule();
}

async function sendSchedule() {
  const rows = document.querySelectorAll(".schedule-row");
  const periods = [];

  rows.forEach(function (row) {
    const start = row.querySelector(".start").value;
    const end = row.querySelector(".end").value;
    const mode = Number(row.querySelector(".mode").value);

    if (start && end) {
      periods.push({ start: start, end: end, mode: mode });
    }
  });

  try {
    await apiCalls.setSchedule(periods);
    alert("Schedule sent successfully");
  } catch (e) {
    alert(e.message || "Failed");
  }
}
