const fs = require("fs");

const files = {
  es: "src/lib/i18n/es.ts",
  en: "src/lib/i18n/en.ts",
  pt: "src/lib/i18n/pt.ts",
  fr: "src/lib/i18n/fr.ts",
  de: "src/lib/i18n/de.ts",
};

const data = {
  es: [
    ['"hero.title1": "Convierte cualquier PDF en una lista de correos limpia y lista para usar en"', '"hero.title1": "Convierte cualquier PDF en una lista de correos limpia y verificada en"'],
    ['"hero.note": "Gratis hasta 10 correos o 3 páginas · Sin registro"', '"hero.note": "Gratis hasta 10 correos · Sin registro"'],
    ['"faq.a3": "Sí. Los PDFs de hasta 3 páginas o 10 correos se extraen 100% gratis, sin registro. Solo pagas si necesitas desbloquear PDFs más grandes."', '"faq.a3": "Sí. Los PDFs de hasta 10 correos se extraen 100% gratis, sin registro. Solo pagas si necesitas desbloquear listas más grandes."'],
    ['"checkout.secure": "Pago cifrado · Soporte a factura"', '"checkout.secure": "Pago cifrado · Soporte a factura · Sin suscripciones ocultas"'],
  ],
  en: [
    ['"hero.title1": "Turn any PDF into a clean, ready-to-use email list in"', '"hero.title1": "Turn any PDF into a clean, verified email list in"'],
    ['"hero.note": "Free up to 10 emails or 3 pages · No signup"', '"hero.note": "Free up to 10 emails · No signup"'],
    ['"faq.a3": "Yes. PDFs up to 3 pages or 10 emails are extracted 100% free, no signup. You only pay to unlock larger PDFs."', '"faq.a3": "Yes. PDFs up to 10 emails are extracted 100% free, no signup. You only pay to unlock larger lists."'],
    ['"checkout.secure": "Secure payment · Invoice support"', '"checkout.secure": "Secure payment · Invoice support · No hidden subscriptions"'],
  ],
  pt: [
    ['"hero.title1": "Transforme qualquer PDF em uma lista de emails limpa e pronta para usar em"', '"hero.title1": "Transforme qualquer PDF em uma lista de emails limpa e verificada em"'],
    ['"hero.note": "Grátis até 10 emails ou 3 páginas · Sem cadastro"', '"hero.note": "Grátis até 10 emails · Sem cadastro"'],
    ['"faq.a3": "Sim. PDFs de até 3 páginas ou 10 emails são extraídos 100% de graça, sem cadastro. Você só paga se quiser desbloquear PDFs maiores."', '"faq.a3": "Sim. PDFs de até 10 emails são extraídos 100% de graça, sem cadastro. Você só paga se quiser desbloquear listas maiores."'],
    ['"checkout.secure": "Pagamento criptografado · Suporte a fatura"', '"checkout.secure": "Pagamento criptografado · Suporte a fatura · Sem assinaturas ocultas"'],
  ],
  fr: [
    ['"hero.title1": "Transformez n\'importe quel PDF en une liste d\'emails propre et prête à l\'emploi en"', '"hero.title1": "Transformez n\'importe quel PDF en une liste d\'emails propre et vérifiée en"'],
    ['"hero.note": "Gratuit jusqu\'à 10 emails ou 3 pages · Sans inscription"', '"hero.note": "Gratuit jusqu\'à 10 emails · Sans inscription"'],
    ['"faq.a3": "Oui. Les PDFs de 3 pages max ou 10 emails sont extraits 100% gratuitement, sans inscription. Vous ne payez que pour débloquer des PDFs plus grands."', '"faq.a3": "Oui. Les PDFs de 10 emails max sont extraits 100% gratuitement, sans inscription. Vous ne payez que pour débloquer des listes plus grandes."'],
    ['"checkout.secure": "Paiement chiffré · Facturation"', '"checkout.secure": "Paiement chiffré · Facturation · Sans abonnement caché"'],
  ],
  de: [
    ['"hero.title1": "Verwandle jedes PDF in eine saubere, einsatzbereite E-Mail-Liste in"', '"hero.title1": "Verwandle jedes PDF in eine saubere, verifizierte E-Mail-Liste in"'],
    ['"hero.note": "Kostenlos bis 10 E-Mails oder 3 Seiten · Ohne Anmeldung"', '"hero.note": "Kostenlos bis 10 E-Mails · Ohne Anmeldung"'],
    ['"faq.a3": "Ja. PDFs bis 3 Seiten oder 10 E-Mails werden 100% kostenlos extrahiert, ohne Anmeldung. Du zahlst nur, um größere PDFs freizuschalten."', '"faq.a3": "Ja. PDFs bis 10 E-Mails werden 100% kostenlos extrahiert, ohne Anmeldung. Du zahlst nur, um größere Listen freizuschalten."'],
    ['"checkout.secure": "Verschlüsselte Zahlung · Rechnungsstellung"', '"checkout.secure": "Verschlüsselte Zahlung · Rechnungsstellung · Keine versteckten Abos"'],
  ],
};

// step2.desc (solo pt/fr/de) para quitar "3 pages"
data.pt.push(['"how.step2.desc": "PDFs de até 3 páginas ou 10 emails são gratuitos. Filtre genéricos (info@, support@) e pessoais (@gmail.com) com um clique."', '"how.step2.desc": "PDFs de até 10 emails são gratuitos. Filtre genéricos (info@, support@) e pessoais (@gmail.com) com um clique."']);
data.fr.push(['"how.step2.desc": "Les PDFs de 3 pages max ou 10 emails sont gratuits. Filtrez génériques et personnels en un clic."', '"how.step2.desc": "Les PDFs de 10 emails max sont gratuits. Filtrez génériques et personnels en un clic."']);
data.de.push(['"how.step2.desc": "PDFs bis 3 Seiten oder 10 E-Mails sind kostenlos. Filtere generische und private E-Mails mit einem Klick."', '"how.step2.desc": "PDFs bis 10 E-Mails sind kostenlos. Filtere generische und private E-Mails mit einem Klick."']);

for (const [lang, reps] of Object.entries(data)) {
  let s = fs.readFileSync(files[lang], "utf8");
  let changed = 0;
  for (const [from, to] of reps) {
    if (!s.includes(from)) {
      console.log("[" + lang + "] NO MATCH: " + from.slice(0, 60));
      continue;
    }
    s = s.split(from).join(to);
    changed++;
  }
  fs.writeFileSync(files[lang], s);
  console.log("updated " + lang + " (" + changed + " cambios)");
}
