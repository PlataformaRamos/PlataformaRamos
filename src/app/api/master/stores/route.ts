import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'

export async function POST(req: Request) {
  try {
    // 1. Validar sesión del Super Administrador
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 })
    }

    // 2. Parsear parámetros
    const { storeId, action, reason, planId } = await req.json()

    if (!storeId || !action || !reason) {
      return NextResponse.json({ error: 'Parámetros insuficientes' }, { status: 400 })
    }

    if (reason.trim().length < 5) {
      return NextResponse.json({ error: 'El motivo es demasiado corto (mínimo 5 caracteres)' }, { status: 400 })
    }

    // 3. Crear cliente administrativo de Supabase (Bypass RLS)
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Obtener información de la tienda actual
    const { data: store, error: storeError } = await adminSupabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // 5. Obtener correo del propietario desde auth.users
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(store.owner_id)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Propietario de la tienda no encontrado' }, { status: 404 })
    }
    const ownerEmail = userData.user.email!
    const ownerName = userData.user.user_metadata?.full_name || 'Comerciante'

    let updatedFields: any = {}
    let auditAction = ''
    let emailSubject = ''
    let emailHtml = ''

    const supportEmail = 'soporte@rutaslima.app'

    // Estilo común para los correos
    const emailHeaderStyle = `
      background-color: #0F172A;
      padding: 32px 24px;
      text-align: center;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    `
    const emailBodyStyle = `
      padding: 32px 24px;
      background-color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
      border: 1px solid #E2E8F0;
      border-top: none;
    `

    // 6. Procesar acción
    if (action === 'suspend' || action === 'activate') {
      const newStatus = action === 'activate'
      updatedFields = { is_active: newStatus }
      auditAction = newStatus ? 'activate_store' : 'suspend_store'

      const { error: updateError } = await adminSupabase
        .from('stores')
        .update(updatedFields)
        .eq('id', storeId)

      if (updateError) throw updateError

      // Configurar Correo
      if (newStatus) {
        emailSubject = `¡Tu tienda "${store.name}" vuelve a estar activa! ⚡`
        emailHtml = `
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="${emailHeaderStyle}">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Tienda Reactivada</h1>
            </div>
            <div style="${emailBodyStyle}">
              <p>Hola <strong>${ownerName}</strong>,</p>
              <p>Nos complace informarte que tu tienda <strong>"${store.name}"</strong> en Plataforma Ramos ha sido reactivada por nuestro equipo administrativo.</p>
              <div style="background-color: #F8FAFC; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Motivo de reactivación:</strong></p>
                <p style="margin: 4px 0 0 0; font-style: italic; color: #1E293B;">"${reason.trim()}"</p>
              </div>
              <p>Ya puedes acceder nuevamente a tu panel de control y tus clientes pueden continuar realizando pedidos en tu catálogo.</p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="https://rutaslima.app/dashboard" style="background-color: #4F46E5; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);">Acceder a mi Panel</a>
              </div>
              <p style="font-size: 12px; color: #64748B; border-top: 1px solid #F1F5F9; padding-top: 16px; margin-top: 24px;">Si tienes preguntas o inquietudes, puedes responder a este correo o escribir a nuestro equipo en ${supportEmail}.</p>
            </div>
          </div>
        `
      } else {
        emailSubject = `IMPORTANTE: Tu tienda "${store.name}" ha sido suspendida`
        emailHtml = `
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="${emailHeaderStyle}">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Tienda Suspendida</h1>
            </div>
            <div style="${emailBodyStyle}">
              <p>Hola <strong>${ownerName}</strong>,</p>
              <p>Lamentamos informarte que tu tienda <strong>"${store.name}"</strong> en Plataforma Ramos ha sido suspendida de forma temporal por el equipo de administración.</p>
              <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #991B1B;"><strong>Motivo de la suspensión:</strong></p>
                <p style="margin: 4px 0 0 0; font-style: italic; color: #7F1D1D;">"${reason.trim()}"</p>
              </div>
              <p>Durante la suspensión, tu catálogo público no estará visible para los clientes y tu acceso al panel de administración estará restringido. Si consideras que se trata de un error o deseas resolver esta situación, ponte en contacto con soporte técnico.</p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="mailto:${supportEmail}?subject=Apelacion%20Suspension%20${encodeURIComponent(store.name)}" style="background-color: #EF4444; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">Contactar a Soporte</a>
              </div>
              <p style="font-size: 12px; color: #64748B; border-top: 1px solid #F1F5F9; padding-top: 16px; margin-top: 24px;">Atentamente,<br/>El Equipo de Plataforma Ramos</p>
            </div>
          </div>
        `
      }

    } else if (action === 'change_plan') {
      const currentPlan = store.plan_id
      const newPlan = planId || (currentPlan === 'free' ? 'premium' : 'free')
      const newExpiration = newPlan === 'premium'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null

      updatedFields = { plan_id: newPlan, plan_expires_at: newExpiration }
      auditAction = 'change_plan'

      const { error: updateError } = await adminSupabase
        .from('stores')
        .update(updatedFields)
        .eq('id', storeId)

      if (updateError) throw updateError

      // Configurar Correo
      if (newPlan === 'premium') {
        emailSubject = `¡Tu tienda "${store.name}" ha sido promovida a Premium! 👑`
        const dateStr = new Date(newExpiration!).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
        emailHtml = `
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="${emailHeaderStyle}">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">👑 ¡Bienvenido a Premium!</h1>
            </div>
            <div style="${emailBodyStyle}">
              <p>Hola <strong>${ownerName}</strong>,</p>
              <p>¡Excelentes noticias! Tu tienda <strong>"${store.name}"</strong> en Plataforma Ramos ha sido ascendida al <strong>Plan Premium (Plan Pro)</strong>.</p>
              
              <div style="background-color: #EEF2F6; border: 1px solid #E2E8F0; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #1E293B; font-size: 14px;">Tus nuevos beneficios activos:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px;">
                  <li style="margin-bottom: 8px;"><strong>Límite extendido:</strong> Sube hasta <strong>1,000 productos</strong> activos en tu catálogo.</li>
                  <li style="margin-bottom: 8px;"><strong>Prioridad de soporte:</strong> Atención preferencial por parte de nuestro equipo.</li>
                  <li style="margin-bottom: 8px;"><strong>Vigencia del plan:</strong> Hasta el <strong>${dateStr}</strong>.</li>
                </ul>
              </div>

              <div style="background-color: #F8FAFC; border-left: 4px solid #6366F1; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Motivo del cambio:</strong></p>
                <p style="margin: 4px 0 0 0; font-style: italic; color: #1E293B;">"${reason.trim()}"</p>
              </div>

              <p>Ya puedes acceder a tu panel y disfrutar de todas las herramientas avanzadas sin límites.</p>
              
              <div style="margin: 28px 0; text-align: center;">
                <a href="https://rutaslima.app/dashboard" style="background-color: #6366F1; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.15);">Ir a mi Panel Premium</a>
              </div>
              <p style="font-size: 12px; color: #64748B; border-top: 1px solid #F1F5F9; padding-top: 16px; margin-top: 24px;">Gracias por confiar en Plataforma Ramos para hacer crecer tu negocio.</p>
            </div>
          </div>
        `
      } else {
        emailSubject = `Actualización de plan: Tu tienda "${store.name}" cambió al Plan Gratuito`
        emailHtml = `
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="${emailHeaderStyle}">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Actualización de Suscripción</h1>
            </div>
            <div style="${emailBodyStyle}">
              <p>Hola <strong>${ownerName}</strong>,</p>
              <p>Te notificamos que el plan de tu tienda <strong>"${store.name}"</strong> en Plataforma Ramos ha sido modificado al <strong>Plan Gratuito</strong>.</p>
              
              <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #B45309;"><strong>Motivo de la actualización:</strong></p>
                <p style="margin: 4px 0 0 0; font-style: italic; color: #78350F;">"${reason.trim()}"</p>
              </div>

              <p>A partir de este momento, los límites del Plan Gratuito vuelven a aplicarse sobre tu cuenta, lo que restringe el catálogo a un máximo de <strong>20 productos activos</strong>.</p>
              <p>Si consideras que ha sido un error, por favor ponte en contacto con nuestro equipo administrativo.</p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="https://rutaslima.app/dashboard" style="background-color: #475569; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">Ver mi Consumo de Plan</a>
              </div>
              <p style="font-size: 12px; color: #64748B; border-top: 1px solid #F1F5F9; padding-top: 16px; margin-top: 24px;">Atentamente,<br/>El Equipo de Plataforma Ramos</p>
            </div>
          </div>
        `
      }
    }

    // 7. Insertar bitácora platform_audit_logs
    await adminSupabase.from('platform_audit_logs').insert({
      admin_id: user.id,
      action: auditAction,
      target_id: storeId,
      target_name: store.name,
      reason: reason.trim(),
    })

    // 8. Despachar correo electrónico mediante Resend
    try {
      await sendEmail({
        to: ownerEmail,
        subject: emailSubject,
        html: emailHtml,
      })
    } catch (emailErr) {
      // Registramos el error de correo pero no abortamos la petición, ya que la base de datos ya se actualizó
      console.error('[Notification Mail Error]: Failed to dispatch email via Resend:', emailErr)
    }

    return NextResponse.json({ success: true, updatedFields })

  } catch (err: any) {
    console.error('[Master Store Action API Error]:', err)
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 })
  }
}
