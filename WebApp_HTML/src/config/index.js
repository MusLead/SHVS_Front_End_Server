const path = require("path");

const rootDir = path.join(__dirname, "..", "..");
const defaultEsp32Ip = "192.168.0.130";
const esp32BaseUrl = process.env.ESP32_BASE_URL || `http://${process.env.ESP32_IP || defaultEsp32Ip}`;

module.exports = {
    webserver: process.env.WEBSERVER || "127.0.0.1",
    port: Number(process.env.PORT) || 8080,
    webpageDir: path.join(rootDir, "src", "Webpage"),
    controllersDir: path.join(rootDir, "src", "controllers"),
    esp32BaseUrl
};
