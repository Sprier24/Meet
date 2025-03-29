const mongoose = require("mongoose");


const customerSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    location: { type: String, required: true },
}, {
    timestamps: true
});

const Customer = mongoose.model("Customer",customerSchema)

module.exports = Customer