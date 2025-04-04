const path = require("path");
const fs = require("fs");
const generatePDFService = require("../utils/serviceGenerator");
const Service = require("../model/serviceModel");
const { generateReportNumber } = require("../utils/reportNumberGenerator");

exports.getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ error: "Failed to fetch services" });
    }
};

exports.createService = async (req, res) => {
    try {
        const {
            customerName,
            customerLocation,
            contactPerson,
            contactNumber,
            serviceEngineer,
            date,
            place,
            placeOptions,
            natureOfJob,
            makeModelNumberoftheInstrumentQuantity,
            serialNumberoftheInstrumentCalibratedOK,
            serialNumberoftheFaultyNonWorkingInstruments,
            engineerRemarks,
            engineerName,
            // status
        } = req.body;

        // Generate automatic report number
        const reportNo = generateReportNumber();

        // Validate required fields
        if (!customerName?.trim() ||
            !customerLocation?.trim() ||
            !contactPerson?.trim() ||
            !contactNumber?.trim() ||
            !serviceEngineer?.trim() ||
            !date ||
            !place?.trim() ||
            !placeOptions?.trim() ||
            !natureOfJob?.trim() ||
            !makeModelNumberoftheInstrumentQuantity?.trim() ||
            !serialNumberoftheInstrumentCalibratedOK?.trim() ||
            !serialNumberoftheFaultyNonWorkingInstruments?.trim() ||
            !engineerName?.trim() 
            // !status?.trim()
        ) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate engineer remarks
        if (!Array.isArray(engineerRemarks) || engineerRemarks.length === 0) {
            return res.status(400).json({ error: "At least one engineer remark is required" });
        }

        for (const remark of engineerRemarks) {
            if (!remark.serviceSpares?.trim() ||
                !remark.partNo?.trim() ||
                !remark.rate?.trim() ||
                !remark.quantity?.trim() ||
                !remark.poNo?.trim()
            ) {
                return res.status(400).json({ error: "All fields in engineer remarks are required" });
            }

            if (isNaN(Number(remark.quantity))) {
                return res.status(400).json({ error: "Quantity must be a number" });
            }
        }

        const service = new Service({
            customerName: customerName.trim(),
            customerLocation: customerLocation.trim(),
            contactPerson: contactPerson.trim(),
            contactNumber: contactNumber.trim(),
            serviceEngineer: serviceEngineer.trim(),
            date: date,
            place: place.trim(),
            placeOptions: placeOptions.trim(),
            natureOfJob: natureOfJob.trim(),
            reportNo: reportNo,
            makeModelNumberoftheInstrumentQuantity: makeModelNumberoftheInstrumentQuantity.trim(),
            serialNumberoftheInstrumentCalibratedOK: serialNumberoftheInstrumentCalibratedOK.trim(),
            serialNumberoftheFaultyNonWorkingInstruments: serialNumberoftheFaultyNonWorkingInstruments.trim(),
            engineerRemarks: engineerRemarks,
            engineerName: engineerName.trim(),
            // status: status.trim()
        });

        await service.save();

        const pdfPath = await generatePDFService(
            reportNo,
            date,
            customerName.trim(),
            customerLocation.trim(),
            contactPerson.trim(),
            contactNumber.trim(),
            serviceEngineer.trim(),
            place.trim(),
            placeOptions.trim(),
            natureOfJob.trim(),
            makeModelNumberoftheInstrumentQuantity.trim(),
            serialNumberoftheInstrumentCalibratedOK.trim(),
            serialNumberoftheFaultyNonWorkingInstruments.trim(),
            engineerRemarks,
            engineerName.trim(),
            // status.trim(),
            service._id
        );

        res.status(201).json({
            message: "Service created successfully",
            serviceId: service._id,
            downloadUrl: `/api/v1/services/download/${service._id}`
        });
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ error: "Failed to create service" });
    }
};

exports.downloadService = async (req, res) => {
    try {
        console.log("Received request params:", req.params);
        const { serviceId } = req.params;

        let service;
        if (/^[0-9a-fA-F]{24}$/.test(serviceId)) {
            service = await Service.findById(serviceId);
        }

        if (!service) {
            service = await Service.findOne({ serviceId: serviceId });
        }

        if (!service) {
            console.error(`Service not found in database: ${serviceId}`);
            return res.status(404).json({ error: "Service not found in database" });
        }

        const pdfPath = path.join(process.cwd(), "services", `${service.serviceId}.pdf`);
        console.log("Looking for PDF at path:", pdfPath);

        if (!fs.existsSync(pdfPath)) {
            console.error(`Service file not found at path: ${pdfPath}`);

            console.log("Attempting to regenerate PDF...");
            try {
                await generatePDFService(
                    service.reportNo,
                    service.date,
                    service.customerName,
                    service.customerLocation,
                    service.contactPerson,
                    service.contactNumber,
                    service.serviceEngineer,
                    service.place,
                    service.placeOptions,
                    service.natureOfJob,
                    service.makeModelNumberoftheInstrumentQuantity,
                    service.serialNumberoftheInstrumentCalibratedOK,
                    service.serialNumberoftheFaultyNonWorkingInstruments,
                    service.engineerRemarks,
                    service.engineerName,
                    // service.status,
                    service.serviceId
                );
                console.log("PDF regenerated successfully");
            } catch (regenerateError) {
                console.error("Failed to regenerate PDF:", regenerateError);
                return res.status(500).json({ error: "Failed to regenerate service PDF" });
            }

            if (!fs.existsSync(pdfPath)) {
                return res.status(404).json({ error: "Service file could not be generated" });
            }
        }

        console.log("Setting response headers...");
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=service-${service.serviceId}.pdf`);

        console.log("Creating read stream...");
        const stream = fs.createReadStream(pdfPath);
        stream.on('error', function (error) {
            console.error("Error streaming service:", error);
            console.error("Error stack:", error.stack);
            res.status(500).json({ error: "Failed to download service: " + error.message });
        });

        console.log("Piping stream to response...");
        stream.pipe(res);
    } catch (error) {
        console.error("Service download error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Failed to download service: " + error.message });
    }
};