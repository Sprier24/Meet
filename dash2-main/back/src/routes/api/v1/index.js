const express = require("express");

const router = express.Router();

const certificateRoutes = require("./certificateRoutes");
const serviceRoutes = require("./serviceRoutes");

router.use("/certificates", certificateRoutes);
router.use("/services", serviceRoutes);

module.exports = router;


