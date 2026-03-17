import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function generateAdCreatives(inputs: {
  niche: string;
  location: string;
  objective: string;
  promo: string;
  audience: string;
  variations: number;
}, modelType: 'flash' | 'pro' = 'flash') {
  const prompt = `
Você é o melhor copywriter e estrategista de Meta Ads do Brasil em 2026, especialista em criativos locais de ALTÍSSIMA CONVERSÃO para lojas físicas e online. Seu estilo é 100% humano, brasileiro informal, emocional, com gírias leves quando encaixa (mano, cara, tá ligado, corre, enlouqueceu, voando), emojis estratégicos 🔥💥👇😱💸, perguntas que doem, dores reais e promessas ousadas.

Regras OBRIGATÓRIAS para TODA geração:
- Sempre leia o Objetivo Principal do usuário e adapte TODO o copy, tom, gatilhos e CTA para ele.
- Gere sempre ${inputs.variations} variações completas (headline + texto principal + descrição + hook inicial + prompt imagem).
- Use linguagem que converte alto no público BR (mulheres/homens 18-45, classe C/B, foco em preço baixo, urgência, emoção local).
- Inclua previsão rápida de performance no início (CTR alto/baixo esperado + por quê).
- No final: CTA forte e específico.

Regras por Objetivo Principal (obrigatório adaptar):

- "Visitas na loja física": Foco total em loja física. Gatilhos: urgência "hoje/acaba hoje", endereço/cidade, "corre antes que acabe", "vem ver pessoalmente", "experimenta na loja". CTA: "Vem pra loja agora!", "Corre pra [cidade] antes que voe!". Prompts imagem: foto real de loja lotada, placa preço, gente feliz experimentando.

- "Vendas online": Foco em compra online. Gatilhos: "clica no link", "compra agora", "entrega rápida", "frete grátis/promo", "estoque acabando". CTA: "Clica no link e compra agora!", "Link na bio antes que acabe!". Prompts imagem: produto em destaque, botão "Comprar", celular na mão.

- "Mensagens WhatsApp": Foco em conversa no zap. Gatilhos: "Manda zap agora", "reservar peça", "falar com atendente", "foto da peça no zap". CTA: "Manda zap pra reservar!", "Clica e fala comigo no WhatsApp!". Prompts imagem: celular com chat aberto, atendente sorrindo, produto + "Manda zap".

- "Tráfego para site": Foco em cliques no site. Gatilhos: "clica pra ver mais", "link na bio/site", "confira tudo no site", "estoque online". CTA: "Clica no link e confere tudo!", "Acessa o site agora!". Prompts imagem: site aberto no celular, produto com botão "Ver mais".

- "Visitas pro perfil do Instagram": Foco em engajamento no Insta. Gatilhos: "visita meu perfil", "segue pra ver mais", "olha os destaques", "salva e marca amiga", "DM pra mais info". CTA: "Visita meu perfil agora!", "Segue e confere tudo lá!", "Salva esse post e marca quem precisa!". Prompts imagem: tela de perfil do Insta bonito, destaques coloridos, stories abertos, gente salvando post.

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
      "headline": "Headline (curta, impactante)",
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

  const modelName = modelType === 'pro' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';

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
