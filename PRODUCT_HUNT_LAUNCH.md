# PDF2Emails — Product Hunt Launch Kit

Guia completa para el lanzamiento en Product Hunt. Todos los textos listos para pegar (en ingles).

---

## Launch page

**Product name:** PDF2Emails

**Tagline (elegir una):**
- *Extract emails from any PDF in seconds — 100% private, in your browser.*
- *Turn PDFs into a clean, verified email list.*
- *Extract, verify & enrich emails from PDFs — your files never leave your device.*

**Description (markdown):**

```
**PDF2Emails** extracts emails and contact details from any PDF — invoices, bank statements, scanned documents, exported reports — in seconds.

**100% private.** Everything runs in your browser. Your files and your contact lists never touch a server. Unlike other extractors, nothing is uploaded anywhere.

**What it does:**
- **Extract** emails from text PDFs and scanned images (built-in OCR)
- **Deduplicate** and clean messy lists automatically
- **Verify** deliverability with SMTP checks
- **Enrich** contacts with company & job title via AI
- **Export** a ready-to-use CSV in one click

**Start free.** No account needed — extract up to 10 emails free to see the quality.

Built for SDRs, recruiters, and freelancers who are tired of copy-pasting contacts out of PDFs. Available with regional pricing across LATAM and globally.
```

**First comment / maker comment:**

```
Hey PH! 👋 I built PDF2Emails because I was tired of copying emails out of PDFs by hand — and worried about tools that upload your files to a server. So I built the extraction, OCR, and verification to run entirely in the browser: your data never leaves your device.

Try it free with your own PDF — I'd love your feedback. 🇨🇴🇪🇸🇧🇷🇫🇷🇩🇪
```

**Topics sugeridos:** `Productivity`, `Sales`, `SaaS`, `Email Marketing`, `Data & Analytics`

**Target market:**
> Freelancers, SDRs, recruiters, and small marketing agencies who handle PDFs (invoices, bank statements, resume exports, reports) and need to turn the contacts inside them into clean, verified email lists — without uploading sensitive files to a server.

**Target industries:** Sales, Marketing, Recruitment / Human Resources, SaaS, E-commerce, Consulting, Data & Analytics, Customer Service.

**Target company size:** Self-employed / Freelancer, 1–10 employees, 11–50 employees.

---

## Launch page Q&A (Make your launch page shine)

### What makes PDF2Emails unique?
PDF2Emails is the only email extractor that runs 100% in your browser — your files never touch a server. On top of that it combines four things competitors split across multiple tools: text extraction, built-in OCR for scanned PDFs, SMTP verification, and AI enrichment, all in one flow that ends in a clean CSV. No other tool gives you that combination of privacy + OCR + verification + enrichment in a single, dead-simple product.

### Why should a person choose PDF2Emails over its competitors?
Because it is more private, more complete, and more affordable. Competitors upload your PDF to their server (a real concern when your file is a list of contacts); we never do. They make you jump between an extractor, a cleaner, and a verifier; we do it in one click. They price for the US/Europe only; we offer regional pricing with local payment methods (PayPal, dLocal Go) that work in LATAM. And you can start free — up to 10 emails, no account — so you can judge quality before paying.

### How would you describe the primary audience of PDF2Emails?
SDRs and sales teams, recruiters, freelancers, and marketing agencies — anyone who receives or handles PDFs (invoices, bank statements, resume exports, reports) and needs to turn the contacts inside them into a clean, verified, ready-to-use email list. The common thread: people who are tired of manual copy-paste and worried about uploading sensitive files to random online tools.

### What's the story behind PDF2Emails?
I'm a solo founder who kept hitting the same boring problem: extracting emails from PDFs by hand, and feeling uneasy that the online tools I tried required uploading files that were full of other people's data. So I built the whole pipeline to run in the browser — extraction, OCR, verification, enrichment — which means my own files never leave my device, and neither do my users'. It started as a small micro-SaaS experiment and grew into a live, monetized product with regional pricing and SEO reach in five languages.

### Which are the primary technologies used for building PDF2Emails?
Built on Next.js, React, and TypeScript with Tailwind CSS, deployed on Vercel. PDF text extraction runs in-browser with pdf.js, OCR with Tesseract.js, SMTP verification for deliverability checks, and OpenAI for AI enrichment. Analytics via PostHog, and payments integrated with dLocal Go (LATAM) and PayPal (global).

### Who are some of the biggest customers of PDF2Emails?
<!-- Reemplazar con clientes reales; nunca inventar nombres de empresas. -->
- [Cliente real — agencia de ventas / SDR]
- [Cliente real — reclutador / agencia de talento]
- [Cliente real — freelancer / consultora]
- [Cliente real — equipo de marketing]

---

## FAQ (hilo / comentarios)

