const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generatePDF = async (
    certificateNo,
    customerName,
    siteLocation,
    makeModel,
    range,
    serialNo,
    calibrationGas,
    gasCanisterDetails,
    dateOfCalibration,
    calibrationDueDate,
    certificateId,
    observations,
    engineerName
) => {
    const doc = new PDFDocument({
        layout: 'portrait',
        size: 'A4',
        margins: { top: 40, left: 50, right: 50, bottom: 40 }
    });

    const certificatesDir = path.join(process.cwd(), "certificates");
    if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir);
    }

    const fileName = path.join(certificatesDir, `${certificateId}.pdf`);
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


    // Certificate Title

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

    const addRow1 = (label, value, extraSpace = false) => {
        if (extraSpace) y += 0;  
        
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#000')
            .text(label, column1X, y);

        doc.font('Helvetica')
            .text(value, column2X, y);

        y += lineHeight;  
        if (extraSpace) y += 40;  
    };

    doc.moveDown(3);
    doc.y = 100;
    doc.fontSize(16)
        .fillColor('#1a237e')
        .text('CALIBRATION CERTIFICATE', { align: 'center', underline: true })
        .moveDown(2);

    // Add Certificate Fields in Two Columns
    addRow('Certificate No.', ":" + " " + certificateNo);
    addRow('Customer Name', ":" + " " + customerName);
    addRow('Site Location', ":" + " " + siteLocation);
    addRow('Make & Model', ":" + " " + makeModel);
    addRow('Range', ":" + " " + range, true);
    addRow('Serial No.', ":" + " " + serialNo);
    addRow('Calibration Gas', ":" + " " + calibrationGas);
    addRow1('Gas Canister Details', ":" + " " + gasCanisterDetails, true);
    addRow('Date of Calibration', ":" + " " + new Date(dateOfCalibration).toLocaleDateString());
    addRow('Calibration Due Date', ":" + " " + new Date(calibrationDueDate).toLocaleDateString());

    doc.y = 450;
    doc.fontSize(10)
        .fillColor('#000')
        .text('OBSERVATIONS', { align: 'left', underline: true })
        .moveDown(2);

    // Table headers
    const tableTop = doc.y;
    const tableLeft = margin + 10;
    const colWidths = [40, 150, 150, 140]; 
    const rowHeight = 20;

    // Draw header borders
    doc.fillColor('#000')
        .rect(tableLeft, tableTop, colWidths[0], rowHeight).stroke() 
        .rect(tableLeft + colWidths[0], tableTop, colWidths[1], rowHeight).stroke() 
        .rect(tableLeft + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).stroke() 
        .rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).stroke()



    doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#000')
        .text('Sr. No.', tableLeft + 5, tableTop + 5)
        .text('Concentration of Gas', tableLeft + colWidths[0] + 5, tableTop + 5)
        .text('Reading Before Calibration', tableLeft + colWidths[0] + colWidths[1] + 5, tableTop + 5)
        .text('Reading After Calibration', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 5);

    doc.fillColor('#000'); 

    doc.lineWidth(2).strokeColor('#000'); 

    // Table rows with borders
    observations.forEach((obs, index) => {
        const rowY = tableTop + rowHeight + (index * rowHeight);
        currentX = tableLeft;

        // Draw row borders with a thicker stroke
        colWidths.forEach(width => {
            doc.rect(currentX, rowY, width, rowHeight).stroke();
            currentX += width;
        });

        // Insert text inside cells
        doc.font('Helvetica')
            .text((index + 1).toString(), tableLeft + 5, rowY + 5)
            .text(obs.gas, tableLeft + colWidths[0] + 5, rowY + 5)
            .text(obs.before, tableLeft + colWidths[0] + colWidths[1] + 5, rowY + 5)
            .text(obs.after, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, rowY + 5);
    });

    doc.moveDown(3);
    // Certification Statement
    doc.fontSize(10)
        .font('Helvetica')
        .text(
            'The above-mentioned Gas Detector was calibrated successfully, and the result confirms that the performance of the instrument is within acceptable limits.',
            50, 
            footerY - 50, 
            { width: 490, align: 'center' }
        )
        .moveDown(2);

    // Signature Section
    doc.fontSize(14)
        .text('Tested & Calibrated By', doc.page.width - margin - 180, doc.y)
        .text(engineerName, doc.page.width - margin - 180, doc.y + 10)
        .moveDown(4);

    // Footer
    doc.fontSize(8)
        // .text(`Certificate ID: ${certificateId}`, margin + 10, doc.page.height - margin - 80)
        .text(`Generated on: ${new Date().toLocaleString()}`, margin + 10, doc.page.height - margin - 65);

    doc.end();
    return fileName;
};

module.exports = generatePDF;
