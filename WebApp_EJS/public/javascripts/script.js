// MODES:
// 0 - AUTO_BEST
// 1 - AUTO_ECO
// 2 - MANUAL
let currentMode = 2;

let isSending = false;

const actuators = { window: 0, fan: 0, door: 0, absorber: 0 };

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
    renderSensorValue("tempIndoor", data.indoor.Temp, 1);
    renderSensorValue("humIndoor", data.indoor.H, 1);
    renderSensorValue("airQualityIndoor", data.indoor.AQ);
    renderSensorValue("tempOutdoor", data.outdoor.Temp, 1);
    renderSensorValue("humOutdoor", data.outdoor.H, 1);
    renderSensorValue("airQualityOutdoor", data.outdoor.AQ);
    renderSensorValue("wind", data.wind_speed, 1);
  } catch (e) {
    console.warn(e);
  }
}

async function fetchStatus() {
  if (isSending) return;

  try {
    const status = await apiCalls.getStatus();

    currentMode = status.mode;
    document.getElementById("modeSelect").value = currentMode === 2 ? 2 : 1;

    Object.assign(actuators, {
      window: status.window,
      fan: status.fan,
      door: status.door,
      absorber: status.absorber
    });

    updateScheduleVisibility();
    updateUI();
  } catch (e) {
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

  document.getElementById("statusWindow").innerText = actuators.window ? "ON" : "OFF";
  document.getElementById("statusFan").innerText = actuators.fan ? "ON" : "OFF";
  document.getElementById("statusDoor").innerText = actuators.door ? "ON" : "OFF";
  document.getElementById("statusAbsorber").innerText = actuators.absorber ? "ON" : "OFF";
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
