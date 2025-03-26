import { db } from '@/db';
import { certificates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.id, parseInt(params.id))
    });

    if (!certificate) {
      return new Response('Certificate not found', { status: 404 });
    }

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      autoFirstPage: true,
      margin: 50
    });

    // Set response headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename=certificate-${certificate.id}.pdf`);

    // Collect PDF chunks
    const chunks: any[] = [];
    doc.on('data', chunks.push.bind(chunks));

    // Add content to PDF
    doc.fontSize(16)
      .text('CALIBRATION CERTIFICATE', { align: 'center' })
      .moveDown();

    // Add certificate details
    const addField = (label: string, value: any) => {
      doc.fontSize(12)
        .text(`${label}: ${value}`)
        .moveDown(0.5);
    };

    addField('Certificate No', certificate.id);
    addField('Customer Name', certificate.customer_Name);
    addField('Site Location', certificate.site_Location);
    addField('Make & Model', certificate.make_Model);
    addField('Range', certificate.range);
    addField('Serial No', certificate.serial_No);
    addField('Calibration Gas', certificate.calibration_Gas);
    addField('Gas Canister Details', certificate.gas_Canister_Details);
    addField('Date of Calibration', new Date(certificate.date_Of_Calibration).toLocaleDateString());
    addField('Calibration Due Date', new Date(certificate.calibration_Due_Date).toLocaleDateString());

    // Add footer
    doc.fontSize(10)
      .text('This is an electronically generated certificate.', {
        align: 'center'
      })
      .moveDown()
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: 'right'
      });

    // Finalize the PDF
    doc.end();

    // Return a promise that resolves with the PDF response
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(new Response(pdfBuffer, { headers }));
      });
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response('Error generating PDF', { status: 500 });
  }
}