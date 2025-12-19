const express = require("express");
const app = express();

const WEBSERVER = "127.0.0.1";
const PORT = 8080;
const ESP32_IP = "10.249.73.216"; // ESP32-IP

app.use(express.static("public"));
app.use(express.json());

// --------------------
// GET: Sensors
// --------------------
app.get("/api/v1/sensors", async (req, res) => {
    try {
        const response = await fetch(`http://${ESP32_IP}/api/v1/sensors`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("ESP32 sensors error:", err);
        res.status(500).json({ error: "ESP32 not reachable" });
    }
});

// --------------------
// GET: Status
// --------------------
app.get("/api/v1/status", async (req, res) => {
    try {
        const response = await fetch(`http://${ESP32_IP}/api/v1/status`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("ESP32 status error:", err);
        res.status(500).json({ error: "ESP32 not reachable" });
    }
});

// --------------------
// POST: Mode (0/1/2)
// --------------------
app.post("/api/v1/mode", async (req, res) => {
    try {
        const response = await fetch(`http://${ESP32_IP}/api/v1/mode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: req.body.mode })
        });

        console.log(req.body);

        console.log(req.body.toString());


        const data = await response.text();
        res.send(data);
    } catch (err) {
        console.error("ESP32 mode error:", err);
        res.status(500).json({ error: "ESP32 not reachable" });
    }
});

// --------------------
// POST: Actuators
// --------------------
app.post("/api/v1/actuators", async (req, res) => {
    try {
        const response = await fetch(`http://${ESP32_IP}/api/v1/actuators`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });
        const data = await response.text();
        res.send(data);
    } catch (err) {
        console.error("ESP32 actuators error:", err);
        res.status(500).json({ error: "ESP32 not reachable" });
    }
});

// --------------------
// GET: Schedule
// --------------------
app.get("/api/v1/schedule", async (req, res) => {
    try {
        const response = await fetch(`http://${ESP32_IP}/api/v1/schedule`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("ESP32 schedule get error:", err);
        res.status(500).json({ error: "ESP32 not reachable" });
    }
});

// --------------------
// POST: Schedule
// --------------------
app.post("/api/v1/schedule", async (req, res) => {
    try {
        const response = await fetch(`http://${ESP32_IP}/api/v1/schedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });
        const data = await response.text();
        res.send(data);
    } catch (err) {
        console.error("ESP32 schedule post error:", err);
        res.status(500).json({ error: "ESP32 not reachable" });
    }
});

app.listen(PORT, WEBSERVER, () => {
    console.log(`Server running on http://${WEBSERVER}:${PORT}`);
});