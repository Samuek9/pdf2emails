export function companyFromEmail(email: string): string {
  const domain = email.split("@")[1] ?? "";
  const parts = domain.split(".").filter(Boolean);
  if (parts.length >= 2) {
    const sld = parts[parts.length - 2];
    return sld.charAt(0).toUpperCase() + sld.slice(1);
  }
  return domain;
}

export function nameFromEmail(email: string): { first: string; last: string } {
  const local = (email.split("@")[0] ?? "").replace(/[._-]+/g, " ").trim();
  const parts = local.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  return {
    first: cap(parts[0]),
    last: parts.length > 1 ? cap(parts[parts.length - 1]) : "",
  };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Enriquecimiento con OpenAI: dado el email y su dominio, infiere el cargo
 * profesional probable y la empresa. Resultado es una hipotesis de IA.
 */
export async function enrichViaOpenAI(
  emails: string[],
  apiKey: string,
): Promise<Record<string, { title: string; company: string }>> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Eres una herramienta de enriquecimiento B2B. Dada una lista de emails, devuelve SOLO un JSON como {"items":[{"email":"...","title":"cargo profesional probable en esa empresa","company":"nombre de la empresa del dominio"}]}. Si no puedes inferir el cargo, usa "". Idioma: coincide con el del email (es/en).',
        },
        { role: "user", content: emails.join("\n") },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json?.choices?.[0]?.message?.content ?? "";
  let items: { email?: string; title?: string; company?: string }[] = [];
  try {
    items = (JSON.parse(content) as { items?: typeof items })?.items ?? [];
  } catch {
    items = [];
  }

  const map: Record<string, { title: string; company: string }> = {};
  for (const it of items) {
    if (it?.email) map[it.email] = { title: it.title ?? "", company: it.company ?? "" };
  }
  return map;
}
