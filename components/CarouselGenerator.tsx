'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, Download, Image as ImageIcon, UserCircle, AtSign, Loader2, ChevronLeft, ChevronRight, Type, User, Lock, Sparkles } from 'lucide-react';
import JSZip from 'jszip';
import { mktInsiderTemplate, getPositionClasses } from '../lib/templates';
import { renderSlideToCanvas } from '../lib/canvasUtils';

interface CarouselSlide {
  id: string;
  imageUrl: string;
  text: string;
}

export function CarouselGenerator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [profileName, setProfileName] = useState<string>('');
  const [profilePic, setProfilePic] = useState<string>('');
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [syncProfile, setSyncProfile] = useState<boolean>(true);
  const [batchText, setBatchText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Paywall State
  const [showPaywall, setShowPaywall] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Usamos apenas o template Marketing Insider OS
  const selectedTemplate = mktInsiderTemplate;

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (slides.length + acceptedFiles.length > 10) {
      alert('Você pode adicionar no máximo 10 imagens.');
      return;
    }

    const newSlides = acceptedFiles.map((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`A imagem ${file.name} excede o limite de 5MB.`);
        return null;
      }
      return {
        id: Math.random().toString(36).substring(7),
        imageUrl: URL.createObjectURL(file),
        text: '',
      };
    }).filter(Boolean) as CarouselSlide[];

    setSlides((prev) => [...prev, ...newSlides]);
  }, [slides.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    disabled: slides.length >= 10
  });

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
    setSlides((prev) => prev.filter((slide) => slide.id !== id));
  };

  const applyBatchText = () => {
    const texts = batchText.split('\n\n').map(t => t.trim()).filter(Boolean);
    
    setSlides(prev => prev.map((slide, index) => ({
      ...slide,
      text: texts[index] || slide.text
    })));
  };

  const generateZip = async () => {
    // Verifica Paywall ANTES de gerar
    if (!user) {
      setShowPaywall(true);
      return;
    }

    if (slides.length < 2) {
      alert('Adicione pelo menos 2 imagens para gerar o carrossel.');
      return;
    }

    setIsGenerating(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideTemplate = selectedTemplate[i % selectedTemplate.length];
        const showProfile = syncProfile || i === 0;
        
        // Renderiza o slide no canvas e obtém o blob (JPEG 0.85)
        const blob = await renderSlideToCanvas(
          slide.imageUrl,
          slide.text,
          slideTemplate,
          {
            pic: profilePic,
            name: profileName,
            handle: instagramHandle,
            show: showProfile
          },
          i // Passando o índice para o canvasUtils
        );

        if (blob) {
          zip.file(`slide-${i + 1}.jpg`, blob);
        }
      }

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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#121212] text-zinc-100 py-8 relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gerador de Carrosséis Pro</h1>
            <p className="text-zinc-400">Crie carrosséis magnéticos com templates profissionais.</p>
          </div>
          {!user && (
            <div className="bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Sparkles size={16} />
              Preview Gratuito
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Section */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Profile Section */}
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-rose-500" />
                Perfil & Avatar
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="text-zinc-500" size={32} />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg cursor-pointer transition-colors border border-zinc-700 inline-block">
                      Fazer Upload
                      <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                    </label>
                    {profilePic && (
                      <button onClick={() => setProfilePic('')} className="text-sm text-red-400 hover:text-red-300 ml-3">
                        Remover
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Nome</label>
                    <input
                      type="text"
                      placeholder="Seu Nome"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2 bg-[#121212] border border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">@ Instagram</label>
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

                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input 
                    type="checkbox" 
                    checked={syncProfile}
                    onChange={(e) => setSyncProfile(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-rose-600 focus:ring-rose-600 focus:ring-offset-zinc-900"
                  />
                  <span className="text-sm text-zinc-300">Sincronizar em todos os slides</span>
                </label>
              </div>
            </div>

            {/* Batch Text Section */}
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Type size={20} className="text-rose-500" />
                Texto em Lote
              </h2>
              <p className="text-xs text-zinc-400 mb-3">
                Cole seus textos aqui. Separe cada slide com uma linha vazia (Enter duas vezes).
              </p>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="Slide 1: Título impactante&#10;Subtítulo explicativo&#10;&#10;Slide 2: Problema que resolve&#10;..."
                className="w-full h-32 px-4 py-3 bg-[#121212] border border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all resize-none mb-3"
              />
              <button
                onClick={applyBatchText}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors text-sm"
              >
                Aplicar Textos aos Slides
              </button>
            </div>

            {/* Image Upload Box */}
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-rose-500" />
                Inserir Imagens ({slides.length}/10)
              </h2>
              
              <div 
                {...getRootProps()} 
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  isDragActive ? 'border-rose-500 bg-rose-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-8 h-8 mb-2 ${isDragActive ? 'text-rose-500' : 'text-zinc-500'}`} />
                  <p className="text-sm text-zinc-400 font-medium">
                    {isDragActive ? 'Solte as imagens aqui...' : 'Arraste ou clique para fazer upload'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">PNG, JPG ou WEBP (Max 5MB)</p>
                </div>
              </div>

              {/* Thumbnails */}
              {slides.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={slide.imageUrl} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => removeSlide(slide.id)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {slides.length >= 2 && (
              <button
                onClick={generateZip}
                disabled={isGenerating}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  !user 
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-none border border-zinc-700' 
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Gerando Imagens...
                  </>
                ) : !user ? (
                  <>
                    <Lock size={20} className="text-rose-500" />
                    Desbloquear Exportação
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Exportar Slides (ZIP)
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
                <div className="aspect-[4/5] w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p>Faça upload de imagens para ver o preview</p>
                </div>
              ) : (
                <div className="relative max-w-md mx-auto">
                  <div className="overflow-hidden rounded-2xl border border-zinc-800" ref={emblaRef}>
                    <div className="flex">
                      {slides.map((slide, index) => {
                        const slideTemplate = selectedTemplate[index % selectedTemplate.length];
                        const showProfile = syncProfile || index === 0;

                        const isCover = index === 0;
                        const textLines = slide.text.split('\n');
                        const titleText = textLines[0] || '';
                        const bodyText = textLines.slice(1).join('\n').trim();

                        return (
                          <div key={slide.id} className={`flex-[0_0_100%] min-w-0 relative aspect-[4/5] overflow-hidden ${isCover ? 'bg-black' : 'bg-[#1A1A1A] p-8 flex flex-col'}`}>
                            
                            {isCover ? (
                              // ==========================================
                              // PREVIEW SLIDE 1: CAPA
                              // ==========================================
                              <>
                                <img 
                                  src={slide.imageUrl} 
                                  alt={`Preview ${index + 1}`} 
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
                                
                                <div className="absolute bottom-12 left-8 right-8 text-center z-10">
                                  <h1 className="text-white font-bold text-3xl shadow-lg" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                                    {slide.text}
                                  </h1>
                                </div>
                              </>
                            ) : (
                              // ==========================================
                              // PREVIEW SLIDES 2-10: CONTEÚDO
                              // ==========================================
                              <>
                                {/* Text Area */}
                                <div className="mt-12 mb-6 z-10">
                                  {titleText && (
                                    <h2 className="text-white font-bold text-2xl mb-3 leading-tight">
                                      {titleText}
                                    </h2>
                                  )}
                                  {bodyText && (
                                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                      {bodyText}
                                    </p>
                                  )}
                                </div>

                                {/* Image Area */}
                                {slide.imageUrl && (
                                  <div className="relative flex-1 rounded-2xl overflow-hidden bg-black/20 z-10">
                                    <img 
                                      src={slide.imageUrl} 
                                      alt={`Preview ${index + 1}`} 
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                  </div>
                                )}

                                {/* Footer Bar */}
                                <div className="h-1.5 w-16 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full mt-6 z-10" />
                              </>
                            )}

                            {/* Header / Profile (Top-Right) */}
                            {showProfile && (profilePic || profileName || instagramHandle) && (
                              <div className={`absolute top-6 right-6 flex items-center gap-3 z-20 ${isCover ? 'drop-shadow-lg' : ''}`}>
                                <div className="flex flex-col items-end">
                                  {profileName && (
                                    <span className={`font-bold leading-tight ${isCover ? 'text-sm text-white' : 'text-xs text-white'}`}>
                                      {profileName}
                                    </span>
                                  )}
                                  {instagramHandle && (
                                    <span className={`leading-tight ${isCover ? 'text-xs text-white/90' : 'text-[10px] text-zinc-400'}`}>
                                      {instagramHandle}
                                    </span>
                                  )}
                                </div>
                                {profilePic && (
                                  <img 
                                    src={profilePic} 
                                    alt="Profile" 
                                    className={`rounded-full object-cover border-2 ${isCover ? 'w-10 h-10 border-white' : 'w-8 h-8 border-zinc-700'}`}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
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

              {/* Manual Text Edit for Current Slide */}
              {slides.length > 0 && slides[selectedIndex] && (
                <div className="mt-12 bg-[#121212] border border-zinc-800 rounded-xl p-4">
                  <label className="text-xs font-medium text-zinc-400 mb-2 flex justify-between">
                    <span>Editar texto do Slide {selectedIndex + 1}</span>
                  </label>
                  <textarea
                    value={slides[selectedIndex].text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setSlides(prev => prev.map((s, i) => i === selectedIndex ? { ...s, text: newText } : s));
                    }}
                    placeholder="Texto deste slide..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all resize-none h-20"
                  />
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-zinc-800 rounded-3xl max-w-md w-full p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-purple-600"></div>
            
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-rose-500" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Desbloqueie a Exportação</h2>
            <p className="text-zinc-400 mb-8">
              Para baixar seus carrosséis em alta qualidade e sem limites, assine o plano Pro.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const hotmartUrl = new URL('https://pay.hotmart.com/W104924135B?checkoutMode=10');
                  window.location.href = hotmartUrl.toString();
                }}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-600/20"
              >
                Assinar Plano Pro
              </button>
              <button 
                onClick={() => setShowPaywall(false)}
                className="w-full py-3.5 bg-transparent hover:bg-zinc-800 text-zinc-400 rounded-xl font-medium transition-colors"
              >
                Voltar para edição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
