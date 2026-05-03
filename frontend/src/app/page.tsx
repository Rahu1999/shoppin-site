'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Package, Clock, Sparkles, Loader2, Phone, Mail, MapPin, CheckCircle, MessageSquare } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SectionWrapper, SectionHeading } from '@/components/ui/SectionWrapper';
import { BRAND, buildWhatsAppLink } from '@/config/brand';
import { sendEmailAction } from '@/app/actions/sendEmail';

// ─── Feature/trust data ──────────────────────────────────────────────────────
const WHY_US = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'High-Quality Steel Build',
    desc: 'Made from food-grade stainless steel that resists rust, corrosion, and daily wear.',
  },
  {
    icon: <Package className="h-6 w-6" />,
    title: 'Space-Saving Designs',
    desc: 'Engineered to maximise every inch of your kitchen — from countertops to cabinets.',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Durable & Long-Lasting',
    desc: 'Built to outlast plastic alternatives. Invest once, use for years.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Modern Minimal Look',
    desc: 'Clean finishes that complement any kitchen style — traditional or contemporary.',
  },
];

export default function Home() {
  const { data: featuredData, isLoading } = useProducts({ isFeatured: 'true', limit: 6 });
  const { data: allData, isLoading: allLoading } = useProducts({ limit: 6 });
  const { mutate: addToCart } = useAddToCart();

  const [formState, setFormState] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const result = await sendEmailAction(formState);
      if (result.success) {
        setSubmitted(true);
      } else {
        alert(result.error || "Something went wrong.");
      }
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const featuredProducts = featuredData?.items || [];
  const allProducts = allData?.items || [];
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : allProducts;
  const loading = isLoading || allLoading;

  const handleAddToCart = (productId: string) => {
    addToCart({ productId, quantity: 1 });
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden">
        {/* Subtle metallic gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-200/60" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              opacity: 0.4,
            }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0 min-h-[88vh] py-20">

            {/* Left — Text */}
            <div className="flex-1 max-w-xl space-y-8">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
                Premium Steel Kitchen Storage
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tight">
                Smart Steel<br />
                <span className="text-gray-400">Storage</span><br />
                Solutions
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                {BRAND.subTagline}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors group text-base"
                >
                  {BRAND.ctaExplore}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors text-base"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Enquire Now
                </a>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-gray-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-gray-400" /> Food-grade steel
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-gray-400" /> Pan-India delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400" /> 5-year durability
                </span>
              </div>
            </div>

            {/* Right — Product preview grid (from API) */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : displayProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 relative">
                  {/* Decorative backdrop glow for products */}
                  <div className="absolute -inset-8 bg-gradient-to-tr from-slate-300/40 to-slate-100/20 blur-3xl rounded-full -z-10" />
                  
                  {displayProducts.slice(0, 4).map((product) => {
                    const img =
                      product.images?.find((i: any) => i.isPrimary)?.url ||
                      product.images?.[0]?.url ||
                      '/placeholder.png';
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 relative"
                      >
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Products loading...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ──────────────────────────────────────────────────────── */}
      <SectionWrapper gray>
        <SectionHeading
          title="Our Products"
          subtitle="Explore our range of premium steel kitchen storage solutions."
        />
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : displayProducts.length > 0 ? (
          <>
            <ProductGrid>
              {/* Ensure at least 3 cards are displayed by duplicating if necessary */}
              {(displayProducts.length > 0 && displayProducts.length < 3
                ? [...displayProducts, ...Array(3 - displayProducts.length).fill(displayProducts[0]).map((p, i) => ({ ...p, id: p.id + '-copy-' + i }))]
                : displayProducts
              ).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </ProductGrid>
            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all group"
              >
                View All Products
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 py-16">No products found. Check back soon.</p>
        )}
      </SectionWrapper>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div>
            <SectionHeading
              title="Why Choose Rajesh Industries?"
              subtitle="Over two decades of manufacturing experience, brought directly to your kitchen."
            />
            <div className="space-y-6">
              {WHY_US.map((item, idx) => (
                <div key={idx} className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stats / highlight */}
          <div className="grid grid-cols-2 gap-5">
            {[
              { num: '20+', label: 'Years of Experience' },
              { num: '500+', label: 'Products Delivered' },
              { num: '100%', label: 'Steel Quality' },
              { num: '₹', label: 'Best Price Guarantee' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-center"
              >
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{stat.num}</span>
                <span className="text-sm text-gray-500 font-medium mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ── WHATSAPP CTA STRIP ────────────────────────────────────────────── */}
      <section className="bg-gray-900 py-14">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Need help choosing the right product?
          </h2>
          <p className="text-gray-400 mb-8 text-base max-w-lg mx-auto">
            Our team is available on WhatsApp to answer questions, share dimensions, and help you find the perfect steel storage solution.
          </p>
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat with us on WhatsApp
          </a>
        </div>
      </section>

      {/* ── CONTACT & MAP ─────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-gray-50 border-t border-gray-100 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading
            title="Get in Touch"
            subtitle="Visit our store or drop us a message for bulk orders and custom requirements."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mt-12">
            
            {/* Left: Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-full min-h-[400px] relative bg-white">
              <iframe
                title={`${BRAND.name} Location`}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.314949576713!2d72.84883441490212!3d19.158737387038686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b64a27546419%3A0xc39304a08cf51df9!2sSonawala%20Rd%2C%20Goregaon%20East%2C%20Mumbai%2C%20Maharashtra%20400063!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full absolute inset-0"
              />
            </div>

            {/* Right: Contact Form */}
            <div>
              <div className="border border-gray-200 bg-white rounded-2xl shadow-sm p-8 h-full">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center h-full">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-2xl">Message Sent!</h3>
                    <p className="text-gray-500">
                      Thank you, <strong className="text-gray-900">{formState.name}</strong>!
                      We'll contact you on <strong className="text-gray-900">{formState.phone}</strong> shortly.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setFormState({ name: "", phone: "", message: "" }); }}
                      className="text-gray-600 text-sm hover:underline mt-2 font-medium"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-xl">
                        Send an Enquiry
                      </h3>
                    </div>

                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                      <div>
                        <label htmlFor="contact-name" className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                          Your Name *
                        </label>
                        <Input
                          id="contact-name"
                          name="name"
                          placeholder="e.g. Rahul Sharma"
                          value={formState.name}
                          onChange={handleContactChange}
                          required
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-gray-900 focus:ring-gray-900/10"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-phone" className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                          Phone Number *
                        </label>
                        <Input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          placeholder={`e.g. ${BRAND.phoneRaw}`}
                          value={formState.phone}
                          onChange={handleContactChange}
                          required
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-gray-900 focus:ring-gray-900/10"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-message" className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                          Your Message *
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          placeholder="Tell us about your requirement..."
                          value={formState.message}
                          onChange={handleContactChange}
                          required
                          rows={4}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl p-3 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:outline-none resize-none text-sm"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="bg-gray-900 text-white rounded-xl py-6 font-bold text-base hover:bg-gray-800 disabled:opacity-70 transition-colors mt-2"
                      >
                        {formLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Send Message"
                        )}
                      </Button>

                      <p className="text-gray-500 text-xs text-center mt-2">
                        Or contact us on WhatsApp:{" "}
                        <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
                          Click Here
                        </a>
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT INFO STRIP ────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Call us</p>
                <a href={`tel:${BRAND.phoneRaw}`} className="font-semibold text-gray-900 hover:text-gray-600 transition-colors text-sm">
                  {BRAND.phone}
                </a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Email us</p>
                <a href={`mailto:${BRAND.email}`} className="font-semibold text-gray-900 hover:text-gray-600 transition-colors text-sm">
                  {BRAND.email}
                </a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Visit us</p>
                <p className="font-semibold text-gray-900 text-sm">{BRAND.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
