# PDF2Emails — Estado del producto y hoja de ruta

> Micro-SaaS 100% client-side · `pdf2emails.com` · repo privado `Samuek9/pdf2emails` · deploy automático GitHub → Vercel.

## ✅ Implementado y en producción

### Producto
- Extracción de correos de PDF en el navegador (`pdfjs-dist`), el archivo nunca se sube.
- OCR (tesseract.js) para PDFs escaneados.
- Filtros: omitir genéricos (`info@`) y personales (`@gmail.com`).
- Exportación CSV / TXT.

### Procesamiento (upsells reales, endpoint `/api/process`)
- Verificación: sintaxis + registro MX del dominio (`valid`/`invalid`).
- Limpieza de nombres (reglas JS).
- Enriquecimiento con OpenAI (`gpt-4o-mini`): empresa + cargo.
- Extracción de teléfonos (regex sobre el texto).
- CSV: `email,status,first_name,last_name,company,title,phone`.

### Monetización
- **Híbrido**: gratis para PDFs ≤3 páginas o ≤10 correos; paywall para grandes.
- Paywall (precios por región, fuente: `src/lib/pricing.ts`):
  - LATAM (15 países dLocal): desbloquear **$7.99** · desbloquear+verificar **$12.99**.
  - Global (PayPal): **$19** · **$29**.
- **Carrito de upsells (modelo aerolínea)** — precios regionalizados (PPP):
  - Verificación anti-spam: **$2.49 LATAM / $4.99 global**
  - Enriquecer nombres/cargos: **$4.99 / $9.99**
  - Limpiar nombres: **$1.49 / $2.99**
  - Teléfonos/LinkedIn: **$1.99 / $3.99**
  - Pack plantillas Cold Email: **$4.99** (ambos)
  - **Bundle All (Ahorra 40%)**: **$11.99 LATAM / $19.99 global**
- **Cobro real** vía **PayPal** (tarjeta global, saldo PayPal o cuenta bancaria) y **dLocal Go** (PSE/Pix/OXXO). Llaves live configuradas y verificadas.
- Moneda local estimada con **tasa en vivo** (open.er-api.com) sobre el monto real.
- Límites: máx. **30 páginas** y **15 MB**.

### i18n
- 5 idiomas por geolocalización: **ES, EN, PT, FR, DE** (detecta por país; no-hispanos → inglés).

### SEO
- `sitemap.xml`, `robots.txt`, JSON-LD (WebApplication + FAQPage), OG image.
- 8 artículos de blog (ES+EN) + 3 landing de casos de uso (`/use-cases/...`).
- Contadores en vivo (frescura).

### Leads / analítica
- Formspree (`xoeaevwe`) + `/api/lead`.
- Eventos de embudo vía analytics (PostHog opcional).

### Seguridad
- Rate limiter simple en `/api/process` (protege presupuesto de OpenAI).

## ⬜ Pendientes / siguiente paso

- [x] **Subrutas por idioma** (`/es/`, `/en/`, `/pt/`, `/fr/`, `/de/`) con etiquetas `hreflang` y sitemap multilingüe. (La raíz `/` redirige 307 al idioma detectado.)
- [x] **Verificación SMTP real** conectada (QuickEmailVerification + Reoon + ZeroBounce + AbstractAPI), con fallback a MX.
- [x] Trust badges en la zona de subida (privacidad / compatibilidad / filtro inteligente).
- [x] Export a **Excel (.xlsx)**.
- [x] Términos y Condiciones + Política de Privacidad (obligatorios para pasarelas).
- [x] Correo de soporte visible en el footer.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · pdfjs-dist · tesseract.js · OpenAI · Vercel · PayPal · dLocal Go · Formspree.
