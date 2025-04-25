import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: `<${process.env.EMAIL}>`,
    to: email,
    subject: "Edu club Signup OTP Code",
    html: `<h3>Your OTP is: <b>${otp}</b></h3>`,
  });
};
