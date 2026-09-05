package com.railway.payment_service.service;

import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Autowired
    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendEmailWithAttachment(String toEmail, String subject, String body, byte[] attachmentData, String fileName) throws MailException, MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

        // Set email details
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body);
        ByteArrayDataSource dataSource = new ByteArrayDataSource(attachmentData, "application/pdf");
        helper.addAttachment(fileName, dataSource);

        // Send email
        javaMailSender.send(mimeMessage);
    }
}
