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
  profile: ProfileData,
  index: number = 0
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1350; 
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Helper: Desenhar retângulo com bordas arredondadas
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Separar Título e Corpo do texto (primeira linha = título, resto = corpo)
  const textLines = text.split('\n');
  const titleText = textLines[0] || '';
  const bodyText = textLines.slice(1).join('\n').trim();

  if (index === 0) {
    // ==========================================
    // SLIDE 1: CAPA (Full Bleed Image)
    // ==========================================
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    if (imageUrl) {
      try {
        const img = await loadImage(imageUrl);
        const scale = Math.max(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (width / 2) - (scaledWidth / 2);
        const y = (height / 2) - (scaledHeight / 2);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      } catch (e) {
        console.error('Erro ao carregar imagem da capa', e);
      }
    }

    // Gradiente escuro embaixo para o texto
    const gradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Texto da Capa (Centralizado embaixo)
    if (text) {
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Inter, sans-serif';
      ctx.textAlign = 'center';

      const maxWidth = width - 160;
      const words = text.replace(/\n/g, ' ').split(' ');
      const lines: string[] = [];
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

      const lineHeight = 85;
      const totalTextHeight = lines.length * lineHeight;
      const startY = height - 120 - totalTextHeight + lineHeight;

      lines.forEach((l, i) => {
        ctx.fillText(l, width / 2, startY + (i * lineHeight));
      });
    }

  } else {
    // ==========================================
    // SLIDES 2-10: CONTEÚDO (Split Layout)
    // ==========================================
    
    // Fundo Cinza Escuro
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, width, height);

    const padding = 80;

    // 1. Desenhar Textos (Topo)
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'left';
    
    let currentY = padding + 120; // Espaço abaixo do header

    // Título
    if (titleText) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px Inter, sans-serif';
      const words = titleText.split(' ');
      let line = '';
      const maxWidth = width - (padding * 2);
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line.trim(), padding, currentY);
          line = words[n] + ' ';
          currentY += 65;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), padding, currentY);
      currentY += 40; // Espaço entre título e corpo
    }

    // Corpo do texto
    if (bodyText) {
      ctx.fillStyle = '#D4D4D8'; // zinc-300
      ctx.font = '36px Inter, sans-serif';
      const paragraphs = bodyText.split('\n');
      const maxWidth = width - (padding * 2);
      
      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
          currentY += 40;
          continue;
        }
        const words = paragraph.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), padding, currentY);
            line = words[n] + ' ';
            currentY += 48;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), padding, currentY);
        currentY += 48;
      }
    }

    // 2. Desenhar Imagem (Meio/Baixo com bordas arredondadas)
    if (imageUrl) {
      try {
        const img = await loadImage(imageUrl);
        const imgY = currentY + 40;
        const imgMaxHeight = height - imgY - 160; // Deixa espaço pro footer
        const imgWidth = width - (padding * 2);
        
        if (imgMaxHeight > 100) { // Só desenha se tiver espaço
          ctx.save();
          roundRect(ctx, padding, imgY, imgWidth, imgMaxHeight, 32); // border-radius 32px
          ctx.clip();
          
          // Cover logic para a imagem dentro do clip
          const scale = Math.max(imgWidth / img.width, imgMaxHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = padding + (imgWidth / 2) - (scaledWidth / 2);
          const y = imgY + (imgMaxHeight / 2) - (scaledHeight / 2);
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          ctx.restore();
        }
      } catch (e) {
        console.error('Erro ao carregar imagem do conteúdo', e);
      }
    }

    // 3. Footer (Barra Gradiente)
    const barWidth = 120;
    const barHeight = 12;
    const barY = height - padding - barHeight;
    const barGradient = ctx.createLinearGradient(padding, 0, padding + barWidth, 0);
    barGradient.addColorStop(0, '#EC4899'); // pink-500
    barGradient.addColorStop(0.5, '#EF4444'); // red-500
    barGradient.addColorStop(1, '#EAB308'); // yellow-500
    
    ctx.save();
    roundRect(ctx, padding, barY, barWidth, barHeight, 6);
    ctx.fillStyle = barGradient;
    ctx.fill();
    ctx.restore();
  }

  // ==========================================
  // HEADER COMUM (Perfil) - Para todos os slides
  // ==========================================
  if (profile.show && (profile.pic || profile.name || profile.handle)) {
    const isCover = index === 0;
    const profileRightMargin = 80;
    const profileTopMargin = 80;
    const pfpSize = isCover ? 80 : 60; // Menor nos slides de conteúdo
    
    let currentTextX = width - profileRightMargin;

    ctx.shadowColor = isCover ? 'rgba(0,0,0,0.8)' : 'transparent';
    ctx.shadowBlur = isCover ? 10 : 0;
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
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(pfpX + pfpSize/2, pfpY + pfpSize/2, pfpSize/2, 0, Math.PI * 2);
        ctx.lineWidth = isCover ? 4 : 2;
        ctx.strokeStyle = isCover ? '#ffffff' : '#3F3F46'; // zinc-700
        ctx.stroke();
        ctx.restore();

        currentTextX = pfpX - 20;
      } catch (e) {
        console.error('Erro ao carregar foto de perfil', e);
      }
    }

    if (profile.name) {
      ctx.font = `bold ${isCover ? 32 : 24}px Inter, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(profile.name, currentTextX, profileTopMargin + (isCover ? 35 : 25));
    }
    if (profile.handle) {
      ctx.font = `${isCover ? 24 : 20}px Inter, sans-serif`;
      ctx.fillStyle = isCover ? 'rgba(255,255,255,0.9)' : '#A1A1AA'; // zinc-400
      ctx.fillText(profile.handle, currentTextX, profileTopMargin + (isCover ? 70 : 50));
    }
  }

  // Compressão e Exportação (JPEG 0.85)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Falha ao gerar blob do canvas'));
    }, 'image/jpeg', 0.85);
  });
}
