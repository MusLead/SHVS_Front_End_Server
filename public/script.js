// MODES:
// 0 - AUTO_BEST
// 1 - AUTO_ECO
// 2 - MANUAL
let currentMode = 2; // MANUAL

let isSending = false;

// Actuator states
const actuators = { window: 0, fan: 0, door: 0, absorber: 0 };

// Event-Listener for the All-Day Mode Select
document.addEventListener('DOMContentLoaded', function () {
    const allDayModeSelect = document.getElementById("allDayModeSelect");
    if (allDayModeSelect) {
        allDayModeSelect.addEventListener("change", async function () {
            const mode = Number(this.value);
            // Check if all Day is active
            if (document.getElementById("allDayCheck").checked) {
                await setAllDayMode(mode);
            }
        });
    }
});

// Initial fetch and periodic updates
fetchSensors(); fetchStatus();
setInterval(fetchSensors, 3000);
setInterval(fetchStatus, 5000);

// Fetch sensor data from server
async function fetchSensors() {
    try {
        const data = await fetch("/api/v1/sensors").then(r => r.json());
        document.getElementById("tempIndoor").innerText = data.indoor.Temp.toFixed(1);
        document.getElementById("humIndoor").innerText = data.indoor.H.toFixed(1);
        document.getElementById("airQualityIndoor").innerText = data.indoor.AQ;
        document.getElementById("tempOutdoor").innerText = data.outdoor.Temp.toFixed(1);
        document.getElementById("humOutdoor").innerText = data.outdoor.H.toFixed(1);
        document.getElementById("airQualityOutdoor").innerText = data.outdoor.AQ;
        document.getElementById("wind").innerText = data.wind_speed.toFixed(1);
    } catch (e) { console.warn(e); }
}

async function fetchStatus() {
    if (isSending) return;

    try {
        const status = await fetch("/api/v1/status").then(r => r.json());

        currentMode = status.mode;
        const modeSelect = document.getElementById("modeSelect");
        modeSelect.value = (currentMode === 2) ? 2 : 1;


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
    document.querySelectorAll(".controls button").forEach(btn => {
        const dev = btn.dataset.device;
        btn.disabled = currentMode !== 2 || isSending;
        btn.querySelector(".circle")
            .classList.toggle("active", actuators[dev] === 1);
    });

    document.getElementById("statusMode").innerText =
        currentMode === 2 ? "MANUAL" :
            currentMode === 1 ? "AUTO_ECO" : "AUTO_BEST";

    document.getElementById("statusWindow").innerText = actuators.window ? "ON" : "OFF";
    document.getElementById("statusFan").innerText = actuators.fan ? "ON" : "OFF";
    document.getElementById("statusDoor").innerText = actuators.door ? "ON" : "OFF";
    document.getElementById("statusAbsorber").innerText = actuators.absorber ? "ON" : "OFF";
}


// Fuction to adjust visibility of schedule
function updateScheduleVisibility() {
    const scheduleSection = document.querySelector(".schedule");
    const scheduleTitle = document.querySelector(".schedule h3");

    if (currentMode === 2) { // MANUAL
        // If MANUAL --> then hide schedule and title too
        document.getElementById("allDayControls").classList.add("hidden");
        document.getElementById("normalSchedule").classList.add("hidden");
        if (scheduleTitle) scheduleTitle.classList.add("hidden");
    } else { // AUTO (1 or 0)
        // If AUTO title and All-Day Controls visible
        if (scheduleTitle) scheduleTitle.classList.remove("hidden");
        document.getElementById("allDayControls").classList.remove("hidden");

        // Check if All-Day is activ
        const allDay = document.getElementById("allDayCheck").checked;

        // Show Schedule only if the All-Day is not active
        document.getElementById("normalSchedule").classList.toggle("hidden", allDay);

        // Mode Selector (ECO/BEST) only if the All-Day moode is active
        const modeLabel = document.querySelector("#allDayControls label[for='allDayModeSelect']");
        const modeSelect = document.getElementById("allDayModeSelect");

        if (modeLabel) modeLabel.classList.toggle("hidden", !allDay);
        if (modeSelect) modeSelect.classList.toggle("hidden", !allDay);
    }
}

// toggle Device
async function toggleDevice(btn) {
    if (currentMode !== 2) {
        alert("Only in MANUAL!");
        return;
    }

    const dev = btn.dataset.device;

    isSending = true;
    actuators[dev] ^= 1;
    updateUI();

    try {
        const res = await fetch("/api/v1/actuators", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actuators)
        });

        if (!res.ok) {
            alert(await res.text());
        }
    } catch (e) {
        alert("Connection error");
    }

    isSending = false;
    fetchStatus();
}

// set a new mode
async function setMode(value) {
    const mode = Number(value);
    currentMode = mode;

    isSending = true;

    try {
        await fetch("/api/v1/mode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode })
        });
    } catch (e) {
        alert("Failed to set mode");
    }

    isSending = false;
    fetchStatus();
}


// All-Day Mode send
async function setAllDayMode(mode) {
    try {
        const res = await fetch("/api/v1/mode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: Number(mode) })
        });

        if (!res.ok) alert(await res.text());
    } catch (e) { alert("Failed to set mode"); }
}

function toggleAllDay() {
    const allDay = document.getElementById("allDayCheck").checked;

    // if All-Day is active then send Mode
    if (allDay) {
        const mode = Number(document.getElementById("allDayModeSelect").value);
        setAllDayMode(mode);
    }

    // Update visibility
    updateScheduleVisibility();
}

function addScheduleRow() {
    const container = document.getElementById("scheduleRows");
    const row = document.createElement("div"); row.className = "schedule-row";
    row.innerHTML = `<input type="time" class="start" value="08:00"><input type="time" class="end" value="12:00"><select class="mode"><option value="1">AUTO_ECO</option><option value="0">AUTO_BEST</option></select><button onclick="this.parentElement.remove()">X</button>`;
    container.appendChild(row);
}

function clearSchedule() { document.getElementById("scheduleRows").innerHTML = ""; sendSchedule(); }

async function sendSchedule() {
    const rows = document.querySelectorAll(".schedule-row");
    const periods = [];
    rows.forEach(row => {
        const start = row.querySelector(".start").value;
        const end = row.querySelector(".end").value;
        const mode = Number(row.querySelector(".mode").value);
        if (start && end) periods.push({ start, end, mode });
    });
    try {
        const res = await fetch("/api/v1/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ periods }) });
        if (!res.ok) { alert(await res.text()); return; }
        alert("Schedule sent successfully");
    } catch (e) { alert("Failed"); }

}
