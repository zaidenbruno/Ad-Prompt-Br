import { SlideTemplate } from './templates';

// Carrega imagem de forma assíncrona para o Canvas
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Evita problemas de CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

interface ProfileData {
  pic: string;
  name: string;
  handle: string;
  show: boolean;
}

/**
 * Renderiza um slide individual em um Canvas 2D nativo e retorna um Blob JPEG.
 * - Fundo preto (#000000)
 * - Imagem centralizada (cover)
 * - Compressão JPEG 0.85
 */
export async function renderSlideToCanvas(
  imageUrl: string,
  text: string,
  template: SlideTemplate,
  profile: ProfileData
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  // Resolução ideal para Instagram (Stories/Carrossel vertical 4:5)
  const width = 1080;
  const height = 1350; 
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Fundo Preto Uniforme
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // 2. Imagem Redimensionada e Centralizada (Cover)
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      // Calcula a escala para cobrir o canvas (cover)
      const scale = Math.max(width / img.width, height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      // Centraliza a imagem
      const x = (width / 2) - (scaledWidth / 2);
      const y = (height / 2) - (scaledHeight / 2);
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    } catch (e) {
      console.error('Erro ao carregar imagem no canvas', e);
    }
  }

  // 3. Overlay Escuro (Gradiente) para garantir legibilidade do texto
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0,0,0,0.7)'); // Topo mais escuro para o perfil
  gradient.addColorStop(0.3, 'rgba(0,0,0,0.2)');
  gradient.addColorStop(0.7, 'rgba(0,0,0,0.2)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.8)'); // Fundo mais escuro para o texto
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 4. Perfil (Top-Right)
  if (profile.show && (profile.pic || profile.name || profile.handle)) {
    const profileRightMargin = 60;
    const profileTopMargin = 60;
    const pfpSize = 100;
    
    let currentTextX = width - profileRightMargin;

    // Sombra forte para o texto do perfil
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.textAlign = 'right';

    if (profile.pic) {
      try {
        const pfp = await loadImage(profile.pic);
        const pfpX = width - profileRightMargin - pfpSize;
        const pfpY = profileTopMargin;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(pfpX + pfpSize/2, pfpY + pfpSize/2, pfpSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(pfp, pfpX, pfpY, pfpSize, pfpSize);
        ctx.restore();
        
        // Borda branca na foto
        ctx.save();
        ctx.beginPath();
        ctx.arc(pfpX + pfpSize/2, pfpY + pfpSize/2, pfpSize/2, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();

        currentTextX = pfpX - 24; // Espaço entre foto e texto
      } catch (e) {
        console.error('Erro ao carregar foto de perfil', e);
      }
    }

    if (profile.name) {
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(profile.name, currentTextX, profileTopMargin + 45);
    }
    if (profile.handle) {
      ctx.font = '30px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(profile.handle, currentTextX, profileTopMargin + 90);
    }
  }

  // 5. Texto Principal
  if (text) {
    // Sombra preta forte para legibilidade (textShadow: '2px 2px 8px black')
    ctx.shadowColor = 'rgba(0,0,0,1)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${template.fontSize}px Inter, sans-serif`;
    ctx.textAlign = template.textAlign;

    const paddingX = 80;
    const maxWidth = width - (paddingX * 2);
    const lineHeight = template.fontSize * 1.25;
    
    // Quebra de linha manual (\n) e automática (maxWidth)
    const paragraphs = text.split('\n');
    const lines: string[] = [];
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push(''); // Mantém linhas vazias intencionais
        continue;
      }
      const words = paragraph.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());
    }

    const totalTextHeight = lines.length * lineHeight;
    
    let startX = paddingX;
    if (template.textAlign === 'center') startX = width / 2;
    else if (template.textAlign === 'right') startX = width - paddingX;

    let startY = 0;
    const pos = template.textPosition;
    
    // Ajuste vertical baseado na posição
    if (pos.includes('top')) {
      startY = 240; // Espaço para não sobrepor o perfil
    } else if (pos.includes('bottom')) {
      startY = height - 120 - totalTextHeight + lineHeight;
    } else {
      startY = (height / 2) - (totalTextHeight / 2) + (lineHeight / 2);
    }

    lines.forEach((line, i) => {
      ctx.fillText(line, startX, startY + (i * lineHeight));
    });
  }

  // 6. Compressão e Exportação (JPEG 0.85)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Falha ao gerar blob do canvas'));
    }, 'image/jpeg', 0.85);
  });
}
