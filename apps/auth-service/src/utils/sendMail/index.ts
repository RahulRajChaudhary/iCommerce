
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// MAIL TEMPLATE

const renderEmailTemplate = async(templateName: string , data:Record<string , any>) : Promise<string> => {
  const templatePath = path.join(process.cwd(),
    "auth-service",
    "src",
    "utils",
    "sendMail",
    "email-templates",
    `${templateName}.ejs`
  );
  return ejs.renderFile(templatePath, data);
}


// sending mail

export const sendEmail = async (to:string , subject:string , templateName:string , data:Record<string , any>) => {
  try {
    const html = await renderEmailTemplate(templateName, data);

    await transport.sendMail({
      from: `${process.env.SMTP_USER}`,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.log("Error in sending mail", error);
    return false
  }
}