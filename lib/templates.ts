export type TextPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface SlideTemplate {
  textPosition: TextPosition;
  fontSize: number; // Tamanho da fonte em pixels para o canvas
  textAlign: 'left' | 'center' | 'right';
}

// Template Único: Marketing Insider OS
// 10 slides fixos com posições variadas para manter o dinamismo
export const mktInsiderTemplate: SlideTemplate[] = [
  { textPosition: 'bottom-center', fontSize: 64, textAlign: 'center' }, // Slide 1: Título grande embaixo
  { textPosition: 'top-left', fontSize: 56, textAlign: 'left' },        // Slide 2: Topo esquerdo
  { textPosition: 'center-right', fontSize: 56, textAlign: 'right' },   // Slide 3: Centro direito
  { textPosition: 'bottom-left', fontSize: 56, textAlign: 'left' },     // Slide 4: Embaixo esquerdo
  { textPosition: 'center-left', fontSize: 56, textAlign: 'left' },     // Slide 5: Centro esquerdo
  { textPosition: 'top-center', fontSize: 56, textAlign: 'center' },    // Slide 6: Topo centro
  { textPosition: 'bottom-right', fontSize: 56, textAlign: 'right' },   // Slide 7: Embaixo direito
  { textPosition: 'center', fontSize: 60, textAlign: 'center' },        // Slide 8: Centro absoluto
  { textPosition: 'top-right', fontSize: 56, textAlign: 'right' },      // Slide 9: Topo direito
  { textPosition: 'bottom-center', fontSize: 72, textAlign: 'center' }, // Slide 10: CTA gigante embaixo
];

// Utilitário para o Preview em HTML/CSS (mapeia a posição para classes do Tailwind)
export function getPositionClasses(position: TextPosition): string {
  switch (position) {
    case 'top-left': return 'top-24 left-12 right-24 items-start text-left';
    case 'top-center': return 'top-24 left-12 right-12 items-center text-center';
    case 'top-right': return 'top-24 right-12 left-24 items-end text-right';
    
    case 'center-left': return 'top-1/2 -translate-y-1/2 left-12 right-24 items-start text-left';
    case 'center': return 'top-1/2 -translate-y-1/2 left-12 right-12 items-center text-center';
    case 'center-right': return 'top-1/2 -translate-y-1/2 right-12 left-24 items-end text-right';
    
    case 'bottom-left': return 'bottom-24 left-12 right-24 items-start text-left';
    case 'bottom-center': return 'bottom-24 left-12 right-12 items-center text-center';
    case 'bottom-right': return 'bottom-24 right-12 left-24 items-end text-right';
    
    default: return 'bottom-24 left-12 right-12 items-center text-center';
  }
}
