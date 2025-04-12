import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// --- CORS Configuration ---
const allowedOrigins = ['https://tulsitraditional.in']; // Replace with your real frontend domain
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
// Create Nodemailer transporter with explicit SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test the transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying transporter:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

app.post('/api/send-order-confirmation', async (req, res) => {
  const { orderDetails, userEmail } = req.body;

  if (!orderDetails || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Order Confirmation - Tulsi Fashion Store',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50; text-align: center;">Thank you for your order!</h1>
        <p>Dear ${orderDetails.firstName} ${orderDetails.lastName},</p>
        <p>Your order has been successfully placed. Here are your order details:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
          <h3 style="color: #2E7D32;">Order Summary</h3>
          ${orderDetails.cartItems.map(item => `
            <div style="margin-bottom: 10px;">
              <p style="margin: 5px 0;">
                <strong>${item.name}</strong><br>
                Size: ${item.size}<br>
                Quantity: ${item.quantity}<br>
                Price: ₹${item.price.toFixed(2)}
              </p>
            </div>
          `).join('')}
          
          <div style="border-top: 2px solid #eee; margin-top: 15px; padding-top: 15px;">
            <p><strong>Total Amount:</strong> ₹${orderDetails.total.toFixed(2)}</p>
          </div>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
          <h3 style="color: #2E7D32;">Shipping Address</h3>
          <p style="margin: 5px 0;">
            ${orderDetails.streetAddress}<br>
            ${orderDetails.apartment ? orderDetails.apartment + '<br>' : ''}
            ${orderDetails.city}, ${orderDetails.state}<br>
            ${orderDetails.pinCode}<br>
            ${orderDetails.country}
          </p>
        </div>
        
        <p>We will notify you once your order has been shipped.</p>
        <p>If you have any questions, please contact our customer support.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666;">Thank you for shopping with Tulsi Fashion Store!</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', userEmail);
    res.status(200).json({ message: 'Order confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send order confirmation email' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email configuration: Using ${process.env.EMAIL_USER}`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
