const Company = require("../model/companyModel");


const getCompany = async (req, res) => {
    try {
        const company = await Company.find({})
        res.status(200).json({
            success: true,
            data: company
        })
    } catch (error) {
        console.error("Error fetching Customers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
}

const createCompany = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const {
            companyName,
            address,
            gstNumber,
            industries,
            website,
            industriesType,
            flag
        } = req.body;

        // Validate required fields
        if (!companyName || !address || !gstNumber || !industries || !website || !industriesType || !flag) {
            console.error("Missing required fields");
            return res.status(400).json({ error: "All fields are required" });
        }

        const newCompany = new Company({
            companyName,
            address,
            gstNumber,
            industries,
            website,
            industriesType,
            flag
        });

        console.log("Saving company to database...");
        await newCompany.save();
        console.log("Company saved successfully");
        
        res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: newCompany
        });

    } catch (error) {
        console.error("Company creation error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Failed to create company: " + error.message });
    }
};

module.exports = {
    getCompany,
    createCompany
}
