/**
 * Script para crear usuario admin usando la API de Supabase Auth
 * Este script usa la API REST para crear el usuario con el hash de contraseña correcto
 */

const SUPABASE_URL = 'https://zchgadeyouofdvyamgpq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está definida');
  console.error('   Ejecuta: $env:SUPABASE_SERVICE_ROLE_KEY="tu_key"');
  process.exit(1);
}

async function createAdminUser() {
  console.log('🔧 Creando usuario admin usando API de Supabase Auth...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@dev.app',
        password: '123-123-123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Master Administrador'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error creando usuario:', data);
      process.exit(1);
    }

    console.log('✅ Usuario creado exitosamente:\n');
    console.log('   ID:', data.id);
    console.log('   Email:', data.email);
    console.log('   Email confirmado:', data.email_confirmed_at);
    console.log('\n📝 Ahora actualizando el perfil en public.profiles...\n');

    // Actualizar perfil
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify({
        id: data.id,
        full_name: 'Master Administrador',
        role: 'super_admin'
      })
    });

    if (!profileResponse.ok) {
      console.error('❌ Error actualizando perfil:', await profileResponse.json());
      process.exit(1);
    }

    console.log('✅ Perfil actualizado exitosamente\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('CREDENCIALES DE DESARROLLO:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📧 Email:    admin@dev.app`);
    console.log(`🔑 Password: 123-123-123`);
    console.log(`👤 Rol:      super_admin`);
    console.log(`🌐 URL:      http://localhost:3000/master/login`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
