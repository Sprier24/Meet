const ContactPerson = require("../model/ContactPersonModel");


const getContactPerson = async (req, res) => {
    try {
        const contactPerson = await ContactPerson.find({})
        res.status(200).json({
            success: true,
            data: contactPerson
        })
    } catch (error) {
        console.error("Error fetching Customers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
}

const createContactPerson = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const {
            customerName,
            location,

        } = req.body;

        // Validate required fields
        if (!customerName || !location) {
            console.error("Missing required fields");
            return res.status(400).json({ error: "All fields are required" });
        }

        const newCustomer = new Customer({
            customerName,
            location,
        });

        console.log("Saving customer to database...");
        await newCustomer.save();
        console.log("Customer saved successfully");


    } catch (error) {
        console.error("Customer creation error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Failed to create customer: " + error.message });
    }
};

module.exports = {
    getContactPerson,
    createContactPerson
}
