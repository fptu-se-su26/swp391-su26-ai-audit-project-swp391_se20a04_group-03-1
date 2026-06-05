// Import the Nodemailer library
import nodemailer from "nodemailer";

export const sendMail = (email: string, title: string, content: string) => {
  // Create a transporter object
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use false for STARTTLS; true for SSL on port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP,
    },
  });

  // Configure the mailoptions object
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: title,
    html: content,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};
