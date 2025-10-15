import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // necesario para manejar archivos
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Método no permitido");
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send("Error al procesar archivos.");

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const attachments = [];
      for (const key in files) {
        const file = files[key];
        attachments.push({
          filename: file.originalFilename,
          content: fs.createReadStream(file.filepath),
        });
      }

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `Nueva solicitud de facturación - Restaurante Michessanfa`,
        text: `Correo del cliente: ${fields.email}`,
        attachments,
      });

      res.status(200).send("Correo enviado correctamente.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al enviar correo.");
    }
  });
}
