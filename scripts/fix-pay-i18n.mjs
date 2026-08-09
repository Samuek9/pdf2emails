import { readFileSync, writeFileSync } from "node:fs";

const files = {
  es: "src/lib/i18n/es.ts",
  en: "src/lib/i18n/en.ts",
  pt: "src/lib/i18n/pt.ts",
  fr: "src/lib/i18n/fr.ts",
  de: "src/lib/i18n/de.ts",
};

const data = {
  es: {
    replace: [
      ['"pricing.latam": "Latinoamérica · dLocal Go"', '"pricing.latam": "Latinoamérica · pagos locales (Pix, Nequi)"'],
      ['"pricing.row": "Resto del mundo · Wompi"', '"pricing.row": "Resto del mundo · tarjeta de crédito"'],
      ['"result.securePay": "Pago seguro vía Wompi o dLocal Go"', '"result.securePay": "Pago seguro y cifrado"'],
    ],
    add: [
      '"checkout.payCardName": "Tarjeta de crédito"',
      '"checkout.payCardSub": "Visa · Mastercard · Amex"',
      '"checkout.payLocalName": "Pagos locales"',
      '"checkout.payLocalSub": "Pix · Nequi · PSE · OXXO"',
    ],
  },
  en: {
    replace: [
      ['"pricing.latam": "Latin America · dLocal Go"', '"pricing.latam": "Latin America · local payments (Pix, Nequi)"'],
      ['"pricing.row": "Rest of the world · Wompi"', '"pricing.row": "Rest of the world · credit card"'],
      ['"result.securePay": "Secure payment via Wompi or dLocal Go"', '"result.securePay": "Secure, encrypted payment"'],
    ],
    add: [
      '"checkout.payCardName": "Credit / debit card"',
      '"checkout.payCardSub": "Visa · Mastercard · Amex"',
      '"checkout.payLocalName": "Local payment"',
      '"checkout.payLocalSub": "Pix · Nequi · PSE · OXXO"',
    ],
  },
  pt: {
    replace: [
      ['"pricing.latam": "América Latina · dLocal Go"', '"pricing.latam": "América Latina · pagamentos locais (Pix)"'],
      ['"pricing.row": "Resto do mundo · Wompi"', '"pricing.row": "Resto do mundo · cartão de crédito"'],
      ['"result.securePay": "Pagamento seguro via Wompi ou dLocal Go"', '"result.securePay": "Pagamento seguro e criptografado"'],
    ],
    add: [
      '"checkout.payCardName": "Cartão de crédito"',
      '"checkout.payCardSub": "Visa · Mastercard · Amex"',
      '"checkout.payLocalName": "Pagamento local"',
      '"checkout.payLocalSub": "Pix · Nequi · PSE · OXXO"',
    ],
  },
  fr: {
    replace: [
      ['"pricing.latam": "Amérique latine · dLocal Go"', '"pricing.latam": "Amérique latine · paiements locaux (Pix)"'],
      ['"pricing.row": "Reste du monde · Wompi"', '"pricing.row": "Reste du monde · carte bancaire"'],
      ['"result.securePay": "Paiement sécurisé via Wompi ou dLocal Go"', '"result.securePay": "Paiement sécurisé et chiffré"'],
    ],
    add: [
      '"checkout.payCardName": "Carte bancaire"',
      '"checkout.payCardSub": "Visa · Mastercard · Amex"',
      '"checkout.payLocalName": "Paiement local"',
      '"checkout.payLocalSub": "Pix · Nequi · PSE · OXXO"',
    ],
  },
  de: {
    replace: [
      ['"pricing.latam": "Lateinamerika · dLocal Go"', '"pricing.latam": "Lateinamerika · lokale Zahlungen (Pix)"'],
      ['"pricing.row": "Rest der Welt · Wompi"', '"pricing.row": "Rest der Welt · Kreditkarte"'],
      ['"result.securePay": "Sichere Zahlung via Wompi oder dLocal Go"', '"result.securePay": "Sichere, verschlüsselte Zahlung"'],
    ],
    add: [
      '"checkout.payCardName": "Kreditkarte"',
      '"checkout.payCardSub": "Visa · Mastercard · Amex"',
      '"checkout.payLocalName": "Lokale Zahlung"',
      '"checkout.payLocalSub": "Pix · Nequi · PSE · OXXO"',
    ],
  },
};

for (const [lang, cfg] of Object.entries(data)) {
  let s = readFileSync(files[lang], "utf8");
  for (const [from, to] of cfg.replace) {
    if (!s.includes(from)) {
      console.log(`[${lang}] NO MATCH: ${from.slice(0, 50)}`);
    }
    s = s.split(from).join(to);
  }
  const idx = s.lastIndexOf("};");
  if (idx === -1) {
    console.log(`[${lang}] no closing brace`);
    continue;
  }
  const addBlock = cfg.add.map((k) => "  " + k + ",").join("\n");
  s = s.slice(0, idx) + addBlock + "\n};";
  writeFileSync(files[lang], s);
  console.log(`updated ${lang}`);
}
