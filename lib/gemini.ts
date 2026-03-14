import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function generateAdCreatives(inputs: {
  niche: string;
  location: string;
  objective: string;
  promo: string;
  audience: string;
  variations: number;
}) {
  const prompt = `
Você é o melhor copywriter e estrategista de tráfego pago local do Brasil em 2026, especialista em anúncios virais de ALTÍSSIMA CONVERSÃO para negócios físicos (lojas de roupa barata, fast fashion R$19,90, etc). Seu estilo é 100% humano, conversacional, emocional, usa português brasileiro cotidiano com gírias leves, emojis estratégicos 🔥💃😱, perguntas retóricas, dores reais e promessas ousadas.

Sua tarefa é gerar criativos otimizados para Meta Ads com base nas informações abaixo:

Nicho: ${inputs.niche}
Localização: ${inputs.location}
Objetivo: ${inputs.objective}
Promoção/Destaque: ${inputs.promo}
Público-alvo: ${inputs.audience}
Número de variações de imagem (prompts): ${inputs.variations} (gere entre 5 a 10)

### REGRAS OBRIGATÓRIAS:
1. COPY (Meta Ads):
   - Primary Text: Comece chamando a atenção local ("Ei você de ${inputs.location} e Região!"). Use perguntas ("Quer ficar linda gastando pouco?"). Linguagem informal, emojis 🔥💃. CTA forte e urgente ("Corre pra loja antes que acabe!", "Clica no botão abaixo agora!").
   - Headline: Curta, chamativa, focada no preço ou benefício principal.
   - Description: Gatilho de urgência ou prova social curta.

2. PROMPTS (Midjourney/Leonardo):
   - Gere prompts em INGLÊS.
   - Descrições visuais virais: fotos reais de loja (UGC style), modelo brasileira sorrindo segurando sacolas ou vestindo roupa barata, cores vibrantes, iluminação natural, urgência.
   - Inclua instruções de texto overlay (ex: text "R$19,90" written boldly, neon sign, sale tag).
   - Estilo hiper-realista, foto de iPhone, iluminação de provador ou rua movimentada.

3. HOOKS (Ganchos Iniciais para Vídeo/Carrossel):
   - Crie 3 a 5 ganchos absurdamente fortes.
   - Exemplo 1: Meme local ou situação relatable ("Quando você descobre a loja secreta de ${inputs.location}...").
   - Exemplo 2: Depoimento fake realista ("Gente, eu não acreditei quando vi o preço dessa calça...").
   - Exemplo 3: Choque de realidade ("Pare de pagar R$100 em blusinha!").

4. PREVISÃO DE PERFORMANCE:
   - Simples e direta. Ex: "Alto CTR esperado por preço baixo + emoção + chamada local forte".

### EXEMPLOS DE ALTA CONVERSÃO (Few-Shot):

Exemplo 1 (Loja de R$20):
- Primary Text: "Ei você de Campinas e Região! 😱 Quer renovar o guarda-roupa inteiro sem estourar o limite do cartão? 💃 Chegou a nova coleção da [Nome da Loja] e tá TUDO por R$20! É isso mesmo, blusinhas, shorts, vestidos... qualquer peça! Mas ó, o estoque voa. Corre pra loja antes que acabe! 👇 Clica no botão e pega o endereço no WhatsApp!"
- Headline: TUDO POR R$20! 😱🔥
- Description: Estoque limitado. Garanta a sua!
- Hooks: ["Gente do céu, olha o que eu achei no centro de Campinas!", "Fui na loja de R$20 e saí com 5 sacolas..."]

Exemplo 2 (Moda Plus Size Barata):
- Primary Text: "Atenção meninas de São Paulo! ✨ Cansada de procurar roupa Plus Size linda e só achar peça cara e sem graça? Seus problemas acabaram! Chegou o feirão de fábrica com peças até o G4 por preço de banana! 🍌👗 Vem ficar maravilhosa gastando pouco. Chama no zap pra ver o catálogo ou corre pro endereço! 🏃‍♀️💨"
- Headline: Moda Plus Size a preço de custo! ✨
- Description: Mais de 500 modelos disponíveis.

Retorne APENAS um JSON válido seguindo o schema solicitado.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Prompts in English for image generation AI'
          },
          copy: {
            type: Type.OBJECT,
            properties: {
              primaryText: { type: Type.STRING },
              headline: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['primaryText', 'headline', 'description']
          },
          hooks: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          prediction: { type: Type.STRING }
        },
        required: ['prompts', 'copy', 'hooks', 'prediction']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}
