const express = require("express");

const router = express.Router();

const certificateRoutes = require("./certificateRoutes");
const serviceRoutes = require("./serviceRoutes");
const companyRoutes = require("./companyRoutes");
const contactPersonRoutes = require("./contactPersonRoutes");

router.use("/certificates", certificateRoutes);
router.use("/services", serviceRoutes);
router.use("/companies", companyRoutes);
router.use("/contactPersons", contactPersonRoutes);

module.exports = router;



