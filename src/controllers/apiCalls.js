const apiBaseUrl = "/api/v1";

async function readErrorMessage(response) {
    const contentType = response.headers.get("content-type") || "";

    try {
        if (contentType.includes("application/json")) {
            const json = await response.json();
            return json.error || json.message || `HTTP error! status: ${response.status}`;
        }

        const text = await response.text();
        return text || `HTTP error! status: ${response.status}`;
    } catch (error) {
        return `HTTP error! status: ${response.status}`;
    }
}

async function handleApiCall(url, method = "GET", body = null, responseType = "json") {
    const options = { method, headers: {} };

    if (body !== null) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${apiBaseUrl}${url}`, options);

        if (!response.ok) {
            throw new Error(await readErrorMessage(response));
        }

        return responseType === "text" ? response.text() : response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

const apiCalls = {
    getSensors() {
        return handleApiCall("/sensors");
    },
    getStatus() {
        return handleApiCall("/status");
    },
    setMode(mode) {
        return handleApiCall("/mode", "POST", { mode }, "text");
    },
    setActuators(payload) {
        return handleApiCall("/actuators", "POST", payload, "text");
    },
    getSchedule() {
        return handleApiCall("/schedule");
    },
    setSchedule(periods) {
        return handleApiCall("/schedule", "POST", { periods }, "text");
    }
};

window.apiCalls = apiCalls;
