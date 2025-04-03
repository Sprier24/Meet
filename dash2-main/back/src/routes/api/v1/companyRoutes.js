const express = require("express");
const { CompanyController } = require("../../../controller");

const router = express.Router();

router.post(
    "/generateCompany", 
    CompanyController.createCompany
);

router.get(
    "/getCompany", 
    CompanyController.getCompany
);

module.exports = router;