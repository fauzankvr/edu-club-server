import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
}) ;

export const sendOtpEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: `<${process.env.EMAIL}>`,
    to: email,
    subject: "Edu club Signup OTP Code",
    html: `<h3>Your OTP is: <b>${otp}</b></h3>`,
  });
};

export const sendApprovalEmail = async (email: string, tempPassword: string) => {
  const mailOptions = {
    from: `<${process.env.EMAIL}>`,
    to: email,
    subject: "Your Edu Club Instructor Account is Approved",
    html: `
      <h3>Congratulations! Your instructor account has been approved.</h3>
      <p>You can now log in with the following credentials:</p>
      <ul>
        <li><b>Email:</b> ${email}</li>
        <li><b>Temporary Password:</b> ${tempPassword}</li>
      </ul>
      <p>Please log in and change your password as soon as possible.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
