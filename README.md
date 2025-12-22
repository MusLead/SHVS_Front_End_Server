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

! **Web server, sensors, and actuators must only be used after the following message appears in the monitor:**

```
MQTT Connected
```

Only after this message the system is fully operational.