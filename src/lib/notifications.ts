import nodemailer from 'nodemailer'

interface ConsultaData {
  nombre: string
  email: string
  telefono: string
  mensaje: string
}

/**
 * Send email + WhatsApp notifications when a new consulta is received.
 * Each channel catches its own errors independently.
 */
export async function sendConsultaNotifications(data: ConsultaData) {
  console.log('[Notif] 📨 Nueva consulta de:', data.nombre, '|', data.email)

  // Run both in parallel — one failing doesn't affect the other
  const results = await Promise.allSettled([
    sendEmailNotification(data),
    sendWhatsAppNotification(data),
  ])

  const emailStatus = results[0].status === 'fulfilled' ? '✅' : '❌'
  const waStatus = results[1].status === 'fulfilled' ? '✅' : '❌'
  console.log(`[Notif] Resultados: Email ${emailStatus} | WhatsApp ${waStatus}`)
}

/**
 * Email notification via nodemailer (Gmail SMTP).
 * Requires env vars: SMTP_USER, SMTP_PASS
 * Optional: SMTP_HOST (default: smtp.gmail.com), SMTP_PORT (default: 587), ADMIN_EMAIL
 */
async function sendEmailNotification(data: ConsultaData) {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpUser || !smtpPass) {
    console.log('[Notif-Email] ⚠️ SMTP credentials not configured (SMTP_USER/SMTP_PASS missing), skipping email')
    return
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  const adminEmail = process.env.ADMIN_EMAIL || smtpUser

  console.log(`[Notif-Email] Conectando a ${smtpHost}:${smtpPort} como ${smtpUser} → enviando a ${adminEmail}`)

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  const whatsappReplyLink = data.telefono
    ? `https://wa.me/${data.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${data.nombre}, gracias por contactarte con Pastas Orlando.`)}`
    : null

  try {
    const info = await transporter.sendMail({
      from: `"Pastas Orlando Web" <${smtpUser}>`,
      to: adminEmail,
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

    console.log('[Notif-Email] ✅ Email enviado OK — MessageId:', info.messageId)
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    const errCode = (error as { code?: string })?.code || ''
    console.error(`[Notif-Email] ❌ Error enviando email [${errCode}]: ${errMsg}`)
  } finally {
    transporter.close()
  }
}

/**
 * WhatsApp notification via CallMeBot API.
 * Requires env vars: ADMIN_PHONE, CALLMEBOT_API_KEY
 * This is optional — if not configured, it silently skips.
 *
 * SETUP: Add +34 644 52 74 88 to contacts → send "I allow callmebot to send me messages"
 * → receive API key → set CALLMEBOT_API_KEY env var
 */
async function sendWhatsAppNotification(data: ConsultaData) {
  const adminPhone = process.env.ADMIN_PHONE
  const apiKey = process.env.CALLMEBOT_API_KEY

  if (!adminPhone || !apiKey) {
    console.log('[Notif-WA] ⚠️ WhatsApp no configurado (falta ADMIN_PHONE o CALLMEBOT_API_KEY), se saltea')
    return
  }

  const waMessage = [
    `📋 *Nueva consulta - Pastas Orlando*`,
    ``,
    `👤 ${data.nombre}`,
    `📧 ${data.email}`,
    data.telefono ? `📱 ${data.telefono}` : '',
    ``,
    `💬 ${data.mensaje.length > 200 ? data.mensaje.substring(0, 200) + '...' : data.mensaje}`,
  ].filter(Boolean).join('\n')

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(adminPhone)}&text=${encodeURIComponent(waMessage)}&apikey=${encodeURIComponent(apiKey)}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(`[Notif-WA] ❌ CallMeBot error ${response.status}: ${body}`)
      return
    }

    console.log('[Notif-WA] ✅ WhatsApp enviado OK a', adminPhone)
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(`[Notif-WA] ❌ Error enviando WhatsApp: ${errMsg}`)
  }
}