| Pregunta | Respuesta |
|---|---|
| Is it safe? Do you upload my PDFs? | No. Everything runs client-side in your browser — your files and lists never touch a server. |
| Does it work with scanned PDFs? | Yes. Built-in OCR extracts emails even from scanned documents. |
| What can I try for free? | Your first 10 emails are free (or PDFs up to 3 pages) — no account required. |
| Do you verify emails? | Yes. SMTP verification flags risky/deliverable addresses so you don't waste effort on bad leads. |
| What languages is it available in? | Español, English, Português, Français y Deutsch. |
| Payment methods? | Payments via dLocal Go (LATAM) and PayPal — local pricing in your currency. |

---

## Investor form — Connect with Investors (respuestas)

### Why are you the right founder/team to work on this?
I built this product end-to-end, as a solo founder, from zero to revenue. I own the entire stack: PDF text extraction, OCR for scanned documents, SMTP verification (4 providers + MX fallback), AI-based enrichment, real payment infrastructure (dLocal Go for LATAM and PayPal globally), regional pricing, and multi-language SEO. I designed it, wrote the code, set up analytics (PostHog), and did the growth work — content, blog, and technical SEO. That matters here because this is a lean, high-margin micro-SaaS where execution speed and cost control decide success, not headcount. The product is 100% client-side, so my marginal cost per user is near zero and my margins are structurally high. I am not just a technical founder — I treat growth and distribution as core engineering.

### Why did you pick this idea to work on?
Pulling emails and contacts out of PDFs is a real, recurring pain for SDRs, recruiters, and freelancers — everyone does it by hand or with slow, enterprise-priced tools. I picked it because it sits at the intersection of three things I believe in: (1) a genuine, provable need with large search demand; (2) a gap in how incumbents serve it — subscription-heavy, server-processed (a real privacy objection), and priced for the US/Europe only; (3) micro-SaaS economics — cheap to run, high margin, bootstrappable. I also saw the wedge: extraction is step one, but verification and enrichment turn it into a full contact-cleanup pipeline. And I specifically designed it 100% client-side so users' data never touches a server — that privacy-first approach is a genuine differentiator.

### Who are your competitors, and what do you understand about this idea that they don't?
Competitors fall into two buckets. First, direct PDF utilities and platforms: Hunter.io, Snov.io, Findymail, and Apollo.io for email finding/verification, plus generic tools like Smallpdf, Adobe Acrobat, and manual Google Sheets work for extraction. The platforms are powerful but heavy, subscription-priced, and aimed at enterprises; the generic tools can't verify, enrich, or OCR a scanned PDF into a clean list. What I understand that most of them don't: (1) distribution is SEO, not app-store presence — buyers search Google, and I built for it in 5 languages; (2) price for purchasing power — regional pricing with local payment methods (PayPal, dLocal Go) unlocks emerging markets that US-priced players ignore; (3) privacy is a purchase objection, not a checkbox — incumbents process your file server-side, I'm 100% client-side; (4) the product is a wedge — extraction → verification → enrichment → CSV export expands value per user instead of being a one-shot utility.

### What's your revenue and/or growth rate?
<!-- RELLENAR con datos reales; nunca inventar. -->
The product is live and monetizing. I am currently at [numero] paying users / [USD] MRR, growing [X]% month over month, with [numero] free-to-paid conversions and [numero] organic visitors/month driven by SEO. My cost to serve is near zero because processing is client-side, so the gross margin is high and growth is capital-efficient.

### Anything else you would like investors to know?
This is a deliberately lean, profitable-by-design business: 100% client-side processing means near-zero marginal cost, high margins, and no scaling burn. It already has real payment integrations and regional pricing working across LATAM and global markets — not a mockup, live. The roadmap compounds value per user: CRM integrations (Smartlead, Instantly, HubSpot), bulk contact lists, and an API that turns this from a tool into a contact-cleanup layer for outbound sales teams in emerging markets. I'm looking for a small, thoughtful check to accelerate what's already working — more SEO/content, deeper integrations, and faster expansion into LATAM — not to fund burn. I'm the type of founder who ships and measures, and I'd rather show steady, capital-efficient growth than spend aggressively.

---

## Shoutouts (Add products that helped make yours awesome)

Elegir 3-4 productos reconocibles que de verdad se usaron.

**Next.js**
> PDF2Emails is built entirely on Next.js. The App Router, edge middleware for geo-pricing and multi-language routing, and first-class deployment made it possible for me, a solo founder, to ship a fast, SEO-ready, internationalized product. I couldn't have moved this fast on anything else.

**Vercel**
> Vercel made shipping effortless. Instant previews on every push, free hosting for a client-side product, and zero-config deploys — I went from repo to live in minutes. It removed hosting from my list of problems so I could focus entirely on the product.

**PostHog**
> PostHog told me exactly where users dropped off. I wired a simple funnel (page view → extraction → checkout → payment) plus session replay, and within days I could see where conversion leaked instead of guessing. The free tier was more than enough to get started.

**OpenAI**
> OpenAI powers the enrichment feature that infers a contact's company and job title from their email. It turns a raw list of addresses into something a sales team can actually act on — a feature I couldn't have built this cheaply otherwise.

*(Alternativas: Tailwind CSS, Tesseract.js, Resend — ver textos en el chat.)*


