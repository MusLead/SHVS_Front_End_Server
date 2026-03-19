# SHVS_Front_End_Server

This repository is a submodule of the [Smart-Home-Ventilation](https://github.com/MusLead/Smart-Home-Ventilation) project.

## Overview
This Repo is intended as a Server with UI/UX for the client to be able to access and control the whole SHVS (Smart Home Ventilation System).

## Integration as Submodule

This repository is designed to be used as a Git submodule in the parent Smart-Home-Ventilation project.

### Adding this submodule to the parent repository
To add this repository as a submodule to the Smart-Home-Ventilation project:

```bash
git submodule add https://github.com/MusLead/SHVS_Front_End_Server.git
git commit -m "Add SHVS_Front_End_Server submodule"
```

### Cloning the parent repository with submodules
When cloning the Smart-Home-Ventilation repository, use one of these methods:

```bash
# Option 1: Clone with submodules in one command
git clone --recursive https://github.com/MusLead/Smart-Home-Ventilation.git

# Option 2: Clone first, then initialize submodules
git clone https://github.com/MusLead/Smart-Home-Ventilation.git
cd Smart-Home-Ventilation
git submodule init
git submodule update
```

### Updating the submodule
To update this submodule to the latest version:

```bash
cd SHVS_Front_End_Server
git pull origin main
cd ..
git add SHVS_Front_End_Server
git commit -m "Update SHVS_Front_End_Server submodule"
```

## Development

### Working on this submodule
If you're making changes to this submodule:

1. Navigate to the submodule directory
2. Create a new branch for your changes
3. Make your changes and commit them
4. Push the changes to this repository
5. Update the parent repository to reference the new commit

```bash
cd SHVS_Front_End_Server
git checkout -b feature/your-feature
# Make your changes
git add .
git commit -m "Your changes"
git push origin feature/your-feature
cd ..
git add SHVS_Front_End_Server
git commit -m "Update SHVS_Front_End_Server submodule reference"
```

### Start Webserver/ node modules
```bash
npm install express    
node server.js
```

## Quick Setup

### 1 Set MQTT Broker address

Open **`server.js`** and set the IP address of your MQTT broker:

```js
const ESP32_IP = "192.168.X.X";
```

### 2 Startup order

! **Web server (SHVS_Front_End_Server), sensors, and actuators (ESP_Sensors_Actuators) must only be used after the following message appears in the monitor of the ESP_Communcation_Center project:**

```
MQTT Connected
```

Only after this message the system is fully operational.

## How Sensor And Status Data Reach The HTML

This section answers a common question when reading `server.js` and `public/script.js`:

### Question 1

**"The sensor values are written in `script.js`. How do we get them into the HTML?"**

The values are inserted into the HTML by `public/script.js`.

The HTML page contains empty placeholders like:

```html
<span id="tempIndoor">--</span>
<span id="humIndoor">--</span>
<span id="tempOutdoor">--</span>
<span id="wind">--</span>
```

Then `script.js` fetches data from the frontend server and writes the values into those elements:

```js
const data = await fetch("/api/v1/sensors").then(r => r.json());

document.getElementById("tempIndoor").innerText = data.indoor.Temp.toFixed(1);
document.getElementById("humIndoor").innerText = data.indoor.H.toFixed(1);
document.getElementById("tempOutdoor").innerText = data.outdoor.Temp.toFixed(1);
document.getElementById("wind").innerText = data.wind_speed.toFixed(1);
```

So `script.js` is the part that updates the HTML.

### Question 2

**"How do we get `data.indoor`?"**

This line in `script.js`:

```js
const data = await fetch("/api/v1/sensors").then(r => r.json());
```

means:

1. The browser requests `/api/v1/sensors`.
2. The server responds with JSON.
3. `r.json()` converts that JSON text into a JavaScript object.

The JSON looks like this:

```json
{
  "indoor": { "Temp": 23.40, "H": 55.20, "AQ": 2 },
  "outdoor": { "Temp": 18.10, "H": 61.00, "AQ": 1 },
  "wind_speed": 4.6
}
```

After conversion:

```js
data.indoor
```

is simply:

```js
{ "Temp": 23.40, "H": 55.20, "AQ": 2 }
```

That is why `data.indoor.Temp` works.

### Question 3

**"If everything is written in `script.js`, why do we still need this in `server.js`?"**

```js
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
```

Because `script.js` and `server.js` have different responsibilities:

- `script.js` runs in the browser.
- `server.js` runs on the Node.js/Express server.

`script.js` does not talk to the ESP32 directly. It calls the frontend server with:

```js
fetch("/api/v1/status")
```

Then `server.js` receives that request and forwards it to the ESP32:

```js
fetch(`http://${ESP32_IP}/api/v1/status`)
```

After that, `server.js` sends the result back to the browser with:

```js
res.json(data);
```

So `server.js` acts as a middle layer between the browser and the ESP32.

### Full Request Flow

For sensor values:

```text
Browser (script.js)
   -> GET /api/v1/sensors
Frontend Server (server.js)
   -> GET http://ESP32_IP/api/v1/sensors
ESP32 / Communication Center
   -> returns JSON
Frontend Server
   -> res.json(data)
Browser (script.js)
   -> updates HTML with innerText
```

For status values:

```text
Browser (script.js)
   -> GET /api/v1/status
Frontend Server (server.js)
   -> GET http://ESP32_IP/api/v1/status
ESP32 / Communication Center
   -> returns JSON
Frontend Server
   -> res.json(data)
Browser (script.js)
   -> updates Mode / Window / Fan / Door / Absorber in the HTML
```

### Important Difference Between Sensors And Status

- `/api/v1/sensors` returns sensor values such as indoor temperature, outdoor humidity, air quality, and wind speed.
- `/api/v1/status` returns system state such as mode, window, fan, door, and absorber.

So:

- sensor numbers in the HTML come from `/api/v1/sensors`
- actuator and mode values in the HTML come from `/api/v1/status`

### Why Use `server.js` As A Middle Layer?

Using `server.js` as a proxy has a few advantages:

- the browser does not need to know the ESP32 IP address directly
- the frontend can use simple relative URLs like `/api/v1/sensors`
- it helps avoid browser networking and CORS problems
- the UI and backend communication stay organized in one place

In short:

- `script.js` asks for data and writes it into the HTML
- `server.js` fetches that data from the ESP32
- the ESP32/Communication Center is the original source of the data
