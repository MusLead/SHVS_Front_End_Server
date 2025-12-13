let manualMode = true;

function toggleDevice(btn) {
    const circle = btn.querySelector(".circle");
    circle.classList.toggle("active");
}

function changeMode() {
    const mode = document.getElementById("modeSelect").value;
    const buttons = document.querySelectorAll(".controls button");
    const status = document.getElementById("statusBox");

    manualMode = mode === "manual";

    buttons.forEach(btn => btn.disabled = !manualMode);

    status.value = manualMode
        ? "Systemstatus: Test (Manuell)"
        : "Systemstatus: Test (Auto)";
}

function toggleAllDay() {
    const allDay = document.getElementById("allDay").checked;
    const dropdown = document.getElementById("allDayMode");
    const timeSlots = document.getElementById("timeSlots");

    dropdown.classList.toggle("hidden", !allDay);
    timeSlots.classList.toggle("hidden", allDay);

    if (!allDay) {
        generateTimeSlots();
    }
}

function generateTimeSlots() {
    const container = document.getElementById("timeSlots");
    container.innerHTML = "";

    for (let i = 0; i < 24; i++) {
        container.innerHTML += `
      <div>
        ${i}:00 -
        <select data-hour="${i}">
          <option value="">---</option>
          <option value="eco">Eco</option>
          <option value="best">Best</option>
        </select>
      </div>
    `;
    }

    const btn = document.createElement("button");
    btn.innerText = "Überprüfen";
    btn.onclick = validateSlots;
    container.appendChild(btn);
}

function validateSlots() {
    const selects = document.querySelectorAll("#timeSlots select");
    let missing = false;

    selects.forEach(sel => {
        if (!sel.value) {
            sel.value = "eco";
            missing = true;
        }
    });

    if (missing) {
        alert("Sie haben nicht alle time slots eingestellt, alle restlichen time slots werden nun auf eco gestellt");
    }
}
