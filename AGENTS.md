# Guía de Referencia y Reglas para Agentes (AGENTS.md)

Este archivo sirve como manual de referencia técnica para los futuros agentes de Antigravity que colaboren en el desarrollo de **Plataforma Ramos**. Aquí se detallan los recursos del entorno local, las integraciones activas, las herramientas MCP disponibles y las reglas de diseño/despliegue del proyecto.

---

## 🔑 1. Configuración de Entorno e Integraciones (Extraído de `.env.local`)

El proyecto cuenta con las siguientes llaves de API, credenciales y variables de entorno configuradas localmente para su uso directo:

### ⚡ Supabase (Base de Datos, Autenticación y RLS)
*   **URL de Referencia**: `https://zchgadeyouofdvyamgpq.supabase.co`
*   **Project ID**: `zchgadeyouofdvyamgpq`
*   **Roles y Llaves**:
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Llave pública para solicitudes del lado del cliente bajo políticas RLS.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Llave administrativa para saltarse las políticas RLS (usar solo desde Server Components o API routes cuando sea estrictamente necesario).

### ☁️ Cloudflare R2 (Almacenamiento Maestro en Servidor)
*   **Bucket**: `plataforma-ramos-storage`
*   **Endpoint**: `https://a064203880b7d59f0d168a38450d6ebb.r2.cloudflarestorage.com`
*   **URL Pública**: `https://pub-a91c635ec1824acaaa2a844cdf5176a8.r2.dev`
*   *Uso*: Carga de archivos, assets de catálogo y almacenamiento a nivel de servidor.

### 🖼️ Cloudinary (Optimización y Entrega de Imágenes)
*   **Cloud Name**: `gkxz1pja`
*   *Uso*: Repositorio de cara al cliente para transformaciones rápidas, compresión dinámica de imágenes de productos y logos en tiempo real.

### ✉️ Resend (Correos Transaccionales)
*   *Uso*: Envío de correos de confirmación, reportes de compras y notificaciones a los comerciantes.

### 🌐 Dominio Base (Multi-tenant)
*   **Root Domain**: `rutaslima.app`
*   *Uso*: Gestión de subdominios a nivel de middleware (inquilinato multi-tenant) para resolver las URL del tipo `tienda.rutaslima.app` o subdominios alternativos.

### 🔐 Google OAuth (Autenticación Social)
*   *Uso*: Registro e inicio de sesión simplificado con un solo clic.

### 📐 Vercel Integration
*   **Project ID**: `prj_PV1IuU4L4ZRnxBhKnU70J13B374B`
*   **Team ID**: `team_8tbBkejCfQeb8An4hzfcaa09`
*   *Uso*: Despliegues automatizados y gestión de alias de dominio.

---

## 🛠️ 2. Herramientas MCP Habilitadas

### Server `supabase`
Permite administrar la base de datos SQL remota utilizando los siguientes comandos útiles:
*   `list_tables`: Muestra las tablas y el número de filas en tiempo real.
*   `execute_sql`: Ejecuta comandos de base de datos (`ALTER TABLE`, `SELECT`, `DELETE`, etc.).
*   `list_migrations` y `apply_migration`.

### Server `StitchMCP`
Habilitado para interactuar con sistemas de diseño, variantes y edición rápida de pantallas.

---

## 🚨 3. Reglas Críticas del Proyecto que DEBES Cumplir

1.  **Idioma de las Respuestas**:
    *   Todas las respuestas y explicaciones dirigidas al usuario **deben ser estrictamente en español**.
2.  **Validación de Teléfonos (WhatsApp)**:
    *   La tabla `public.stores` utiliza un constraint de verificación de formato E.164 (`store_whatsapp_phone_format`) que requiere obligatoriamente el formato internacional con signo `+` (ejemplo: `+51987654321`). No omitas el prefijo `+` al insertar o validar el número de WhatsApp.
3.  **Uso de la Columna de Teléfono Nativa**:
    *   Usa siempre la columna **`whatsapp_phone`** en la tabla `stores` para almacenar y validar el teléfono del negocio. Evita usar o depender de la columna temporal `phone`.
4.  **Flujo de Despliegue**:
    *   **No utilices `vercel --prod`** para subir cambios manualmente a producción a menos que se indique explícitamente.
    *   **Utiliza `git push origin main`** ya que la integración con Vercel está activa y compila los commits de GitHub automáticamente al instante.
    *   Consolida tus iteraciones de forma local en tu servidor de desarrollo (`npm run dev`) y solicita aprobación o indicación de despliegue antes de empujar cambios al repositorio remoto.
5.  **Evitar Degradados con ID Dinámicos en SVG**:
    *   Debido al uso de `next-view-transitions`, los degradados lineales con referencias locales de ID (como `fill="url(#mi-gradiente)"`) se vuelven transparentes al navegar. Usa siempre **colores planos sólidos** (por ejemplo, `#EF4444`, `#3B82F6`) en los atributos `fill` y `stroke` de los polígonos de marcas y logotipos.
6.  **Protección del Super Administrador (`admin@dev.app`)**:
    *   **Prohibido eliminar el Super Admin**: Al realizar pruebas, limpiezas de base de datos o truncamientos (`TRUNCATE` / `DELETE`), nunca se debe eliminar el usuario administrador con correo `admin@dev.app` ni su perfil con rol `super_admin`.
    *   La base de datos tiene activo un trigger de seguridad en `public.profiles` (`prevent_super_admin_profile_deletion`) que abortará automáticamente cualquier transacción que intente eliminarlo directa o indirectamente (en cascada).
    *   Para hacer limpiezas sin fallar, excluye explícitamente al super admin (ej: `DELETE FROM auth.users WHERE email != 'admin@dev.app'`).
