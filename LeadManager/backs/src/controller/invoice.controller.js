const Invoice = require("../model/invoiceSchema.model");
const Owner = require('../model/OwnerSchema.model');
const nodemailer = require("nodemailer");
const { storeNotification } = require('./notification.controller');
const cron = require('node-cron');

const remindEvent = async () => {
    const io = require('../index'); // Get the initialized socket.io instance
    const now = new Date();
    const nowIST = new Date(now.getTime() + (5 * 60 + 30) * 60000); // Convert UTC to IST
    const todayIST = nowIST.toISOString().split('T')[0]; // Today's date in IST (YYYY-MM-DD)
    console.log('Cron job running at (IST):', nowIST.toISOString());

    try {
        // Fetch owner details (assuming there is only one owner)
        const owner = await Owner.findOne(); // Fetch owner details

        if (!owner) {
            console.error("Owner details not found!");
            return;
        }
        const invoices = await Invoice.find({
            status: "Unpaid", // Only unpaid invoices
        });

        if (!invoices.length) {
            console.log('No unpaid invoices to remind');
            return;
        }

        for (const invoice of invoices) {
            const dueDate = new Date(invoice.date);
            if (isNaN(dueDate.getTime())) {
                console.error(`Invalid due date for invoice: ${invoice._id}`);
                continue; // Skip invalid invoices
            }

            // Calculate reminder dates
            const threeDaysBefore = new Date(dueDate);
            threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

            const oneDayBefore = new Date(dueDate);
            oneDayBefore.setDate(oneDayBefore.getDate() - 1);

            // Check if today matches any of the reminder dates
            const reminderDateType = todayIST === threeDaysBefore.toISOString().split('T')[0]
                ? "3 Days Before"
                : todayIST === oneDayBefore.toISOString().split('T')[0]
                ? "1 Day Before"
                : todayIST === dueDate.toISOString().split('T')[0]
                ? "On Due Date"
                : null;

            if (reminderDateType) {
                console.log(`Reminder (${reminderDateType}): ${invoice.customerName} has an unpaid invoice`);

                // Emit reminder via socket.io
                io.emit('reminder', {
                    id: invoice._id,
                    customerName: invoice.customerName,
                    companyName: invoice.companyName,
                    amount: invoice.remainingAmount,
                    dueDate: dueDate.toISOString().split('T')[0], // Only date
                    reminderType: reminderDateType,
                });
                console.log(`Reminder (${reminderDateType}) emitted for:`, invoice.customerName);

                // Example of emitting a notification event from backend
                io.emit('notification', {
                    _id: "invoice._id",
                    title: `Reminder (${reminderDateType}): Unpaid Invoice for ${invoice.companyName}`,
                    message: `Customer ${invoice.customerName} has an unpaid invoice of ₹${invoice.remainingAmount} for the product "${invoice.productName}". The due date is ${dueDate.toISOString().split('T')[0]}.`,
                    type: 'reminder',
                    createdAt: new Date().toISOString(),
                });

                // Store notification in MongoDB
                const notificationData = {
                    title: `Invoice Reminder (${reminderDateType}): Unpaid Invoice for ${invoice.companyName}`,
                    message: `Customer ${invoice.customerName} has an unpaid invoice of ₹${invoice.remainingAmount} for the product "${invoice.productName}". The due date is ${dueDate.toISOString().split('T')[0]}.`,
                    type: 'reminder',
                };

                await storeNotification(notificationData);

                const emailMessage = `
                <p>Dear ${invoice.customerName},</p>
            
                <p>I hope this email finds you well.This is a gentle reminder <strong>(${reminderDateType})</strong> to pay your outstanding invoice of <strong>₹${invoice.remainingAmount}</strong>.</p>
            
                <p>We kindly request you to make the payment at your earliest convenience to avoid any inconvenience.</p>
            
                <p>Thank you for your prompt attention to this matter.</p>
            
                <p><strong>Best regards,</strong><br/>
                [${owner.companyName}]</p>
            `;            

                await sendEmailReminder({
                    to: invoice.emailAddress, // Ensure this exists in the invoice schema
                    subject: "Invoice Payment Reminder",
                    message: emailMessage,
                });
                
                console.log(`Email sent (${reminderDateType}) for invoice #${invoice._id}`);
            } else {
                console.log(`No reminder needed for invoice #${invoice._id}`);
            }
        }
    } catch (error) {
        console.error('Error executing remindEvent API:', error);
    }
};

// Schedule the cron job to run every midnight (12:00 AM)
cron.schedule('0 * * * *', remindEvent, {
    // timezone: "Asia/Kolkata", // Set the timezone to IST
});

console.log('Cron job scheduled to run every midnight (12:00 AM IST).');


