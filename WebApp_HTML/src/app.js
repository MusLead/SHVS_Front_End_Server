const path = require("path");
const express = require("express");

const config = require("./config");
const apiV1Routes = require("./routes/apiV1");

function createApp() {
    const app = express();

    app.use(express.static(config.webpageDir));
    app.use(express.json());

    app.get("/", (req, res) => {
        res.sendFile(path.join(config.webpageDir, "index.html"));
    });

    // Expose only the browser-side API helper, not the full controllers directory.
    app.get("/controllers/apiCalls.js", (req, res) => {
        res.sendFile(path.join(config.controllersDir, "apiCalls.js"));
    });

    app.use("/api/v1", apiV1Routes);

    app.use("/api", (req, res) => {
        res.status(404).json({ error: "API route not found" });
    });

    app.use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }

        if (err.statusCode >= 500 || err.statusCode === undefined) {
            console.error("Server error:", err);
        }

        res.status(err.statusCode || 500).json({
            error: err.message || "Internal server error"
        });
    });

    return app;
}

module.exports = { createApp };
