export type TextPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface SlideTemplate {
  textPosition: TextPosition;
  fontSize: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  profilePosition: TextPosition;
  slides: SlideTemplate[];
}

export const templates: CarouselTemplate[] = [
  {
    id: 'mkt-insider',
    name: 'Marketing Insider OS',
    description: 'Estilo dinâmico com textos variando de posição a cada slide.',
    profilePosition: 'top-right',
    slides: [
      { textPosition: 'bottom-center', fontSize: '48px', textAlign: 'center' }, // 1
      { textPosition: 'top-left', fontSize: '36px', textAlign: 'left' }, // 2
      { textPosition: 'center-right', fontSize: '42px', textAlign: 'right' }, // 3
      { textPosition: 'bottom-left', fontSize: '36px', textAlign: 'left' }, // 4
      { textPosition: 'center-left', fontSize: '40px', textAlign: 'left' }, // 5
      { textPosition: 'top-center', fontSize: '38px', textAlign: 'center' }, // 6
      { textPosition: 'bottom-right', fontSize: '36px', textAlign: 'right' }, // 7
      { textPosition: 'center', fontSize: '40px', textAlign: 'center' }, // 8
      { textPosition: 'top-right', fontSize: '36px', textAlign: 'right' }, // 9
      { textPosition: 'bottom-center', fontSize: '52px', textAlign: 'center' }, // 10 (CTA)
    ]
  },
  {
    id: 'classic-center',
    name: 'Clássico',
    description: 'Textos sempre centralizados para máxima legibilidade.',
    profilePosition: 'top-left',
    slides: Array(10).fill({ textPosition: 'center', fontSize: '42px', textAlign: 'center' })
  }
];

export function getPositionClasses(position: TextPosition): string {
  switch (position) {
    case 'top-left': return 'top-10 left-10 items-start justify-start';
    case 'top-center': return 'top-10 left-10 right-10 items-start justify-center';
    case 'top-right': return 'top-10 right-10 items-start justify-end';
    
    case 'center-left': return 'top-1/2 -translate-y-1/2 left-10 items-center justify-start';
    case 'center': return 'top-1/2 -translate-y-1/2 left-10 right-10 items-center justify-center';
    case 'center-right': return 'top-1/2 -translate-y-1/2 right-10 items-center justify-end';
    
    case 'bottom-left': return 'bottom-10 left-10 items-end justify-start';
    case 'bottom-center': return 'bottom-10 left-10 right-10 items-end justify-center';
    case 'bottom-right': return 'bottom-10 right-10 items-end justify-end';
    
    default: return 'bottom-10 left-10 right-10 items-end justify-center';
  }
}

export function getProfilePositionClasses(position: TextPosition): string {
  switch (position) {
    case 'top-left': return 'top-6 left-6 flex-row';
    case 'top-right': return 'top-6 right-6 flex-row-reverse';
    case 'bottom-left': return 'bottom-6 left-6 flex-row';
    case 'bottom-right': return 'bottom-6 right-6 flex-row-reverse';
    default: return 'top-6 left-6 flex-row';
  }
}
