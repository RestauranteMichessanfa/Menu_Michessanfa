import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Método no permitido");

  // Configuración de formidable
  const form = formidable({ 
    multiples: true,
    // Puedes añadir límites de tamaño de archivo aquí: maxFileSize: 5 * 1024 * 1024 // 5MB
  });

  form.parse(req, async (err, fields, files) => {
    // Nota: 'fields' son ahora arrays en formidable, si solo esperas uno, usa fields.email[0]
    const clientEmail = Array.isArray(fields.email) ? fields.email[0] : fields.email;

    if (err) {
        console.error("Error al procesar formulario:", err);
        return res.status(500).send("Error al procesar archivos.");
    }

    try {
      // 1. Configurar Nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 2. Manejar Archivos y Adjuntos (Corrección aquí)
      const attachments = [];
      
      // Iterar sobre todos los campos de archivo (fields.file1, fields.file2, etc.)
      for (const key in files) {
        const fileData = files[key];

        // Asegurarse de que fileData sea un array, si Formidable retorna arrays (comportamiento por defecto)
        const fileArray = Array.isArray(fileData) ? fileData : [fileData];
        
        for (const file of fileArray) {
            // Utilizamos las propiedades filename y filepath (ya que originalFilename y filepath son las más comunes)
            if (file && file.filepath) {
                attachments.push({
                    filename: file.originalFilename || file.newFilename, // Usar originalFilename o newFilename
                    content: fs.createReadStream(file.filepath),
                });
            }
        }
      }

      // 3. Enviar Correo
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `Nueva solicitud de facturación - Restaurante Michessanfa`,
        text: `Correo del cliente: ${clientEmail}`,
        attachments,
      });

      // 4. Limpieza (Opcional pero Recomendado)
      // Cierra los streams y elimina los archivos temporales después de enviar
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