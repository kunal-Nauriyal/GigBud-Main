// controllers/notificationController.js
import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js'; // Adjust path if needed

// Configure your email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 📌 API to send email notification
export const sendNotification = async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        if (!email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Email, subject, and message are required' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text: message
        };

        await transporter.sendMail(mailOptions);

        // Optionally save to DB
        // await Notification.create({ email, subject, message });

        return res.status(200).json({ success: true, message: 'Notification email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};

// 📌 API to get all notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};
