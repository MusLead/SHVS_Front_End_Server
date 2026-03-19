const { createApp } = require("./src/app");
const config = require("./src/config");

const app = createApp();

app.listen(config.port, config.webserver, () => {
    console.log(`Server running on http://${config.webserver}:${config.port}`);
    console.log(`ESP32 upstream: ${config.esp32BaseUrl}`);
});
