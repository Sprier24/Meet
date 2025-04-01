const express = require("express");
const { ServiceController } = require("../../../controller");

const router = express.Router();

router.get(
    "/getServices", 
    ServiceController.getServices
);

router.post(
    "/generateServices", 
    ServiceController.createService
);

router.get(
    "/download/:serviceId", 
    ServiceController.downloadService
);

module.exports = router;