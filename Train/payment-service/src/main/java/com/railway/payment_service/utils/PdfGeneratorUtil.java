package com.railway.payment_service.utils;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.railway.payment_service.dto.ReservationResponseDTO;
import com.railway.payment_service.dto.PassengerDTO;
import java.awt.Color;

import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;
import java.util.List;

public class PdfGeneratorUtil {

    public static byte[] generateReservationPdf(ReservationResponseDTO reservation) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            
            // Set PDF metadata to ensure proper encoding
            document.addCreator("Railway Reservation System");
            document.addTitle("Railway Ticket");
            
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
            Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.GREEN);

            // Title
            Paragraph title = new Paragraph("Railway Reservation Ticket", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            // Status
            Paragraph status = new Paragraph("CONFIRMED - PAYMENT SUCCESSFUL", statusFont);
            status.setAlignment(Element.ALIGN_CENTER);
            status.setSpacingAfter(20);
            document.add(status);

            // Reservation Details Table
            PdfPTable reservationTable = new PdfPTable(2);
            reservationTable.setWidthPercentage(100);
            reservationTable.setSpacingBefore(10);
            reservationTable.setSpacingAfter(10);

            // Header
            PdfPCell headerCell1 = new PdfPCell(new Phrase("Reservation Details:", headerFont));
            headerCell1.setColspan(2);
            headerCell1.setBackgroundColor(new Color(52, 152, 219));
            headerCell1.setPadding(10);
            headerCell1.setHorizontalAlignment(Element.ALIGN_CENTER);
            reservationTable.addCell(headerCell1);

            // Add reservation details
            addTableRow(reservationTable, "Field", "Value", headerFont, new Color(52, 152, 219));
            addTableRow(reservationTable, "PNR Number", reservation.getPnrNumber(), bodyFont, Color.WHITE);
            addTableRow(reservationTable, "Train Number", String.valueOf(reservation.getTrainNumber()), bodyFont, Color.LIGHT_GRAY);
            addTableRow(reservationTable, "Train Name", reservation.getTrainName(), bodyFont, Color.WHITE);
            addTableRow(reservationTable, "Journey Date", reservation.getJourneyDate().toString(), bodyFont, Color.LIGHT_GRAY);
            addTableRow(reservationTable, "Class Type", reservation.getClassType(), bodyFont, Color.WHITE);
            addTableRow(reservationTable, "Seats Booked", String.valueOf(reservation.getNumberOfSeats()), bodyFont, Color.LIGHT_GRAY);
            
            // Get first passenger name
            String passengerName = "N/A";
            if (reservation.getPassengers() != null && !reservation.getPassengers().isEmpty()) {
                passengerName = reservation.getPassengers().get(0).getName();
            }
            addTableRow(reservationTable, "Passenger Name", passengerName, bodyFont, Color.WHITE);
            addTableRow(reservationTable, "Booking Status", "CONFIRMED", bodyFont, Color.LIGHT_GRAY);
            addTableRow(reservationTable, "Reservation Time", "", bodyFont, Color.WHITE);

            document.add(reservationTable);

            // Payment Details Table
            PdfPTable paymentTable = new PdfPTable(2);
            paymentTable.setWidthPercentage(100);
            paymentTable.setSpacingBefore(10);
            paymentTable.setSpacingAfter(10);

            // Payment Header
            PdfPCell paymentHeaderCell = new PdfPCell(new Phrase("Payment Details:", headerFont));
            paymentHeaderCell.setColspan(2);
            paymentHeaderCell.setBackgroundColor(new Color(46, 204, 113));
            paymentHeaderCell.setPadding(10);
            paymentHeaderCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            paymentTable.addCell(paymentHeaderCell);

            // Add payment details
            addTableRow(paymentTable, "Field", "Value", headerFont, new Color(46, 204, 113));
            addTableRow(paymentTable, "Payment Status", "SUCCESS", bodyFont, Color.WHITE);
            addTableRow(paymentTable, "Payment Method", "CARD", bodyFont, Color.LIGHT_GRAY);
            
            // Format amount with only basic ASCII characters - no currency symbols at all
            DecimalFormat df = new DecimalFormat("0.00");
            String amountStr = df.format(reservation.getTotalFare());
            String formattedAmount = amountStr; // Just the number, no currency symbol
            System.out.println("DEBUG: Formatted amount for PDF: '" + formattedAmount + "'");
            addTableRow(paymentTable, "Total Amount", formattedAmount, bodyFont, Color.WHITE);
            addTableRow(paymentTable, "Payment Date", "", bodyFont, Color.LIGHT_GRAY);

            document.add(paymentTable);

            // Passenger Details
            if (reservation.getPassengers() != null && !reservation.getPassengers().isEmpty()) {
                Paragraph passengerTitle = new Paragraph("Passenger Details:", headerFont);
                passengerTitle.setSpacingBefore(20);
                passengerTitle.setSpacingAfter(10);
                document.add(passengerTitle);

                int num = 1;
                for (PassengerDTO passenger : reservation.getPassengers()) {
                    document.add(new Paragraph("Passenger " + num++ + ":", bodyFont));
                    document.add(new Paragraph("  Name: " + passenger.getName(), bodyFont));
                    document.add(new Paragraph("  Age: " + passenger.getAge(), bodyFont));
                    document.add(new Paragraph("  Gender: " + passenger.getGender(), bodyFont));
                    if (passenger.getAddress() != null && !passenger.getAddress().isEmpty()) {
                        document.add(new Paragraph("  Address: " + passenger.getAddress(), bodyFont));
                    }
                    document.add(new Paragraph(" "));
                }
            }

            // Footer
            Paragraph footer = new Paragraph("Thank you for choosing our railway service. Have a safe journey!", bodyFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private static void addTableRow(PdfPTable table, String field, String value, Font font, Color backgroundColor) {
        PdfPCell fieldCell = new PdfPCell(new Phrase(field, font));
        fieldCell.setBackgroundColor(backgroundColor);
        fieldCell.setPadding(8);
        table.addCell(fieldCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBackgroundColor(backgroundColor);
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }
}