import { Resend } from 'resend'

// Inicializar el cliente oficial de Resend
export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key')

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

/**
 * Envía un correo electrónico transaccional utilizando el servicio de Resend.
 * @param to Dirección de destino (o array de direcciones)
 * @param subject Asunto del correo electrónico
 * @param html Plantilla o contenido en formato HTML
 * @param from Remitente del correo (por defecto usa el remitente Sandbox de Resend para pruebas)
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'Plataforma Ramos <onboarding@resend.dev>'
}: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error: any) {
    console.error('[Resend Email Error]:', error)
    throw error
  }
}
