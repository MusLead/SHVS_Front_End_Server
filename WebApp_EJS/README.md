# WebApp_EJS

This folder contains the Express + EJS frontend for the Smart Home Ventilation System (SHVS).

It was scaffolded with the Express generator (`express --view=ejs`) and adapted from the older frontend implementation in `WebApp_HTML`.

## Overview

This app serves the SHVS webpage and exposes the REST API used by the browser UI:

- the browser loads the dashboard from Express
- browser JavaScript calls `/api/v1/...`
- Express forwards those requests to the ESP32 HTTP API

## Run From The Main Project Folder

From `/Users/aslam/Smart-Home-Ventilation_main`, install dependencies:

```bash
npm --prefix SHVS_Front_End_Server/WebApp_EJS install
```

Run the frontend without changing directories:

```bash
ESP32_IP=192.168.X.X npm --prefix SHVS_Front_End_Server/WebApp_EJS start
```

Example with explicit host and port:

```bash
WEBSERVER=127.0.0.1 PORT=8080 ESP32_IP=192.168.X.X npm --prefix SHVS_Front_End_Server/WebApp_EJS start
```

If the ESP32 upstream API needs a custom protocol or port, use `ESP32_BASE_URL`:

```bash
ESP32_BASE_URL=http://192.168.X.X:80 npm --prefix SHVS_Front_End_Server/WebApp_EJS start
```

Development mode with automatic restart:

```bash
ESP32_IP=192.168.X.X npm --prefix SHVS_Front_End_Server/WebApp_EJS run dev
```

## Run From Inside WebApp_EJS

If you do want to work inside the frontend folder directly:

```bash
cd /Users/aslam/Smart-Home-Ventilation_main/SHVS_Front_End_Server/WebApp_EJS
npm install
ESP32_IP=192.168.X.X npm start
```

## Project Structure

This app follows the standard Express generator structure:

- `app.js`: Express app setup
- `bin/www`: HTTP server startup
- `routes/index.js`: page route for the main dashboard
- `routes/api.js`: REST API routes under `/api/v1`
- `controllers/apiCalls.js`: browser-side API helper served explicitly by Express
- `controllers/ventilationController.js`: request validation and response handling
- `services/esp32Client.js`: communication with the ESP32 upstream API
- `views/index.ejs`: SHVS dashboard page
- `public/javascripts/script.js`: browser UI logic
- `public/stylesheets/style.css`: page styling

## Relation To The Old Frontend Repo

The previous frontend implementation still exists in this same submodule:

- [WebApp_HTML](/Users/aslam/Smart-Home-Ventilation_main/SHVS_Front_End_Server/WebApp_HTML)

That older folder is useful as a reference, but `WebApp_EJS` is the version intended for the new structure and future work.

## Startup Order

The web server, sensors, and actuators should only be used after this message appears in the monitor of `ESP_Communcation_Center`:

```text
MQTT Connected
```

Only after that message the system is fully operational.
