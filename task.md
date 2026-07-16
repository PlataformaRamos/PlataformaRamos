# Tareas — Reestructuración de Landing Page a Sub-rutas

- [ ] 1. Crear componentes de marketing compartidos
  - [ ] 1.1 Crear `src/components/marketing/Header.tsx` (con enlaces /faq, /precios, etc.)
  - [ ] 1.2 Crear `src/components/marketing/Footer.tsx`
  - [ ] 1.3 Crear `src/app/(marketing)/layout.tsx` (unifica Header y Footer para el grupo marketing)
- [ ] 2. Crear las páginas individuales de sub-rutas
  - [ ] 2.1 Crear `src/app/(marketing)/caracteristicas/page.tsx`
  - [ ] 2.2 Crear `src/app/(marketing)/como-funciona/page.tsx`
  - [ ] 2.3 Crear `src/app/(marketing)/precios/page.tsx`
  - [ ] 2.4 Crear `src/app/(marketing)/faq/page.tsx`
  - [ ] 2.5 Crear `src/app/(marketing)/nosotros/page.tsx`
- [ ] 3. Mover y simplificar la página de inicio
  - [ ] 3.1 Mover `src/app/page.tsx` a `src/app/(marketing)/page.tsx`
  - [ ] 3.2 Remover las secciones redundantes de `page.tsx` (características, pasos, precios, faq)
- [ ] 4. Verificación y pruebas
  - [ ] 4.1 Validar compilación con `npx tsc --noEmit`
  - [ ] 4.2 Validar build con `npm run build`
  - [ ] 4.3 Git push e integración
