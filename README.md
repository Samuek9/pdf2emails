# PDF2Emails — Extrae correos de cualquier PDF

> Repositorio: https://github.com/Samuek9/pdf2emails · Dominio: https://pdf2emails.com

Micro-SaaS **client-side**: arrastra un PDF y extrae todos los correos electrónicos en tu navegador
con `pdfjs-dist`, los filtra (genéricos y personales) y los exporta a CSV/TXT. Los primeros 5
correos son gratis; la lista completa se desbloquea con un pago único por **paridad de precios (PPP)**
según el país del visitante.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Lucide Icons
- `pdfjs-dist` para leer PDFs 100% en el navegador (el archivo nunca se sube a un servidor)
- Wompi (tarjeta internacional) + dLocal Go (PSE/Pix/OXXO) — con **modo demo** si no hay credenciales
- PostHog (opcional) para el tracking del embudo; sin key se loguea por consola en dev

## Estructura

```
pdf2emails/
  src/
    middleware.ts              # Geolocalizacion -> cookie user_country (PPP)
    app/
      layout.tsx               # Header + Footer + metadata SEO
      page.tsx                 # Landing: hero, extractor, precios, FAQ, CTA
      globals.css              # Tailwind + clases de UI
      api/wompi/
        create-intent/route.ts # Crea transaccion WOMPI + firma de integridad
        verify/route.ts        # Consulta estado de una transaccion WOMPI
    lib/
      pdf.ts                   # Extraccion de texto con pdfjs-dist
      emails.ts                # Regex, clasificacion, filtros y dedup
      csv.ts                   # Exportacion CSV/TXT con Blobs
      pricing.ts               # PPP: LATAM $7.99 / ROW $19 + pasarelas
      countries.ts             # Listas LATAM/ROW + lectura de pais
      analytics.ts             # trackEvent + initAnalytics (PostHog lazy)
      wompi.ts                 # Helpers server-side de WOMPI
      types.ts
    components/
      PdfDropzone.tsx          # Drag & drop de PDF
      ResultsPanel.tsx         # Metricas, filtros, tabla, paywall, descarga
      CheckoutModal.tsx        # Checkout PPP (Wompi/dLocal, modo demo)
      FeedbackWidget.tsx       # Feedback de 1 clic post-descarga
      Header.tsx / Footer.tsx  # Footer incluye selector de pais (demo PPP)
```

## Desarrollo local

```bash
cd pdf2emails
npm install
cp .env.example .env.local   # ajusta NEXT_PUBLIC_DEFAULT_COUNTRY (ej: CO)
npm run dev                  # http://localhost:3000
```

Typecheck: `npm run typecheck` · Build de produccion: `npm run build`.

### Probar el flujo completo

1. Sube un PDF con correos (si no tienes uno, busca "sample PDF with emails" o crea uno con cualquier editor que guarde como PDF).
2. Verás los primeros 5 correos + métricas. Si hay más de 5, aparecerá el paywall.
3. Haz clic en "Desbloquear y descargar" → checkout con el precio según el país.
4. En **modo demo** (sin credenciales) el pago se simula; luego descarga el CSV/TXT.
5. Tras descargar aparece el widget de feedback.
6. Cambia el país en el pie de página para ver la paridad de precios LATAM vs ROW.

## Paridad de precios (PPP)

| Región | Precio | Pasarela principal | Secundaria |
|---|---|---|---|
| LATAM (CO, MX, AR, CL, PE, BR…) | $7.99 USD (~ $32,000 COP) | dLocal Go (PSE/Pix/OXXO) | Wompi |
| Resto del mundo | $19 USD | Wompi (tarjeta internacional) | dLocal Go |

El país se detecta por `x-vercel-ip-country` (Vercel). En local, usa `NEXT_PUBLIC_DEFAULT_COUNTRY`.
El middleware lo guarda en la cookie `user_country`.

## Pagos (modo demo vs real)

