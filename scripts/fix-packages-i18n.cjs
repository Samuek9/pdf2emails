const fs = require("fs");

const files = {
  es: "src/lib/i18n/es.ts",
  en: "src/lib/i18n/en.ts",
  pt: "src/lib/i18n/pt.ts",
  fr: "src/lib/i18n/fr.ts",
  de: "src/lib/i18n/de.ts",
};

const data = {
  es: {
    verify: '"cart.verify": "Verificación anti-spam (Recomendado)"',
    add: [
      '"cart.pkgVerifyDesc": "Verifica que no reboten y limpia los nombres"',
      '"cart.pkgProTitle": "Pro Enriquecido"',
      '"cart.pkgProDesc": "Verifica, enriquece con cargos y extrae teléfonos y plantillas"',
      '"cart.recommended": "Recomendado"',
    ],
  },
  en: {
    verify: '"cart.verify": "Anti-spam verification (Recommended)"',
    add: [
      '"cart.pkgVerifyDesc": "SMTP-verifies addresses and cleans names so your list doesn\'t bounce"',
      '"cart.pkgProTitle": "Pro Enriched"',
      '"cart.pkgProDesc": "Verify, enrich with job titles and companies, and extract phones + templates"',
      '"cart.recommended": "Recommended"',
    ],
  },
  pt: {
    verify: '"cart.verify": "Verificação anti-spam (Recomendado)"',
    add: [
      '"cart.pkgVerifyDesc": "Verifica se não rebatem e limpa os nomes"',
      '"cart.pkgProTitle": "Pro Enriquecido"',
      '"cart.pkgProDesc": "Verifica, enriquece com cargos e extrai telefones e modelos"',
      '"cart.recommended": "Recomendado"',
    ],
  },
  fr: {
    verify: '"cart.verify": "Vérification anti-spam (Recommandé)"',
    add: [
      '"cart.pkgVerifyDesc": "Vérifie que les emails ne rebondissent pas et nettoie les noms"',
      '"cart.pkgProTitle": "Pro Enrichi"',
      '"cart.pkgProDesc": "Vérifie, enrichit avec les postes et extrait téléphones et modèles"',
      '"cart.recommended": "Recommandé"',
    ],
  },
  de: {
    verify: '"cart.verify": "Anti-Spam-Prüfung (Empfohlen)"',
    add: [
      '"cart.pkgVerifyDesc": "Prüft, ob E-Mails nicht zurückkommen, und bereinigt Namen"',
      '"cart.pkgProTitle": "Pro Angereichert"',
      '"cart.pkgProDesc": "Prüft, reichert mit Positionen an und extrahiert Telefone und Vorlagen"',
      '"cart.recommended": "Empfohlen"',
    ],
  },
};

for (const [lang, cfg] of Object.entries(data)) {
  let s = fs.readFileSync(files[lang], "utf8");
  // Quitar el parentetico "(Recomendado)" de cart.verify
  const clean = cfg.verify.replace(" (Recomendado)", "").replace(" (Recommended)", "").replace(" (Recommandé)", "").replace(" (Empfohlen)", "");
  if (s.includes(cfg.verify)) {
    s = s.split(cfg.verify).join(clean);
  } else {
    console.error("[" + lang + "] cart.verify no match:", cfg.verify);
  }
  // Agregar las nuevas claves antes del cierre
  const idx = s.lastIndexOf("};");
  if (idx === -1) {
    console.error("[" + lang + "] no closing brace");
    continue;
  }
  const block = cfg.add.map((k) => "  " + k + ",").join("\n");
  s = s.slice(0, idx) + block + "\n};";
  fs.writeFileSync(files[lang], s);
  console.log("updated", lang);
}
