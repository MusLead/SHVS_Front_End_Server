const express = require("express");

const controller = require("../controllers/ventilationController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/sensors", asyncHandler(controller.getSensors));
router.get("/status", asyncHandler(controller.getStatus));
router.post("/mode", asyncHandler(controller.setMode));
router.post("/actuators", asyncHandler(controller.setActuators));
router.get("/schedule", asyncHandler(controller.getSchedule));
router.post("/schedule", asyncHandler(controller.setSchedule));

module.exports = router;
