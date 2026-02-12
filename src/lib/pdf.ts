/**
 * PDF generation using jsPDF.
 * Creates a traditional cover letter PDF from structured text.
 */

import jsPDF from 'jspdf';
import { getCoverLetterText, type CoverLetterData } from './cover-letter';

export function generateCoverLetterPdf(data: CoverLetterData): void {
  const letter = getCoverLetterText(data);

  // Create PDF with US Letter size (8.5" x 11")
  // eslint-disable-next-line new-cap
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter',
  });

  // Margins (1 inch all sides)
  const marginLeft = 1;
  const marginRight = 1;
  const marginTop = 1;
  const pageWidth = 8.5;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Font settings
  doc.setFont('times', 'normal');

  let yPos = marginTop;
  const lineHeight = 0.2; // Line spacing in inches

  // --- HEADER ---
  doc.setFontSize(11);
  const headerLines = letter.header.split('\n');
  headerLines.forEach((line) => {
    doc.text(line, marginLeft, yPos);
    yPos += lineHeight;
  });

  yPos += lineHeight; // Extra space after header

  // --- DATE ---
  doc.text(letter.date, marginLeft, yPos);
  yPos += lineHeight * 2; // Extra space after date

  // --- SALUTATION ---
  doc.text(letter.salutation, marginLeft, yPos);
  yPos += lineHeight * 2; // Extra space after salutation

  // --- OPENING PARAGRAPH ---
  const openingLines = doc.splitTextToSize(letter.opening, contentWidth);
  doc.text(openingLines, marginLeft, yPos);
  yPos += openingLines.length * lineHeight + lineHeight; // Paragraph spacing

  // --- BODY PARAGRAPHS ---
  letter.bodyParagraphs.forEach((paragraph) => {
    // Check if we need a new page
    if (yPos > 10) {
      // Leave 1" bottom margin
      doc.addPage();
      yPos = marginTop;
    }

    const paraLines = doc.splitTextToSize(paragraph, contentWidth);
    doc.text(paraLines, marginLeft, yPos);
    yPos += paraLines.length * lineHeight + lineHeight; // Paragraph spacing
  });

  // --- CLOSING PARAGRAPH ---
  if (yPos > 8.5) {
    // Need space for closing + callout box
    doc.addPage();
    yPos = marginTop;
  }

  // Split closing into parts: intro text, separator lines, URL box content
  const closingParts = letter.closing.split('\n\n');
  const introText = closingParts[0] || letter.closing; // "I'd welcome the opportunity..."

  // Render intro text
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(0, 0, 0);
  const introLines = doc.splitTextToSize(introText, contentWidth);
  doc.text(introLines, marginLeft, yPos);
  yPos += introLines.length * lineHeight + lineHeight * 1.5;

  // --- VISUAL CALLOUT BOX FOR PITCH URL ---
  // Draw border rectangle
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.015);
  doc.rect(marginLeft, yPos, contentWidth, 1.0, 'S');

  yPos += 0.2; // Padding inside box

  // "VIEW MY INTERACTIVE PITCH" label
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('VIEW MY INTERACTIVE PITCH', marginLeft + 0.2, yPos);
  yPos += lineHeight * 1.2;

  // The URL itself - larger, bold, black
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(data.pitchUrl, marginLeft + 0.2, yPos);
  yPos += lineHeight * 1.2;

  // Description text
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.setTextColor(60, 60, 60);
  const boxDesc = doc.splitTextToSize(
    `Personalized for ${data.companyName} with portfolio samples and deeper context.`,
    contentWidth - 0.4
  );
  doc.text(boxDesc, marginLeft + 0.2, yPos);
  yPos += boxDesc.length * lineHeight * 0.9;

  yPos += 0.2; // Bottom padding
  yPos += lineHeight * 1.5; // Space before signature

  // --- SIGNATURE ---
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(0, 0, 0);
  const signatureLines = letter.signature.split('\n');
  signatureLines.forEach((line) => {
    doc.text(line, marginLeft, yPos);
    yPos += lineHeight;
  });

  yPos += lineHeight * 2;

  // --- FOOTER (smaller font, simplified) ---
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const footerLines = letter.footer.split('\n');
  footerLines.forEach((line) => {
    doc.text(line, marginLeft, yPos);
    yPos += lineHeight * 0.8;
  });

  // Generate filename
  const cleanCompany = data.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const cleanRole = data.roleName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const filename = `candice-shen-cover-letter-${cleanCompany}-${cleanRole}.pdf`;

  // Download the PDF
  doc.save(filename);
}
