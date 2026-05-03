package com.pfeproject.GoRide.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service de gestion des emails pour GoRide.
 * Envoie des notifications HTML de manière asynchrone pour ne pas ralentir l'API.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Envoie un email de bienvenue à un nouvel utilisateur.
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "GoRide Team");
            helper.setTo(toEmail);
            helper.setSubject("Bienvenue sur GoRide ! \uD83D\uDE97");

            logger.info("[REGISTER EMAIL] Sending to: {}", toEmail);

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                    "  <div style='max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;'>" +
                    "    <div style='background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; text-align: center;'>" +
                    "      <h1 style='color: white; margin: 0;'>GoRide</h1>" +
                    "    </div>" +
                    "    <div style='padding: 30px;'>" +
                    "      <h2>Bonjour " + firstName + " !</h2>" +
                    "      <p>Nous sommes ravis de vous accueillir sur <strong>GoRide</strong>, votre plateforme de transport intelligente.</p>" +
                    "      <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos services :</p>" +
                    "      <ul style='color: #64748b;'>" +
                    "        <li>Réserver des trajets en un clic</li>" +
                    "        <li>Gérer votre profil et vos préférences</li>" +
                    "        <li>Suivre vos réservations en temps réel</li>" +
                    "      </ul>" +
                    "      <div style='text-align: center; margin-top: 40px;'>" +
                    "        <a href='http://localhost:4200/login' style='background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;'>Accéder à la plateforme</a>" +
                    "      </div>" +
                    "    </div>" +
                    "    <div style='background-color: #f8fafc; padding: 20px; text-align: center; font-size: 0.85rem; color: #64748b;'>" +
                    "      &copy; 2026 GoRide. Tous droits réservés." +
                    "    </div>" +
                    "  </div>" +
                    "</body>" +
                    "</html>";

            logger.info("[EMAIL] Début du processus d'envoi pour : {}", toEmail);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("[EMAIL] SUCCÈS : Email de bienvenue envoyé à {}", toEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            logger.error("[EMAIL] ÉCHEC : Erreur lors de l'envoi à {} | Raison : {}", toEmail, e.getMessage());
        }
    }
}
