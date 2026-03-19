const config = require("../config");

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function readErrorMessage(response) {
    try {
        const body = await response.text();
        return body || `ESP32 request failed with status ${response.status}`;
    } catch (err) {
        return `ESP32 request failed with status ${response.status}`;
    }
}

async function request(path, options = {}, responseType = "json") {
    let response;

    try {
        response = await fetch(`${config.esp32BaseUrl}${path}`, options);
    } catch (err) {
        throw createHttpError("ESP32 not reachable", 502);
    }

    if (!response.ok) {
        const message = await readErrorMessage(response);
        throw createHttpError(message, response.status);
    }

    return responseType === "text" ? response.text() : response.json();
}

function getSensors() {
    return request("/api/v1/sensors");
}

function getStatus() {
    return request("/api/v1/status");
}

function setMode(mode) {
    return request(
        "/api/v1/mode",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode })
        },
        "text"
    );
}

function setActuators(payload) {
    return request(
        "/api/v1/actuators",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        },
        "text"
    );
}

function getSchedule() {
    return request("/api/v1/schedule");
}

function setSchedule(payload) {
    return request(
        "/api/v1/schedule",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        },
        "text"
    );
}

module.exports = {
    getSensors,
    getStatus,
    setMode,
    setActuators,
    getSchedule,
    setSchedule
};