- **Sin credenciales** → el checkout corre en **modo demo**: el pago se simula para validar el embudo.
- **Wompi real**: define `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY` y `WOMPI_INTEGRITY_KEY`
  en el servidor. El frontend usa el widget `checkout.wompi.co/widget.js` y las rutas
  `/api/wompi/create-intent` y `/api/wompi/verify` crean/verifican la transaccion.
- **dLocal Go real** (PSE, Pix, OXXO, tarjetas locales): define `DLOCAL_API_KEY`, `DLOCAL_SECRET_KEY`
  y `DLOCAL_ENV` (`sbx` o `live`). El cliente crea un payment link en `/api/dlocal/create-payment` y
  redirige al checkout de dLocal Go (`redirect_url`). Al volver a `/ ?paid=1` la landing desbloquea.
  El webhook `/api/dlocal/webhook` confirma los cambios de estado (el siguiente paso es persistirlo
  en una base de datos para el desbloqueo verificado por servidor).
- La config de que pasarelas estan vivas se expone en `/api/payments/config`; el modo demo solo se
  muestra cuando ninguna esta configurada.

> **Keys de dLocal Go**: se obtienen en **https://dashboard.dlocalgo.com** (live) o
> **https://dashboard-sbx.dlocalgo.com** (sandbox, crea una cuenta de prueba) →
> **Integrations → API Integration** → "API Key" y "Secret Key". La Secret Key **nunca** se expone
> al cliente. Para probar en sandbox puedes usar las tarjetas de prueba `4111 1111 1111 1111`
> (aprobada) y `5555 5555 5555 4444` (rechazada).

## Tracking del embudo (PostHog opcional)

Eventos registrados por `trackEvent`:

1. `page_viewed`
2. `pdf_uploaded` (`numPages`, `fileSizeBytes`)
3. `preview_rendered` (`totalEmailsFound`, `numPages`)
4. `samples_copied`
5. `checkout_clicked` (`gateway`, `price`, `currency`, `country`, `region`)
6. `payment_successful` (idem)
7. `csv_downloaded` (`format`, `totalEmails`)
8. `user_feedback_submitted` (`rating`)

Para activarlo, crea un proyecto en [PostHog](https://posthog.com) y pon `NEXT_PUBLIC_POSTHOG_KEY`.

Métricas que importan (las 5 del embudo): visitantes → clic "Free Audit" → uploads → audits
completados → pagos.

## Despliegue (Vercel)

1. Sube la carpeta a un repo (o usa `vercel` CLI desde `pdf2emails/`):
   ```bash
   cd pdf2emails
   npx vercel
   ```
2. En Vercel añade las variables de entorno del `.env.example`.
3. Ve a **Settings → Domains** y añade `pdf2emails.com` y `www.pdf2emails.com`.

### Apuntar el dominio (Namecheap → Vercel)

Opción recomendada (cambiar nameservers):
- En Namecheap: **Domain → Nameservers → Custom DNS** → `ns1.vercel-dns.com` y `ns2.vercel-dns.com`.
- Vercel se encarga del apex y del `www` automáticamente.

Opción alternativa (mantener DNS de Namecheap):
- Registro **A** `@` → `76.76.21.21`
- Registro **CNAME** `www` → `cname.vercel-dns.com`

El TLS/SSL se emite automáticamente (Let's Encrypt). Desactiva el "Redirect Domain" de Namecheap si
lo tenías activo para evitar bucles.

## Siguientes pasos (roadmap de validación)

- [ ] Lanzar landing + conectar dominio
- [ ] Google Ads con keywords de alta intención (duplicate invoice detector, pdf email extractor…)
- [ ] Publicación en comunidades (Reddit / Facebook Groups LATAM) con mensaje educativo
- [ ] dLocal Go real
- [ ] Autenticación + "audit" reutilizable con historial
- [ ] Decidir precio: pago único por PDF vs suscripción vs performance pricing
