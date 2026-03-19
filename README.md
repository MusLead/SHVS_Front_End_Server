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

### Start Webserver / node modules
```bash
npm install express    
node server.js
```

## Quick Setup

### 1 Configure the ESP32 API upstream

The browser talks only to the Express server. Express then forwards REST API calls to the ESP32 device.

Set the ESP32 address with an environment variable:

```bash
ESP32_IP=192.168.X.X node server.js
```

If you need a custom protocol or port, use `ESP32_BASE_URL` instead:

```bash
ESP32_BASE_URL=http://192.168.X.X:80 node server.js
```

Default fallback:

```js
http://192.168.0.130
```

### 2 Backend structure

The backend is organized so Express is the public REST API layer:

- `server.js`: startup/bootstrap only
- `src/app.js`: Express app setup and middleware
- `src/Webpage/`: static webpage files served by Express
- `src/controllers/apiCalls.js`: browser-side API helper served explicitly to the webpage
- `src/routes/apiV1.js`: REST route definitions
- `src/controllers/ventilationController.js`: request validation and response handling
- `src/services/esp32Client.js`: communication with the ESP32 upstream API

### 3 Startup order

! **Web server (SHVS_Front_End_Server), sensors, and actuators (ESP_Sensors_Actuators) must only be used after the following message appears in the monitor of the ESP_Communcation_Center project:**

```
MQTT Connected
```

Only after this message the system is fully operational.
