const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generatePDFService = async (
    reportNo,
    date,
    customerName,
    customerLocation,
    contactPerson,
    contactNumber,
    serviceEngineer,
    place,
    placeOptions,
    natureOfJob,
    makeModelNumberoftheInstrumentQuantity,
    serialNumberoftheInstrumentCalibratedOK,
    serialNumberoftheFaultyNonWorkingInstruments,
    engineerRemarks,
    engineerName,
    status,
    serviceId
) => {
    try {
        console.log('Generating PDF with data:', {
            reportNo,
            date,
            customerName,
            customerLocation,
            contactPerson,
            contactNumber,
            serviceEngineer,
            place,
            placeOptions,
            natureOfJob,
            makeModelNumberoftheInstrumentQuantity,
            serialNumberoftheInstrumentCalibratedOK,
            serialNumberoftheFaultyNonWorkingInstruments,
            engineerRemarks,
            engineerName,
            status,
            serviceId
        });

        const doc = new PDFDocument({
            layout: 'portrait',
            size: 'A4',
            margins: { top: 40, left: 50, right: 50, bottom: 40 }
        });

        const servicesDir = path.join(process.cwd(), "services");
        if (!fs.existsSync(servicesDir)) {
            fs.mkdirSync(servicesDir);
        }

        const fileName = path.join(servicesDir, `${serviceId}.pdf`);
        doc.pipe(fs.createWriteStream(fileName));

        // Background color
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');

        const pageHeight = doc.page.height;
        const footerY = pageHeight - 120;

        // Border
        const margin = 10;

        // Logo
        const logoPath = path.join(process.cwd(), 'src', 'assets', 'rps.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, margin + 0, margin + 0, { width: 175, height: 50 });
        }

        const column1X = margin + 10;
        const column2X = 250;
        const startY = 180;
        const lineHeight = 20;
        let y = startY;

        const addRow = (label, value, extraSpace = false) => {
            if (extraSpace) y += 0;
            doc.font('Helvetica-Bold')
                .fontSize(12)
                .fillColor('#000')
                .text(label, column1X, y);

            doc.font('Helvetica')
                .text(value, column2X, y);

            y += lineHeight;
            if (extraSpace) y += 20;
        };

        // Format dates as dd-mm-yyyy
        const formatDate = (date) => {
            try {
                if (!date) return 'N/A';
                const d = date instanceof Date ? date : new Date(date);
                if (isNaN(d.getTime())) {
                    console.error('Invalid date value:', date);
                    return 'Invalid Date';
                }
                return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
            } catch (error) {
                console.error('Error formatting date:', error);
                return 'Error';
            }
        };

        doc.moveDown(3);
        doc.y = 100;
        doc.fontSize(16)
            .fillColor('#1a237e')
            .text('SERVICE / CALIBRATION / INSTALLATION  JOB REPORT', { align: 'center', underline: true })
            .moveDown(2);

        // Add Service Fields in Two Columns
        try {
            addRow('Report No.', ":" + " " + (reportNo || 'N/A'));
            addRow('Date', ":" + " " + formatDate(date));
            addRow('Customer Name', ":" + " " + (customerName || 'N/A'));
            addRow('Customer Location', ":" + " " + (customerLocation || 'N/A'));
            addRow('Contact Person', ":" + " " + (contactPerson || 'N/A'));
            addRow('Contact Number', ":" + " " + (contactNumber || 'N/A'));
            addRow('Status', ":" + " " + (status || 'N/A'));
            addRow('Service Engineer', ":" + " " + (serviceEngineer || 'N/A'));
            addRow('Place Of Work', ":" + " " + (place || 'N/A'));
            addRow('Place Options', ":" + " " + (placeOptions || 'N/A'));
            addRow('Nature Of Job', ":" + " " + (natureOfJob || 'N/A'));
            // addRow('Make & Model', ":" + " " + (makeModelNumberoftheInstrumentQuantity || 'N/A'), true);
            // addRow('Serial No. (Calibrated)', ":" + " " + (serialNumberoftheInstrumentCalibratedOK || 'N/A'), true);
            // addRow('Serial No. (Faulty)', ":" + " " + (serialNumberoftheFaultyNonWorkingInstruments || 'N/A'), true);
        } catch (error) {
            console.error('Error adding service fields:', error);
        }

        doc.y = 410
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#000')
            .text('Make & Model Number: ', margin + 10, doc.y, { continued: true });
        doc.font('Helvetica')
            .text(makeModelNumberoftheInstrumentQuantity)
            .moveDown(2);

        // Calibrated & Tested OK
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#000')
            .text('Calibrated & Tested OK: ', margin + 10, doc.y, { continued: true });
        doc.font('Helvetica')
            .text(serialNumberoftheInstrumentCalibratedOK)
            .moveDown(2);

        // Sr.No Faulty/Non-Working
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#000')
            .text('Sr.No Faulty/Non-Working: ', margin + 10, doc.y, { continued: true });
        doc.font('Helvetica')
            .text(serialNumberoftheFaultyNonWorkingInstruments)
            .moveDown(2);

        doc.y = 800;
        doc.fontSize(10)
            .fillColor('#000')
            .text('ENGINEER REMARKS', { align: 'left', underline: true })
            .moveDown(2);

        // Table headers
        const tableTop = doc.y;
        const tableLeft = margin + 10;
        const colWidths = [40, 165, 60, 80, 70, 85];
        const rowHeight = 20;

        // Draw header borders
        doc.fillColor('#000')
            .rect(tableLeft, tableTop, colWidths[0], rowHeight).stroke()
            .rect(tableLeft + colWidths[0], tableTop, colWidths[1], rowHeight).stroke()
            .rect(tableLeft + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).stroke()
            .rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).stroke()
            .rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop, colWidths[4], rowHeight).stroke()
            .rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop, colWidths[5], rowHeight).stroke();

        doc.font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#000')
            .text('Sr. No.', tableLeft + 6, tableTop + 6)
            .text('Service/Spares', tableLeft + colWidths[0] + 6, tableTop + 6)
            .text('Part No.', tableLeft + colWidths[0] + colWidths[1] + 6, tableTop + 6)
            .text('Rate', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 6, tableTop + 6)
            .text('Quantity', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 6, tableTop + 6)
            .text('PO No.', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 6, tableTop + 6);

        doc.fillColor('#000');

        // Table rows with borders
        try {
            engineerRemarks.forEach((remark, index) => {
                const rowY = tableTop + rowHeight + (index * rowHeight);
                let currentX = tableLeft;

                colWidths.forEach(width => {
                    doc.rect(currentX, rowY, width, rowHeight).stroke();
                    currentX += width;
                });

                doc.font('Helvetica')
                    .text((index + 1).toString(), tableLeft + 6, rowY + 6)
                    .text(remark.serviceSpares, tableLeft + colWidths[0] + 6, rowY + 6)
                    .text(remark.partNo, tableLeft + colWidths[0] + colWidths[1] + 6, rowY + 6)
                    .text("Rs" + " " + remark.rate + " " + "/-", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 6, rowY + 6)
                    .text(remark.quantity, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 6, rowY + 6)
                    .text(remark.poNo, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 6, rowY + 6);
            });
        } catch (error) {
            console.error('Error adding table rows:', error);
        }

        doc.moveDown(3);
        // Service Statement
        doc.fontSize(10)
            .font('Helvetica')
            .text(
                'The above service was performed successfully according to the specified requirements.',
                50,
                footerY - 50,
                { width: 490, align: 'center' }
            )
            .moveDown(2);

        // Signature Section
        doc.fontSize(12)
            .text('Service Engineer', doc.page.width - margin - 140, doc.y)
            .text(engineerName, doc.page.width - margin - 140, doc.y + 20)
            .moveDown(4);

        // Footer
        doc.fontSize(12)
            .text(`Generated on: ${new Date().toLocaleString()}`, margin + 10, doc.page.height - margin - 90);

        const footerMargin = 60;

        const footerPath = path.join(process.cwd(), 'src', 'assets', 'handf.png');
        if (fs.existsSync(footerPath)) {
            doc.image(footerPath, margin + 0, doc.page.height - footerMargin, { width: 570, height: 50 });
        }

        doc.end();
        console.log('PDF generated successfully:', fileName);
        return fileName;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

module.exports = generatePDFService;
