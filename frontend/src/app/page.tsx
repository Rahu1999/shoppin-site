'use client';

import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { 
  ArrowRight, Zap, Shield, RefreshCw, Loader2, Star, 
  ChevronRight, ChevronLeft, Headphones, Smartphone, 
  Watch, Laptop, Sparkles, Mail, CheckCircle2, User
} from 'lucide-react';
import Link from 'next/link';
import { useAddToCart } from '@/hooks/useCart';
import { useState, useRef } from 'react';

export default function Home() {
  const { data: featuredData, isLoading } = useProducts({ isFeatured: 'true', limit: 8 });
  const { data: trendingData } = useProducts({ limit: 4 });
  const { mutate: addToCart } = useAddToCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const featuredProducts = featuredData?.items || [];
  const trendingProducts = trendingData?.items || [];

  const handleAddToCart = (productId: string) => {
    addToCart({ productId, quantity: 1 });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      
      {/* 1. Premium Hero Section */}
      <section className="relative h-[90vh] min-h-[750px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=2000&q=80" 
            alt="Premium Tech" 
            className="w-full h-full object-cover animate-scale-slow"
          />
        </div>
        
        <div className="container relative z-20 mx-auto px-4 lg:px-8 h-full flex flex-col justify-center pb-32">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest animate-fade-in-down">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Future of Tech is Here</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tighter animate-fade-in-up">
              Upgrade Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                Experience.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-xl leading-relaxed animate-fade-in-up delay-100">
              Discover the world's most advanced gadget collection. Designed for the professionals, used by the legends.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 animate-fade-in-up delay-200">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black shadow-2xl shadow-primary/20 group">
                  EXPLORE SHOP <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/categories" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-16 px-10 rounded-2xl bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 text-lg font-bold">
                  VIEW CATEGORIES
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer opacity-50">
           <div className="w-6 h-10 rounded-full border-2 border-white flex justify-center p-1">
              <div className="w-1.5 h-3 bg-white rounded-full" />
           </div>
        </div>
      </section>

      {/* 2. Trust Badges Grid */}
      <section className="relative z-30 -mt-16 container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl flex items-center gap-6 group hover:bg-white transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Ultra Fast Delivery</h3>
                <p className="text-sm text-slate-500">Free 2-day priority shipping on orders over $150.</p>
              </div>
           </div>
           <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl flex items-center gap-6 group hover:bg-white transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Secure Payments</h3>
                <p className="text-sm text-slate-500">PCI-DSS Level 1 compliant encryption on all hardware.</p>
              </div>
           </div>
           <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl flex items-center gap-6 group hover:bg-white transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <RefreshCw className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Premium Support</h3>
                <p className="text-sm text-slate-500">Dedicated concierge team available 24/7/365.</p>
              </div>
           </div>
        </div>
      </section>

      {/* 3. Featured Categories Grid */}
      {/* <section className="py-32">
        <div className="container mx-auto px-4 lg:px-8 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Browse Universe</h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Precision engineered categories for the tech enthusiast.</p>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'Electronics', img: 'https://images.unsplash.com/photo-1526733151923-85973c14a385?w=500&q=80', icon: <Smartphone />, color: 'from-blue-500' },
                { name: 'Audio', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', icon: <Headphones />, color: 'from-indigo-500' },
                { name: 'Wearables', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', icon: <Watch />, color: 'from-rose-500' },
                { name: 'Laptops', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80', icon: <Laptop />, color: 'from-amber-500' },
              ].map((cat, idx) => (
                <Link key={idx} href={`/categories/${cat.name.toLowerCase()}`} className="group relative h-96 overflow-hidden rounded-[2.5rem] shadow-2xl">
                  <img src={cat.img} alt={cat.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-125" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-60 group-hover:opacity-80 transition-opacity`} />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                      <div className="mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                         {cat.icon}
                      </div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter">{cat.name}</h3>
                      <p className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-2">Explore 200+ Products <ArrowRight className="inline-block w-4 h-4 ml-1" /></p>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </section> */}

      {/* 4. Trending Products Grid */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
              HOT THIS WEEK
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Trending Now</h2>
          </div>
          <Link href="/products" className="group flex items-center gap-2 text-primary font-black uppercase tracking-widest transition-all">
             View Original Collection <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {isLoading ? (
                [...Array(4)].map((_, i) => <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-3xl" />)
              ) : trendingProducts.length > 0 ? (
                trendingProducts.map(p => <ProductCard key={p.id} product={p as any} onAddToCart={handleAddToCart} />)
              ) : (
                <p className="col-span-full text-center text-slate-400 py-20 italic">No trending items found.</p>
              )}
           </div>
        </div>
      </section>

      {/* 5. Promotional Big Banner */}
      {/* <section className="container mx-auto px-4 lg:px-8 py-24">
         <div className="relative rounded-[3.5rem] overflow-hidden bg-[#0F172A] p-12 lg:p-24 shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent z-10" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20" />
            
            <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between gap-16">
               <div className="max-w-xl space-y-8 text-center lg:text-left">
                  <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                    Summer <br />
                    <span className="text-primary tracking-normal not-italic">Cyber Sale</span>
                  </h2>
                  <p className="text-xl text-slate-400 leading-relaxed font-medium">
                    Up to <span className="text-white font-black text-3xl">40% OFF</span> on all flagship laptops and accessories. Limited stock remaining for the season.
                  </p>
                  <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-lg font-black transition-all shadow-2xl">
                    SHOP THE SALE
                  </Button>
               </div>
               <div className="relative h-64 lg:h-96 w-full lg:w-1/2 group">
                  <img 
                    src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80" 
                    alt="Sale" 
                    className="h-full w-full object-contain transform group-hover:rotate-6 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
               </div>
            </div>
         </div>
      </section> */}

      {/* 6. Best Sellers Carousel */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between mb-16">
           <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Best Selling</h2>
           <div className="flex gap-4">
              <button 
                onClick={() => scroll('left')}
                className="p-4 rounded-full bg-white shadow-lg text-slate-400 hover:text-primary transition-all border border-slate-100 active:scale-95"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-4 rounded-full bg-white shadow-lg text-slate-400 hover:text-primary transition-all border border-slate-100 active:scale-95"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
           </div>
        </div>

        <div 
          ref={scrollRef}
          className="container mx-auto px-4 lg:px-8 flex overflow-x-auto hide-scrollbar gap-8 pb-12"
        >
          {featuredProducts.length > 0 ? (
            featuredProducts.map(p => (
              <div key={p.id} className="min-w-[320px] max-w-[320px]">
                 <ProductCard product={p as any} onAddToCart={handleAddToCart} />
              </div>
            ))
          ) : (
            [...Array(6)].map((_, i) => <div key={i} className="min-w-[320px] h-96 bg-slate-200/50 rounded-3xl animate-pulse" />)
          )}
        </div>
      </section>

      {/* 7. Why Premium? Section */}
      <section className="py-32 overflow-hidden bg-white">
         <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&q=80" alt="Team" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-8 bottom-8 p-10 bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white">
                     <div className="flex text-amber-500 mb-4 font-black text-3xl italic">"THE FUTURE."</div>
                     <p className="text-slate-600 font-medium leading-relaxed italic">
                        Our goal isn't just to sell gadgets. It's to bridge the gap between human capability and technological potential through world-class hardware.
                     </p>
                  </div>
               </div>
               <div className="space-y-12">
                  <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6 italic leading-tight">
                      Why Settle for <br /> Original?
                    </h2>
                    <p className="text-lg text-slate-500 font-medium">We only source products that pass our 50-point elite certification process.</p>
                  </div>

                  <div className="space-y-8">
                    {[
                      { title: 'AI-Enhanced Logistics', desc: 'Auto-routing for sub-48h delivery globally.', icon: <Sparkles className="text-primary" /> },
                      { title: 'Carbon Neutral Heritage', desc: 'Every purchase plants 5 trees in endangered forests.', icon: <CheckCircle2 className="text-success" /> },
                      { title: 'Military Grade Encryption', desc: 'Secure checkout with zero-trust architecture.', icon: <Shield className="text-indigo-600" /> },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-slate-100 transition-all font-bold">
                           {item.icon}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 mb-2 italic uppercase tracking-tighter">{item.title}</h4>
                          <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 8. Elite Testimonials */}
      {/* <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 text-center mb-16">
           <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">Voices of the Elite</h2>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah J.', role: 'Tech Lead @ Stripe', msg: 'The quality of curation on ModernShop is unparalleled. I finally found gear that matches my productivity needs.' },
                { name: 'Marcus K.', role: 'Founder @ Neo', msg: 'Delivery was faster than expected. The packaging itself was a work of art. 10/10 shopping experience.' },
                { name: 'Elena V.', role: 'Senior Designer @ Apple', msg: 'As a designer, I appreciate the attention to aesthetic details in every product they feature. Truly premium.' },
              ].map((test, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-white hover:-translate-y-2 transition-transform duration-500">
                   <div className="flex text-amber-400 mb-6">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                   </div>
                   <p className="text-slate-600 font-medium leading-relaxed italic mb-8">"{test.msg}"</p>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                         <div className="font-black text-slate-900 uppercase tracking-tighter text-sm italic">{test.name}</div>
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{test.role}</div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section> */}

      {/* 9. Premium Newsletter Section */}
      {/* <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-10" />
        <div className="container mx-auto px-4 lg:px-8">
           <div className="max-w-4xl mx-auto bg-primary rounded-[3.5rem] p-12 lg:p-20 text-center relative shadow-[0_50px_100px_rgba(37,99,235,0.2)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 space-y-8">
                 <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                    Join the Elite <br /> Outer Circle
                 </h2>
                 <p className="text-xl text-primary-foreground/80 font-medium max-w-xl mx-auto">
                    Be the first to know about flagship launches and secret VIP rewards. Zero spam, just pure tech intelligence.
                 </p>
                 <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-4 group">
                    <div className="relative flex-1">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                      <input 
                        type="email" 
                        placeholder="Enter premium email..." 
                        className="w-full h-16 rounded-2xl bg-white/10 border border-white/20 px-14 text-white placeholder:text-white/40 focus:outline-none focus:ring-4 focus:ring-white/10 focus:bg-white/20 transition-all font-bold"
                      />
                    </div>
                    <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-primary hover:bg-slate-100 font-black shadow-2xl transition-all active:scale-95 shrink-0 uppercase tracking-widest">
                       SUBSCRIBE
                    </Button>
                 </form>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] pt-4">Your privacy is our core hardware priority.</p>
              </div>
           </div>
        </div>
      </section> */}
      
    </div>
  );
}
