import nodemailer from 'nodemailer'

interface ConsultaData {
  nombre: string
  email: string
  telefono: string
  mensaje: string
}

/**
 * Send email notification when a new consulta is received.
 * Fire-and-forget: if credentials are missing, it silently skips.
 *
 * WhatsApp automatic sending was removed — the email includes the client's
 * phone number and a "Responder por WhatsApp" link so Orlando can reply
 * manually, which is 100% reliable.
 */
export async function sendConsultaNotifications(data: ConsultaData) {
  await sendEmailNotification(data)
}

/**
 * Email notification via nodemailer (Gmail SMTP).
 * Requires env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */
async function sendEmailNotification(data: ConsultaData) {
  try {
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    if (!smtpUser || !smtpPass) {
      console.log('[Notif] SMTP credentials not configured, skipping email notification')
      return
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const whatsappReplyLink = data.telefono
      ? `https://wa.me/${data.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${data.nombre}, gracias por contactarte con Pastas Orlando.`)}`
      : null

    await transporter.sendMail({
      from: `"Pastas Orlando Web" <${smtpUser}>`,
      to: 'laspastasdeorlando@gmail.com',
      subject: '📬 Nueva consulta desde la web - Pastas Orlando',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #E1AD01; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #5C3A21; margin: 0; font-size: 22px;">Pastas Orlando</h1>
            <p style="color: #5C3A21; margin: 4px 0 0; font-size: 14px;">Nueva consulta desde la web</p>
          </div>
          <div style="background: #FFF8E7; padding: 20px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #5C3A21; font-weight: bold; width: 100px;">Nombre:</td>
                <td style="padding: 8px 0; color: #333;">${data.nombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #5C3A21; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #E1AD01;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #5C3A21; font-weight: bold;">Teléfono:</td>
                <td style="padding: 8px 0; color: #333;">${data.telefono || '-'}</td>
              </tr>
            </table>
            <div style="margin-top: 16px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #E1AD01;">
              <p style="color: #5C3A21; font-weight: bold; margin: 0 0 8px; font-size: 14px;">Mensaje:</p>
              <p style="color: #333; margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${data.mensaje}</p>
            </div>
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://laspastasdeorlando.vercel.app/admin/consultas"
                 style="background: #E1AD01; color: #5C3A21; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Ver en el Panel Admin
              </a>
              ${whatsappReplyLink ? `
              <a href="${whatsappReplyLink}"
                 style="background: #25D366; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin-left: 8px;">
                Responder por WhatsApp
              </a>` : ''}
            </div>
          </div>
        </div>
      `,
    })

    console.log('[Notif] Email notification sent successfully')
  } catch (error) {
    console.error('[Notif] Failed to send email notification:', error)
  }
}

// WhatsApp automatic notification removed.
// The email notification already includes the client's phone number
// and a "Responder por WhatsApp" link so Orlando can reply manually.
