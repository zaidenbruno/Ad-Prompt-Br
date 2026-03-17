import { generateAdCreatives } from './lib/gemini';

async function test() {
  try {
    console.log('Testing flash...');
    await generateAdCreatives({
      niche: 'Loja de roupas masculina',
      location: 'jatai',
      objective: 'mensagens WhatsApp',
      promo: '4 bones por 120$',
      audience: 'homens 18-30',
      variations: 2
    }, 'flash');
    console.log('Flash success');

    console.log('Testing pro...');
    await generateAdCreatives({
      niche: 'Loja de roupas masculina',
      location: 'jatai',
      objective: 'mensagens WhatsApp',
      promo: '4 bones por 120$',
      audience: 'homens 18-30',
      variations: 2
    }, 'pro');
    console.log('Pro success');
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
