import jsPDF from 'jspdf';
import { VehicleTally } from './types';

export async function generateTallyPdf(tally: VehicleTally): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Bar (Deep Navy)
  doc.setFillColor(11, 31, 58); // #0B1F3A
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Accent Line (Electric Blue)
  doc.setFillColor(0, 163, 255); // #00A3FF
  doc.rect(0, 24, pageWidth, 2, 'F');

  // HIPG Branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('HIPG', margin, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Hambantota International Port Group', margin, 18);

  // Document Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITAL VEHICLE TALLY REPORT', pageWidth - margin, 12, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Port Operations Management System (DTVS)', pageWidth - margin, 18, { align: 'right' });

  let y = 34;

  // Status Badge & Ref No Header
  doc.setFillColor(245, 247, 251);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Reference No: ${tally.referenceNo}`, margin + 4, y + 9);

  // Status Pill
  const isApproved = tally.status === 'Approved';
  if (isApproved) {
    doc.setFillColor(18, 183, 106); // Green
    doc.setTextColor(255, 255, 255);
  } else if (tally.status === 'Pending Approval') {
    doc.setFillColor(247, 144, 9); // Amber
    doc.setTextColor(255, 255, 255);
  } else {
    doc.setFillColor(240, 68, 56); // Red
    doc.setTextColor(255, 255, 255);
  }
  doc.roundedRect(pageWidth - margin - 46, y + 3, 42, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isApproved ? 'APPROVED (LOCKED)' : tally.status.toUpperCase(),
    pageWidth - margin - 25,
    y + 8.5,
    { align: 'center' }
  );

  y += 20;

  // Vessel & Voyage Information Block
  doc.setFillColor(21, 94, 239);
  doc.rect(margin, y, 3, 10, 'F');
  doc.setTextColor(11, 31, 58);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VESSEL & OPERATIONS INFORMATION', margin + 6, y + 7);

  y += 13;
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  const col1 = margin + 4;
  const col2 = margin + 65;
  const col3 = margin + 125;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Vessel Name:', col1, y + 6);
  doc.text('Voyage No:', col2, y + 6);
  doc.text('DOC No:', col3, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(tally.vesselName, col1, y + 11);
  doc.text(tally.voyageNo, col2, y + 11);
  doc.text(tally.docNo, col3, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Shipping Agent:', col1, y + 17);
  doc.text('Berth / Yard:', col2, y + 17);
  doc.text('Cargo Type:', col3, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(tally.agentName, col1, y + 22);
  doc.text(tally.yardLocation, col2, y + 22);
  doc.text(tally.cargoType, col3, y + 22);

  y += 29;

  // Vehicle Details Block
  doc.setFillColor(21, 94, 239);
  doc.rect(margin, y, 3, 10, 'F');
  doc.setTextColor(11, 31, 58);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE IDENTIFICATION', margin + 6, y + 7);

  y += 13;
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Vehicle Registration No:', col1, y + 6);
  doc.text('Chassis / VIN Number:', col2, y + 6);
  doc.text('Tag / Barcode No:', col3, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(tally.vehicleNo, col1, y + 11);
  doc.text(tally.chassisNo, col2, y + 11);
  doc.text(tally.tagNo || 'N/A', col3, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Brand & Model:', col1, y + 17);
  doc.text('Assigned Driver:', col2, y + 17);
  doc.text('Inspection Timestamp:', col3, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(tally.brandModel, col1, y + 22);
  doc.text(tally.driverName || 'Port Operator Transfer', col2, y + 22);
  doc.text(new Date(tally.createdAt).toLocaleString(), col3, y + 22);

  y += 29;

  // Inspection Checklist Table (2 Columns)
  doc.setFillColor(21, 94, 239);
  doc.rect(margin, y, 3, 10, 'F');
  doc.setTextColor(11, 31, 58);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PHYSICAL INSPECTION CHECKLIST', margin + 6, y + 7);

  y += 13;
  const checklist = tally.checklist || [];
  const mid = Math.ceil(checklist.length / 2);
  const leftColItems = checklist.slice(0, mid);
  const rightColItems = checklist.slice(mid);

  const drawChecklistColumn = (items: typeof checklist, startX: number) => {
    let currY = y;
    items.forEach((item) => {
      doc.setFillColor(255, 255, 255);
      doc.rect(startX, currY, 86, 6, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.name || item.label, startX + 2, currY + 4.2);

      // Status indicator
      if (item.status === 'OK') {
        doc.setTextColor(18, 183, 106);
        doc.setFont('helvetica', 'bold');
        doc.text('OK [✓]', startX + 70, currY + 4.2);
      } else if (item.status === 'Missing') {
        doc.setTextColor(240, 68, 56);
        doc.setFont('helvetica', 'bold');
        doc.text('MISSING [✗]', startX + 62, currY + 4.2);
      } else if (item.status === 'Damaged') {
        doc.setTextColor(247, 144, 9);
        doc.setFont('helvetica', 'bold');
        doc.text('DAMAGED [!]', startX + 62, currY + 4.2);
      } else {
        doc.setTextColor(148, 163, 184);
        doc.text('N/A', startX + 72, currY + 4.2);
      }
      currY += 6.5;
    });
  };

  drawChecklistColumn(leftColItems, margin);
  drawChecklistColumn(rightColItems, margin + 92);

  y += Math.max(leftColItems.length, rightColItems.length) * 6.5 + 4;

  // Damage Information
  doc.setFillColor(21, 94, 239);
  doc.rect(margin, y, 3, 10, 'F');
  doc.setTextColor(11, 31, 58);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RECORDED DAMAGE & EXCEPTIONS', margin + 6, y + 7);

  y += 13;
  if (!tally.damages || tally.damages.length === 0) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 9, 1.5, 1.5, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text('✓ No physical damage or cargo exceptions identified during vessel discharge.', margin + 4, y + 6);
    y += 14;
  } else {
    tally.damages.forEach((dmg) => {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 1.5, 1.5, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(153, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${dmg.category.toUpperCase()}] ${dmg.location} (${dmg.severity} Severity)`, margin + 4, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Remarks: ${dmg.remarks}`, margin + 4, y + 8.5);
      y += 12;
    });
  }

  // QR Code & Signatures Section
  const bottomBoxY = pageHeight - 52;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, bottomBoxY, pageWidth - margin * 2, 36, 2, 2, 'FD');

  // Embed QR Code
  if (tally.qrCodeDataUrl) {
    try {
      doc.addImage(tally.qrCodeDataUrl, 'PNG', margin + 4, bottomBoxY + 3, 30, 30);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(11, 31, 58);
      doc.text('SCAN TO VERIFY', margin + 8, bottomBoxY + 34);
    } catch (e) {
      console.warn('QR Code embedding notice:', e);
    }
  }

  // Security Officer Signature Info
  const sigX1 = margin + 40;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('RECORDED BY (SECURITY OFFICER):', sigX1, bottomBoxY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Name: ${tally.createdBy.name} (${tally.createdBy.badgeNo})`, sigX1, bottomBoxY + 14);
  doc.text(`Terminal Device: ${tally.deviceId}`, sigX1, bottomBoxY + 19);
  doc.text(`Time: ${new Date(tally.createdAt).toLocaleString()}`, sigX1, bottomBoxY + 24);

  // Supervisor Approval Info
  const sigX2 = margin + 110;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VERIFIED & APPROVED BY:', sigX2, bottomBoxY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  if (tally.approvalDetails) {
    doc.text(`Supervisor: ${tally.approvalDetails.supervisorName}`, sigX2, bottomBoxY + 14);
    doc.text(`Approved Date: ${new Date(tally.approvalDetails.approvedAt).toLocaleString()}`, sigX2, bottomBoxY + 19);
    doc.text(`Digital Sign Status: Verified & System Locked`, sigX2, bottomBoxY + 24);
  } else {
    doc.setTextColor(247, 144, 9);
    doc.text('PENDING SUPERVISOR VERIFICATION', sigX2, bottomBoxY + 14);
  }

  // Footer Disclaimer
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is a certified electronic tally generated by HIPG Digital Tally & Verification System (DTVS). Hambantota International Port Services Co. (Pvt) Ltd.',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  // Trigger download
  doc.save(`${tally.referenceNo}_${tally.vehicleNo}.pdf`);
}

