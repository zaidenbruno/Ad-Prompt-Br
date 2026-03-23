'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, Download, Image as ImageIcon, UserCircle, AtSign, Loader2, ChevronLeft, ChevronRight, Type, LayoutTemplate, User } from 'lucide-react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { templates, getPositionClasses, getProfilePositionClasses } from '../lib/templates';

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

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
    if (slides.length < 2) {
      alert('Adicione pelo menos 2 imagens para gerar o carrossel.');
      return;
    }

    setIsGenerating(true);
    try {
      const zip = new JSZip();
      
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
        const slideTemplate = selectedTemplate.slides[i % selectedTemplate.slides.length];
        
        const slideEl = document.createElement('div');
        slideEl.style.width = '1080px';
        slideEl.style.height = '1080px';
        slideEl.style.position = 'relative';
        slideEl.style.backgroundColor = '#000';
        slideEl.style.overflow = 'hidden';
        slideEl.style.display = 'flex';
        
        // Background Image
        const img = document.createElement('img');
        img.src = slide.imageUrl;
        img.style.position = 'absolute';
        img.style.inset = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        slideEl.appendChild(img);

        // Gradient Overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)';
        slideEl.appendChild(overlay);

        // Profile Info
        const showProfile = syncProfile || i === 0;
        if (showProfile && (profilePic || profileName || instagramHandle)) {
          const header = document.createElement('div');
          header.style.position = 'absolute';
          header.style.display = 'flex';
          header.style.alignItems = 'center';
          header.style.gap = '16px';
          header.style.zIndex = '10';

          // Apply profile position
          const isTop = selectedTemplate.profilePosition.includes('top');
          const isLeft = selectedTemplate.profilePosition.includes('left');
          
          if (isTop) header.style.top = '40px';
          else header.style.bottom = '40px';
          
          if (isLeft) {
            header.style.left = '40px';
            header.style.flexDirection = 'row';
          } else {
            header.style.right = '40px';
            header.style.flexDirection = 'row-reverse';
          }

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

          const textContainer = document.createElement('div');
          textContainer.style.display = 'flex';
          textContainer.style.flexDirection = 'column';
          if (!isLeft) textContainer.style.alignItems = 'flex-end';

          if (profileName) {
            const nameEl = document.createElement('div');
            nameEl.innerText = profileName;
            nameEl.style.color = 'white';
            nameEl.style.fontFamily = 'Inter, sans-serif';
            nameEl.style.fontSize = '28px';
            nameEl.style.fontWeight = 'bold';
            nameEl.style.textShadow = '0px 2px 4px rgba(0,0,0,0.5)';
            textContainer.appendChild(nameEl);
          }

          if (instagramHandle) {
            const handleEl = document.createElement('div');
            handleEl.innerText = instagramHandle;
            handleEl.style.color = 'rgba(255,255,255,0.8)';
            handleEl.style.fontFamily = 'Inter, sans-serif';
            handleEl.style.fontSize = '24px';
            handleEl.style.textShadow = '0px 2px 4px rgba(0,0,0,0.5)';
            textContainer.appendChild(handleEl);
          }
          
          if (profileName || instagramHandle) {
            header.appendChild(textContainer);
          }
          
          slideEl.appendChild(header);
        }

        // Text
        if (slide.text) {
          const textContainer = document.createElement('div');
          textContainer.style.position = 'absolute';
          textContainer.style.zIndex = '10';
          textContainer.style.display = 'flex';
          textContainer.style.flexDirection = 'column';
          
          // Apply text position based on template
          const pos = slideTemplate.textPosition;
          if (pos.includes('top')) textContainer.style.top = '140px';
          else if (pos.includes('bottom')) textContainer.style.bottom = '140px';
          else {
            textContainer.style.top = '50%';
            textContainer.style.transform = 'translateY(-50%)';
          }

          if (pos.includes('left')) {
            textContainer.style.left = '60px';
            textContainer.style.right = '200px';
            textContainer.style.alignItems = 'flex-start';
            textContainer.style.textAlign = 'left';
          } else if (pos.includes('right')) {
            textContainer.style.right = '60px';
            textContainer.style.left = '200px';
            textContainer.style.alignItems = 'flex-end';
            textContainer.style.textAlign = 'right';
          } else {
            textContainer.style.left = '60px';
            textContainer.style.right = '60px';
            textContainer.style.alignItems = 'center';
            textContainer.style.textAlign = 'center';
          }

          const textEl = document.createElement('p');
          textEl.innerText = slide.text;
          textEl.style.color = 'white';
          textEl.style.fontFamily = 'Inter, sans-serif';
          textEl.style.fontSize = slideTemplate.fontSize;
          textEl.style.fontWeight = 'bold';
          textEl.style.lineHeight = '1.2';
          textEl.style.textShadow = '0px 4px 8px rgba(0,0,0,0.8)';
          textEl.style.whiteSpace = 'pre-wrap';
          textContainer.appendChild(textEl);
          
          slideEl.appendChild(textContainer);
        }

        hiddenContainer.appendChild(slideEl);

        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(slideEl, {
          scale: 1,
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gerador de Carrosséis Pro</h1>
          <p className="text-zinc-400">Crie carrosséis magnéticos com templates profissionais.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Section */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Template Selection */}
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <LayoutTemplate size={20} className="text-rose-500" />
                Template
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedTemplateId === template.id 
                        ? 'border-rose-500 bg-rose-500/10' 
                        : 'border-zinc-800 bg-[#121212] hover:border-zinc-600'
                    }`}
                  >
                    <h3 className="font-bold text-white mb-1">{template.name}</h3>
                    <p className="text-xs text-zinc-400">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

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
                <div className="aspect-square w-full max-w-lg mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p>Faça upload de imagens para ver o preview</p>
                </div>
              ) : (
                <div className="relative max-w-lg mx-auto">
                  <div className="overflow-hidden rounded-2xl border border-zinc-800" ref={emblaRef}>
                    <div className="flex">
                      {slides.map((slide, index) => {
                        const slideTemplate = selectedTemplate.slides[index % selectedTemplate.slides.length];
                        const showProfile = syncProfile || index === 0;

                        return (
                          <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative aspect-square bg-black">
                            <img 
                              src={slide.imageUrl} 
                              alt={`Preview ${index + 1}`} 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                            {/* Header / Profile */}
                            {showProfile && (profilePic || profileName || instagramHandle) && (
                              <div className={`absolute flex items-center gap-3 z-10 ${getProfilePositionClasses(selectedTemplate.profilePosition)}`}>
                                {profilePic && (
                                  <img 
                                    src={profilePic} 
                                    alt="Profile" 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                  />
                                )}
                                <div className={`flex flex-col ${selectedTemplate.profilePosition.includes('left') ? 'items-start' : 'items-end'}`}>
                                  {profileName && (
                                    <span className="text-white font-bold text-base drop-shadow-md leading-tight">
                                      {profileName}
                                    </span>
                                  )}
                                  {instagramHandle && (
                                    <span className="text-white/80 text-sm drop-shadow-md leading-tight">
                                      {instagramHandle}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Text Overlay */}
                            {slide.text && (
                              <div className={`absolute flex flex-col z-10 ${getPositionClasses(slideTemplate.textPosition)}`}>
                                <p 
                                  className="text-white font-bold leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] whitespace-pre-wrap"
                                  style={{ 
                                    fontSize: `calc(${slideTemplate.fontSize} * 0.7)`, // Scale down for preview
                                    textAlign: slideTemplate.textAlign 
                                  }}
                                >
                                  {slide.text}
                                </p>
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
    </div>
  );
}
