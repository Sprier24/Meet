const express = require("express");
const { CertificateController } = require("../../../controller");

const router = express.Router();

router.post(
    "/generateCertificate", 
    CertificateController.createCertificate
);

// router.get(
//     "/getCertificate/:certificateId", 
//     CertificateController.getCertificate
// );

router.get(
    "/download/:certificateId", 
    CertificateController.downloadCertificate
);

module.exports = router;