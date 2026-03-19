# SHVS_Front_End_Server

This submodule now contains two frontend implementations for the Smart Home Ventilation System (SHVS):

- `WebApp_EJS`: the current Express + EJS application
- `WebApp_HTML`: the older HTML-oriented frontend kept for reference

## Recommended App

Use `WebApp_EJS` for current development. It is the generated Express app that now serves the SHVS dashboard and proxies `/api/v1/...` requests to the ESP32 HTTP API.

## Structure

```text
SHVS_Front_End_Server/
  WebApp_EJS/
  WebApp_HTML/
```

## Run WebApp_EJS From The Main Project Root

From `/Users/aslam/Smart-Home-Ventilation_main`:

```bash
npm --prefix SHVS_Front_End_Server/WebApp_EJS install
ESP32_IP=192.168.X.X npm --prefix SHVS_Front_End_Server/WebApp_EJS start
```

Development mode:

```bash
ESP32_IP=192.168.X.X npm --prefix SHVS_Front_End_Server/WebApp_EJS run dev
```

Optional environment variables:

```bash
WEBSERVER=127.0.0.1 PORT=8080 ESP32_IP=192.168.X.X npm --prefix SHVS_Front_End_Server/WebApp_EJS start
```

If the ESP32 upstream API needs a custom protocol or port:

```bash
ESP32_BASE_URL=http://192.168.X.X:80 npm --prefix SHVS_Front_End_Server/WebApp_EJS start
```

## Startup Order

The web server, sensors, and actuators should only be used after this message appears in the monitor of `ESP_Communcation_Center`:

```text
MQTT Connected
```

Only after that message the system is fully operational.
