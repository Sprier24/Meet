const express = require("express");
const { CustomerController } = require("../../../controller");


const router = express.Router();

router.post(
    "/generateCustomer", 
    CustomerController.createCustomer
);

router.get(
    "/getCustomer", 
    CustomerController.getCustomer
);

module.exports = router;