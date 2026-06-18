import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Método no permitido");

  const form = formidable({ 
    multiples: true,
  });

  form.parse(req, async (err, fields, files) => {
    const clientEmail = Array.isArray(fields.email) ? fields.email[0] : fields.email;

    if (err) {
        console.error("Error al procesar formulario:", err);
        return res.status(500).send("Error al procesar archivos.");
    }

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
        const fileData = files[key];
        const fileArray = Array.isArray(fileData) ? fileData : [fileData];
        
        for (const file of fileArray) {
            if (file && file.filepath) {
                attachments.push({
                    filename: file.originalFilename || file.newFilename,
                    content: fs.createReadStream(file.filepath),
                });
            }
        }
      }

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `Nueva solicitud de facturación - Restaurante Michessanfa`,
        text: `Correo del cliente: ${clientEmail}`,
        attachments,
      });

      for (const attachment of attachments) {
         if (attachment.content.path) fs.unlinkSync(attachment.content.path);
      }

      res.status(200).send("Correo enviado correctamente.");
    } catch (error) {
      console.error("Error en el envío de correo:", error);
      res.status(500).send("Error al enviar correo.");
    }
  });
}