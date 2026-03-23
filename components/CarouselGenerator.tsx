'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { Upload, Trash2, Download, Plus, Image as ImageIcon, UserCircle, AtSign, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';

interface CarouselSlide {
  id: string;
  imageUrl: string;
  text: string;
  isFirst?: boolean;
}

export function CarouselGenerator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [profilePic, setProfilePic] = useState<string>('');
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (slides.length + files.length > 10) {
      alert('Você pode adicionar no máximo 10 imagens.');
      return;
    }

    const newSlides = files.map((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`A imagem ${file.name} excede o limite de 5MB.`);
        return null;
      }
      return {
        id: Math.random().toString(36).substring(7),
        imageUrl: URL.createObjectURL(file),
        text: '',
        isFirst: slides.length === 0 && files.indexOf(file) === 0,
      };
    }).filter(Boolean) as CarouselSlide[];

    setSlides((prev) => {
      const updated = [...prev, ...newSlides];
      if (updated.length > 0) {
        updated[0].isFirst = true;
      }
      return updated;
    });
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto de perfil deve ter menos de 2MB.');
        return;
      }
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const removeSlide = (id: string) => {
    setSlides((prev) => {
      const updated = prev.filter((slide) => slide.id !== id);
      if (updated.length > 0) {
        updated[0].isFirst = true;
      }
      return updated;
    });
  };

  const updateSlideText = (id: string, text: string) => {
    if (text.length > 80) return;
    setSlides((prev) =>
      prev.map((slide) => (slide.id === id ? { ...slide, text } : slide))
    );
  };

  const generateZip = async () => {
    if (slides.length < 2) {
      alert('Adicione pelo menos 2 imagens para gerar o carrossel.');
      return;
    }

    setIsGenerating(true);
    try {
      const zip = new JSZip();
      
      // We need to render each slide to canvas.
      // Since the carousel only shows one at a time, we'll temporarily create a hidden container
      // to render all slides at once for html2canvas, or just scroll through them.
      // A better approach for reliable rendering is a hidden container with all slides fully visible.
      
      const hiddenContainer = document.createElement('div');
      hiddenContainer.style.position = 'absolute';
      hiddenContainer.style.left = '-9999px';
      hiddenContainer.style.top = '0';
      hiddenContainer.style.display = 'flex';
      hiddenContainer.style.flexDirection = 'column';
      hiddenContainer.style.gap = '20px';
      document.body.appendChild(hiddenContainer);

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Create DOM element for the slide
        const slideEl = document.createElement('div');
        slideEl.style.width = '1080px';
        slideEl.style.height = '1080px';
        slideEl.style.position = 'relative';
        slideEl.style.backgroundColor = '#000';
        slideEl.style.overflow = 'hidden';
        slideEl.style.display = 'flex';
        slideEl.style.alignItems = 'center';
        slideEl.style.justifyContent = 'center';
        
        // Background Image
        const img = document.createElement('img');
        img.src = slide.imageUrl;
        img.style.position = 'absolute';
        img.style.inset = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        slideEl.appendChild(img);

        // Gradient Overlay for text readability
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)';
        slideEl.appendChild(overlay);

        // First slide extras
        if (slide.isFirst && (profilePic || instagramHandle)) {
          const header = document.createElement('div');
          header.style.position = 'absolute';
          header.style.top = '40px';
          header.style.left = '40px';
          header.style.display = 'flex';
          header.style.alignItems = 'center';
          header.style.gap = '16px';
          header.style.zIndex = '10';

          if (profilePic) {
            const pfp = document.createElement('img');
            pfp.src = profilePic;
            pfp.style.width = '80px';
            pfp.style.height = '80px';
            pfp.style.borderRadius = '50%';
            pfp.style.objectFit = 'cover';
            pfp.style.border = '3px solid white';
            header.appendChild(pfp);
          }

          if (instagramHandle) {
            const handle = document.createElement('div');
            handle.innerText = instagramHandle;
            handle.style.color = 'white';
            handle.style.fontFamily = 'Inter, sans-serif';
            handle.style.fontSize = '32px';
            handle.style.fontWeight = 'bold';
            handle.style.textShadow = '0px 2px 4px rgba(0,0,0,0.5)';
            header.appendChild(handle);
          }
          
          slideEl.appendChild(header);
        }

        // Text
        if (slide.text) {
          const textContainer = document.createElement('div');
          textContainer.style.position = 'absolute';
          textContainer.style.bottom = '80px';
          textContainer.style.left = '60px';
          textContainer.style.right = '60px';
          textContainer.style.textAlign = 'center';
          textContainer.style.zIndex = '10';

          const textEl = document.createElement('p');
          textEl.innerText = slide.text;
          textEl.style.color = 'white';
          textEl.style.fontFamily = 'Inter, sans-serif';
          textEl.style.fontSize = '48px';
          textEl.style.fontWeight = 'bold';
          textEl.style.lineHeight = '1.2';
          textEl.style.textShadow = '0px 4px 8px rgba(0,0,0,0.8)';
          textContainer.appendChild(textEl);
          
          slideEl.appendChild(textContainer);
        }

        hiddenContainer.appendChild(slideEl);

        // Wait a bit for images to load
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(slideEl, {
          scale: 1, // 1080x1080 is already good
          useCORS: true,
          backgroundColor: '#000000',
        });

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        if (blob) {
          zip.file(`slide-${i + 1}.jpg`, blob);
        }
      }

      document.body.removeChild(hiddenContainer);

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'carrossel-ad-prompt.zip';
      link.click();

    } catch (error) {
      console.error('Error generating ZIP:', error);
      alert('Ocorreu um erro ao gerar as imagens. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#121212] text-zinc-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gerador de Carrosséis</h1>
          <p className="text-zinc-400">Crie carrosséis magnéticos para Instagram e Facebook Ads em segundos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Section */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Upload Box */}
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-rose-500" />
                Imagens do Carrossel ({slides.length}/10)
              </h2>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-700 border-dashed rounded-xl cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-zinc-500" />
                  <p className="text-sm text-zinc-400 font-medium">Clique para fazer upload</p>
                  <p className="text-xs text-zinc-500 mt-1">PNG, JPG ou WEBP (Max 5MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleImageUpload}
                  disabled={slides.length >= 10}
                />
              </label>
            </div>

            {/* Slides Editor */}
            {slides.length > 0 && (
              <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-6 space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-2">
                
                {/* First Slide Extras */}
                {slides[0] && (
                  <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-4 mb-6">
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Configurações da Capa</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Foto de Perfil (Opcional)</label>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                            {profilePic ? (
                              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <UserCircle className="text-zinc-500" size={24} />
                            )}
                          </div>
                          <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-lg cursor-pointer transition-colors border border-zinc-700">
                            Fazer Upload
                            <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                          </label>
                          {profilePic && (
                            <button onClick={() => setProfilePic('')} className="text-zinc-500 hover:text-red-400">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1.5 block">@ do Instagram (Opcional)</label>
                        <div className="relative">
                          <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="seu.instagram"
                            value={instagramHandle}
                            onChange={(e) => setInstagramHandle(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Slides */}
                <div className="space-y-4">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className={`p-4 rounded-xl border ${index === selectedIndex ? 'border-rose-500/50 bg-rose-950/10' : 'border-zinc-800 bg-[#121212]'}`}>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-zinc-800 overflow-hidden shrink-0 relative group">
                          <img src={slide.imageUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => removeSlide(slide.id)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <label className="text-xs font-medium text-zinc-400 mb-1.5 flex justify-between">
                            <span>Texto da Imagem</span>
                            <span className={slide.text.length >= 80 ? 'text-red-400' : ''}>{slide.text.length}/80</span>
                          </label>
                          <textarea
                            value={slide.text}
                            onChange={(e) => updateSlideText(slide.id, e.target.value)}
                            placeholder="Escreva uma frase de impacto..."
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all resize-none h-16"
                            maxLength={80}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {slides.length >= 2 && (
              <button
                onClick={generateZip}
                disabled={isGenerating}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-600/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Gerando Imagens...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Gerar e Baixar ZIP
                  </>
                )}
              </button>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-7">
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-3xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                Preview em Tempo Real
                {slides.length > 0 && (
                  <span className="text-sm font-normal text-zinc-400">
                    {selectedIndex + 1} / {slides.length}
                  </span>
                )}
              </h2>

              {slides.length === 0 ? (
                <div className="aspect-square w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p>Faça upload de imagens para ver o preview</p>
                </div>
              ) : (
                <div className="relative max-w-md mx-auto">
                  <div className="overflow-hidden rounded-2xl border border-zinc-800" ref={emblaRef}>
                    <div className="flex">
                      {slides.map((slide, index) => (
                        <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative aspect-square bg-black">
                          <img 
                            src={slide.imageUrl} 
                            alt={`Preview ${index + 1}`} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                          {/* Header (First Slide Only) */}
                          {slide.isFirst && (profilePic || instagramHandle) && (
                            <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
                              {profilePic && (
                                <img 
                                  src={profilePic} 
                                  alt="Profile" 
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                              )}
                              {instagramHandle && (
                                <span className="text-white font-bold text-sm drop-shadow-md">
                                  {instagramHandle}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Text Overlay */}
                          {slide.text && (
                            <div className="absolute bottom-10 left-8 right-8 text-center z-10">
                              <p className="text-white font-bold text-2xl md:text-3xl leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                {slide.text}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  {slides.length > 1 && (
                    <>
                      <button 
                        onClick={scrollPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30"
                        disabled={selectedIndex === 0}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={scrollNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30"
                        disabled={selectedIndex === slides.length - 1}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                  
                  {/* Dots */}
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                    {slides.map((_, index) => (
                      <div 
                        key={index} 
                        className={`w-2 h-2 rounded-full transition-all ${index === selectedIndex ? 'bg-rose-500 w-4' : 'bg-zinc-700'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
