const express = require("express");
const app = express();

const IP = "127.0.0.1";
const PORT = 8080;

app.use(express.static("public"));
app.use(express.json()); // für POST JSON

// --------------------
// Dummy Daten (Test)
// --------------------
let sensors = {
    humidity: 45,
    wind: 12,
    air: "Gut",
    temperature: 22
};

let systemState = {
    mode: "manual",
    window: false,
    fan: false,
    door: false
};

// ====================
// GET ROUTEN (3x)
// ====================

// Sensorwerte abrufen
app.get("/api/sensors", (req, res) => {
    res.json(sensors);
});

// Systemstatus abrufen
app.get("/api/status", (req, res) => {
    res.json(systemState);
});

// Einzelnen Modus abrufen
app.get("/api/mode", (req, res) => {
    res.json({ mode: systemState.mode });
});

// ====================
// POST ROUTEN (3x)
// ====================

// Modus setzen (auto / manual)
app.post("/api/mode", (req, res) => {
    const { mode } = req.body;

    if (mode !== "auto" && mode !== "manual") {
        return res.status(400).json({ error: "Ungültiger Modus" });
    }

    systemState.mode = mode;
    res.json({ success: true, mode });
});

// Gerät schalten (Fenster, Ventilator, Tür)
app.post("/api/device", (req, res) => {
    const { device, state } = req.body;

    if (!["window", "fan", "door"].includes(device)) {
        return res.status(400).json({ error: "Unbekanntes Gerät" });
    }

    systemState[device] = state;
    res.json({ success: true, device, state });
});

// Zeitplan speichern
app.post("/api/schedule", (req, res) => {
    const { schedule } = req.body;

    // erstmal nur Test
    console.log("Zeitplan empfangen:", schedule);

    res.json({ success: true, message: "Zeitplan gespeichert (Test)" });
});

app.listen(PORT, IP, () => {
    console.log(`Server läuft auf http://${IP}:${PORT}`);
});
