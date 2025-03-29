const express = require("express");

const router = express.Router();

const certificateRoutes = require("./certificateRoutes");
const serviceRoutes = require("./serviceRoutes");
const customerRoutes = require("./customerRoutes");

router.use("/certificates", certificateRoutes);
router.use("/services", serviceRoutes);
router.use("/customers", customerRoutes);

module.exports = router;


