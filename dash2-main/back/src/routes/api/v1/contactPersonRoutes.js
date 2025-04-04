const express = require("express");
const { ContactPersonController } = require("../../../controller");
const router = express.Router();

router.post(
    "/generateContactPerson", 
    ContactPersonController.createContactPerson
);

router.get(
    "/getContactPersons", 
    ContactPersonController.getContactPerson
);

module.exports = router;