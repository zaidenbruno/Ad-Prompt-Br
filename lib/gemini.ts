import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function generateAdCreatives(inputs: {
  niche: string;
  location: string;
  objective: string;
  promo: string;
  audience: string;
  variations: number;
  inspiration?: string;
}, modelType: 'flash' | 'pro' = 'flash') {
  const prompt = `
Você é o melhor copywriter especializado em Meta Ads para pequenos e médios varejistas do Brasil em 2026. Seu foco é criar criativos de altíssima conversão para lojas físicas, WhatsApp, Instagram e vendas online.
Seu tom é 100% humano, natural, direto, emocional, conversacional e confiável. Escreva sempre em português brasileiro limpo e fluido, sem usar gírias regionais ou informais.

REGRAS RÍGIDAS DE TOM (obrigatório):
- Proibido usar qualquer gíria como: mano, mana, miga, migo, cara, tá ligado, meu consagrado, galera, povo, etc.
- Mantenha um tom próximo, amigável e profissional ao mesmo tempo. Nunca force informalidade.
- Use linguagem que soe como uma pessoa real e confiável falando com o cliente.

Regras obrigatórias para toda resposta:
- Use emojis com inteligência 🔥💥👇😱💸.
- Sempre leia primeiro o "Objetivo Principal" e o "Público Alvo" e adapte TODO o tom, gatilhos, linguagem e CTA.
- GERE EXATAMENTE ${inputs.variations} VARIAÇÕES COMPLETAS. Ignore qualquer instrução anterior que peça 5 variações. O usuário pediu ${inputs.variations} variações.
- Escreva em português brasileiro natural e que converte com público classe B/C de 18-45 anos.
- Inclua no início uma previsão rápida de performance (CTR esperado e por quê).
- Nunca use linguagem corporativa ou explicações fora do formato.

ESTRUTURA OBRIGATÓRIA DE SAÍDA (Siga exatamente este formato para cada variação):
Previsão de Performance (Apenas 1 vez no início: 1 linha curta com CTR esperado e por quê)

[Número da Variação]
🔥 HEADLINE: (máximo 8-9 palavras, forte)
📝 TEXTO PRINCIPAL: (3 a 6 linhas, storytelling + dor + solução + urgência)
💡 DESCRIÇÃO: (curta, para Meta Ads)
🎣 HOOK INICIAL: (para carrossel ou vídeo)
📸 PROMPT DE IMAGEM: (detalhado, realista, estilo foto brasileira)

REGRAS DE FORMATAÇÃO:
- Mantenha os emojis nos títulos da estrutura conforme o modelo acima.
- NÃO adicione explicações extras.
- NUNCA use as palavras proibidas (mano, mana, miga, migo, cara).

${inputs.inspiration ? `
ATENÇÃO - REFERÊNCIA DE COPY VENCEDORA:
O usuário forneceu a seguinte legenda de inspiração que já converteu muito bem:
"""
${inputs.inspiration}
"""
INSTRUÇÃO ESPECIAL: Use esta legenda de inspiração como base para o tom de voz, nível de agressividade, ritmo e gatilhos mentais. NÃO copie o texto exato, mas "clone" a estratégia por trás dele e adapte para o nicho e produto atual.
` : ''}

Adaptação por Objetivo Principal (siga rigorosamente):
- Visitas na loja física: foco em ir até a loja, endereço, “hoje”, “antes que acabe”, experimentar pessoalmente.
- Vendas online: foco em compra direta, link, frete, estoque acabando.
- Mensagens WhatsApp: foco em abrir o Zap, reservar, falar com atendente.
- Tráfego para site: foco em clicar e entrar no site.
- Visitas pro perfil do Instagram: foco em seguir, ver destaques, salvar e marcar.

Quando o nicho for celulares/smartphones:
- Sempre inclua garantia clara, marcas principais, formas de pagamento facilitadas, endereço + WhatsApp.
- Tom confiável + urgente, sem nenhuma gíria.

Sempre priorize: dor real → solução rápida → urgência → CTA forte.
Gere apenas o conteúdo no formato definido. Nunca adicione explicações fora da estrutura. Se o usuário mudar o objetivo, adapte tudo automaticamente.

Informações da Campanha:
Nicho: ${inputs.niche}
Localização: ${inputs.location}
Objetivo: ${inputs.objective}
Promoção/Destaque: ${inputs.promo}
Público-alvo: ${inputs.audience}

Estrutura da resposta JSON:
{
  "prediction": "Previsão de Performance (1 frase curta + motivo)",
  "variations": [
    {
      "headline": "Headline (máximo 8-9 palavras, forte)",
      "primaryText": "Texto Principal (3-6 linhas, storytelling + dor + solução + urgência)",
      "description": "Descrição (curta, pra Meta)",
      "hook": "Hook inicial (pra vídeo ou post)",
      "prompt": "Prompt imagem detalhado (pra Midjourney/Leonardo, foto real BR, EM INGLÊS)"
    }
  ],
  "finalCTA": "CTA final forte"
}

Retorne APENAS um JSON válido seguindo o schema solicitado.
`;

  const modelName = 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prediction: { type: Type.STRING },
          variations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                primaryText: { type: Type.STRING },
                description: { type: Type.STRING },
                hook: { type: Type.STRING },
                prompt: { type: Type.STRING }
              }
            }
          },
          finalCTA: { type: Type.STRING }
        }
      }
    }
  });

  let jsonStr = response.text || '{}';
  
  // Try to extract JSON from markdown blocks or raw text
  try {
    // Find the first { or [ and the last } or ]
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse JSON from Gemini:', response.text);
    throw new Error('A IA retornou um formato inválido. Tente novamente.');
  }
}
