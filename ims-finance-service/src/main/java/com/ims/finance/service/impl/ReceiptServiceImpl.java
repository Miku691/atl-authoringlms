package com.ims.finance.service.impl;

import com.ims.finance.dto.TransactionDTO;
import com.ims.finance.service.ReceiptService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Implementation of ReceiptService using OpenPDF.
 */
@Service
public class ReceiptServiceImpl implements ReceiptService {

    @Override
    public byte[] generateReceipt(TransactionDTO transactionDTO) {
        Document document = new Document(PageSize.A5);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font configurations
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Header
            Paragraph header = new Paragraph("PAYMENT RECEIPT", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(new Paragraph(" ")); // Spacer

            // Info Table
            document.add(new Paragraph("Transaction ID: " + transactionDTO.getId(), normalFont));
            document.add(new Paragraph("Date: " + transactionDTO.getTransactionDate(), normalFont));
            document.add(new Paragraph("Student ID: " + transactionDTO.getStudentId(), normalFont));
            document.add(new Paragraph(" "));

            // Payment Details
            document.add(new Paragraph("Payment Details", headerFont));
            document.add(new Paragraph("--------------------------------------------------", normalFont));
            document.add(new Paragraph("Amount Paid: " + transactionDTO.getAmount(), normalFont));
            document.add(new Paragraph("Payment Mode: " + transactionDTO.getPaymentMode(), normalFont));
            document.add(new Paragraph("Reference: "
                    + (transactionDTO.getReferenceNumber() != null ? transactionDTO.getReferenceNumber() : "N/A"),
                    normalFont));
            document.add(new Paragraph("--------------------------------------------------", normalFont));
            document.add(new Paragraph(" "));

            // Footer
            document.add(new Paragraph("Collected By: " + transactionDTO.getCollectedBy(), normalFont));
            document.add(new Paragraph("Tenant ID: " + transactionDTO.getTenantId(), normalFont));
            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("Thank you for your payment!", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return out.toByteArray();
    }
}
