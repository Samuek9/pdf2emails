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
    '"testi.title": "Lo que dicen quienes lo usan"',
    '"testi.1.quote": "Antes perdía 10–15 minutos copiando correos de las facturas en PDF a mano. Ahora subo el PDF y obtengo una lista limpia y sin duplicados en segundos."',
    '"testi.1.name": "Michael R."',
    '"testi.1.role": "Gerente de Operaciones"',
    '"testi.2.quote": "Subo una factura escaneada y obtengo todos los correos en un CSV limpio, listo para mi CRM. Sin copiar y pegar a mano."',
    '"testi.2.name": "Emily R."',
    '"testi.2.role": "Project Manager"',
    '"testi.3.quote": "Subir → extraer → descargar. Una de las herramientas de productividad más simples que he sumado a mi flujo."',
    '"testi.3.name": "Tom W."',
    '"testi.3.role": "Freelancer"',
  ],
  en: [
    '"testi.title": "What users say"',
    '"testi.1.quote": "I used to spend 10–15 minutes copying emails out of PDF invoices by hand. Now I upload the PDF and get a clean, deduplicated list in seconds."',
    '"testi.1.name": "Michael R."',
    '"testi.1.role": "Operations Manager"',
    '"testi.2.quote": "I upload a scanned invoice and get every email in a clean CSV, ready for our CRM. No more manual copy-paste."',
    '"testi.2.name": "Emily R."',
    '"testi.2.role": "Project Manager"',
    '"testi.3.quote": "Upload → extract → download. One of the simplest productivity tools I\'ve added to my workflow."',
    '"testi.3.name": "Tom W."',
    '"testi.3.role": "Freelancer"',
  ],
  pt: [
    '"testi.title": "O que dizem os usuários"',
    '"testi.1.quote": "Antes eu perdia 10–15 minutos copiando emails das faturas em PDF à mão. Agora envio o PDF e obtenho uma lista limpa e sem duplicatas em segundos."',
    '"testi.1.name": "Michael R."',
    '"testi.1.role": "Gerente de Operações"',
    '"testi.2.quote": "Envio uma fatura escaneada e obtenho todos os emails em um CSV limpo, pronto para o meu CRM. Sem copiar e colar à mão."',
    '"testi.2.name": "Emily R."',
    '"testi.2.role": "Project Manager"',
    '"testi.3.quote": "Enviar → extrair → baixar. Uma das ferramentas de produtividade mais simples que adicionei ao meu fluxo."',
    '"testi.3.name": "Tom W."',
    '"testi.3.role": "Freelancer"',
  ],
  fr: [
    '"testi.title": "Ce que disent les utilisateurs"',
    '"testi.1.quote": "Je passais 10 à 15 minutes à copier les emails des factures PDF à la main. Maintenant, j\'importe le PDF et j\'obtiens une liste propre et sans doublons en quelques secondes."',
    '"testi.1.name": "Michael R."',
    '"testi.1.role": "Directeur des opérations"',
    '"testi.2.quote": "J\'importe une facture scannée et j\'obtiens tous les emails dans un CSV propre, prêt pour mon CRM. Fini le copier-coller manuel."',
    '"testi.2.name": "Emily R."',
    '"testi.2.role": "Chef de projet"',
    '"testi.3.quote": "Importer → extraire → télécharger. L\'un des outils de productivité les plus simples que j\'ai ajoutés à mon flux."',
    '"testi.3.name": "Tom W."',
    '"testi.3.role": "Freelance"',
  ],
  de: [
    '"testi.title": "Was Nutzer sagen"',
    '"testi.1.quote": "Früher habe ich 10–15 Minuten damit verbracht, E-Mails aus PDF-Rechnungen von Hand zu kopieren. Jetzt lade ich das PDF hoch und erhalte in Sekunden eine saubere, deduplizierte Liste."',
    '"testi.1.name": "Michael R."',
    '"testi.1.role": "Betriebsleiter"',
    '"testi.2.quote": "Ich lade eine gescannte Rechnung hoch und erhalte alle E-Mails in einer sauberen CSV, bereit für mein CRM. Kein manuelles Kopieren mehr."',
    '"testi.2.name": "Emily R."',
    '"testi.2.role": "Projektmanagerin"',
    '"testi.3.quote": "Hochladen → extrahieren → herunterladen. Eines der einfachsten Produktivitätstools in meinem Workflow."',
    '"testi.3.name": "Tom W."',
    '"testi.3.role": "Freelancer"',
  ],
};

for (const [lang, keys] of Object.entries(data)) {
  let s = fs.readFileSync(files[lang], "utf8");
  // Evitar duplicados si ya existen
  if (s.includes('"testi.title"')) {
    console.log("[" + lang + "] ya tiene testi.*, salto");
    continue;
  }
  const idx = s.lastIndexOf("};");
  if (idx === -1) {
    console.error("[" + lang + "] no closing brace");
    continue;
  }
  const block = keys.map((k) => "  " + k + ",").join("\n");
  s = s.slice(0, idx) + block + "\n};";
  fs.writeFileSync(files[lang], s);
  console.log("updated", lang);
}