const invoiceAdd = async (req, res) => {
    try {
        const { 
            companyName, 
            customerName, 
            contactNumber, 
            emailAddress, 
            address, 
            gstNumber, 
            productName, 
            amount, 
            discount, 
            gstRate, 
            status, 
            date, 
            endDate, 
            paidAmount 
        } = req.body;

        // Ensure values are numbers
        const parsedAmount = parseFloat(amount) || 0;
        const parsedDiscount = parseFloat(discount) || 0;
        const parsedGstRate = parseFloat(gstRate) || 0;
        const parsedPaidAmount = parseFloat(paidAmount) || 0;

        // ✅ Correct Discount Calculation
        const discountedAmount = parsedAmount - (parsedAmount * (parsedDiscount / 100));

        // ✅ GST Calculation
        const gstAmount = discountedAmount * (parsedGstRate / 100);

        // ✅ Total without GST
        const totalWithoutGst = discountedAmount;

        // ✅ Total with GST
        const totalWithGst = totalWithoutGst + gstAmount;

        // ✅ Remaining Amount
        const remainingAmount = totalWithGst - parsedPaidAmount;

        const newInvoice = new Invoice({
            companyName,
            customerName,
            contactNumber,
            emailAddress,
            address,
            gstNumber,
            productName,
            amount: parsedAmount,
            discount: parsedDiscount,
            gstRate: parsedGstRate,
            status,
            date,
            endDate,
            totalWithoutGst,
            totalWithGst,
            paidAmount: parsedPaidAmount,
            remainingAmount
        });

        const savedInvoice = await newInvoice.save();
        res.status(201).json({ message: "Invoice added successfully", data: savedInvoice });

    } catch (error) {
        console.error("Error adding invoice:", error);
        res.status(500).json({ message: "Failed to add invoice", error: error.message });
    }
};

const updateInvoice = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        console.log("Updating invoice with ID:", id, "and data:", updates);

        const updatedInvoice = await Invoice.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedInvoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: updatedInvoice
        });
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const deleteInvoice = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedInvoice = await Invoice.findByIdAndDelete(id);

        if (!deletedInvoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Invoice deleted successfully",
            data: deletedInvoice
        });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({});
        res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getInvoiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getUnpaidInvoices = async (req, res) => {

    try {
        const unpaidInvoices = await Invoice.find({ status: "Unpaid" });
        res.status(200).json({
            success: true,
            data: unpaidInvoices,
        });
    } catch (error) {
        console.error("Error fetching unpaid invoices:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getPaidInvoices = async (req, res) => {

    try {
        const paidInvoices = await Invoice.find({ status: 'Paid' });

        // Map to extract only the desired fields
        // const response = unpaidInvoices.map(invoice => ({
        //     companyName: invoice.companyName,
        //     withGstAmount:invoice.withGstAmount,
        //     mobile:invoice.mobile,
        //     productName: invoice.productName,
        //     endDate: invoice.date // Assuming 'date' is your end date
        // }));

        // res.status(200).json({
        //     success: true,
        //     data: response
        // });
        res.status(200).json({
            success: true,
            data: paidInvoices
        });
    } catch (error) {
        console.error("Error fetching unpaid invoices:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const transporter = nodemailer.createTransport({
    service: "gmail",  // Or another service like SendGrid
    auth: {
        user: process.env.EMAIL_USER,  // Get email from .env
        pass: process.env.EMAIL_PASS,  // Get password from .env
    },
});


const sendEmailReminder = async ({ to, subject = "(No Subject)", message = "(No Message)" }) => {
    if (!to) {
        throw new Error("Recipient email (to) is required.");
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: message,
    };

    return transporter.sendMail(mailOptions);
};

const sendWhatsAppReminder = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the invoice by ID
        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        // Construct the recipient's WhatsApp number
        const countryCode = '+91';
        const customerNumber = invoice.contactNumber;
        if (!customerNumber) {
            return res.status(400).json({ success: false, message: "Customer contact number not found" });
        }
        const formattedNumber = `${countryCode}${customerNumber}`;

        // Construct the reminder message
        const message = `Hello ${invoice.customerName},\n\nThis is a reminder to pay your outstanding invoice of ₹${invoice.remainingAmount}. Please make the payment at your earliest convenience.`;

        // Simulate sending a WhatsApp message
        console.log(`Sending WhatsApp message to: ${formattedNumber}`);
        console.log(`Message: ${message}`);

        // Respond with success
        res.status(200).json({
            success: true,
            message: "WhatsApp reminder sent successfully",
        });
    } catch (error) {
        // Handle errors
        console.error("Error sending WhatsApp reminder:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const updateCustomMessage = async(req,res)=>{
    try {
        const { customMessage } = req.body;
        const invoiceId = req.params.invoiceId;
    
        const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, { customMessage }, { new: true });
    
        if (!updatedInvoice) {
          return res.status(404).json({ message: 'Invoice not found' });
        }
    
        return res.json({ data: updatedInvoice });
      } catch (error) {
        console.error('Error saving custom message:', error);
        res.status(500).json({ message: 'Failed to save custom message' });
      }
}

const getInvoicesByStatus = async (req, res) => {
    const { status } = req.query;
  
    try {
      const invoices = await Invoice.find({ status }, 'Name email amount');
      res.status(200).json({
        success: true,
        data: invoices
      });
    } catch (error) {
      console.error(`Error fetching ${status} invoices:`, error);
      res.status(500).json({
        success: false,
        message: "Internal server error: " + error.message,
      });
    }
};

const updateStatus = async (req, res) => {
    const { invoiceId, status } = req.body;

    try {
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        invoice.status = status;
        await invoice.save();

        res.json({ success: true, message: 'invoice status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    invoiceAdd,
    updateInvoice,
    deleteInvoice,
    getAllInvoices,
    getInvoiceById,
    getUnpaidInvoices,
    getPaidInvoices,
    sendEmailReminder,
    sendWhatsAppReminder,
    updateCustomMessage,
    getInvoicesByStatus,
    updateStatus
};