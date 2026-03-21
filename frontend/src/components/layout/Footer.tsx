import Link from 'next/link';
import { Package, ShieldCheck, Truck, HeadphonesIcon, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-[#0F172A] pt-24 pb-12 overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-secondary" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tighter text-white">
                MODERN<span className="text-primary">SHOP</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The world's most advanced eCommerce architecture designed for the modern consumer. Experience speed, security, and premium design in every interaction.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-primary/50" /> Explore
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/products" className="text-slate-400 hover:text-primary hover:translate-x-1 inline-block transition-all">All Products</Link></li>
              <li><Link href="/categories" className="text-slate-400 hover:text-primary hover:translate-x-1 inline-block transition-all">Featured Categories</Link></li>
              <li><Link href="/deals" className="text-slate-400 hover:text-primary hover:translate-x-1 inline-block transition-all">Limited Deals</Link></li>
              <li><Link href="/wishlist" className="text-slate-400 hover:text-primary hover:translate-x-1 inline-block transition-all">My Wishlist</Link></li>
            </ul>
          </div>

          {/* Customer Support Column */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-indigo-500/50" /> Support
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/account" className="text-slate-400 hover:text-primary hover:translate-x-1 inline-block transition-all">My Account</Link></li>
              <li><Link href="/orders" className="text-slate-400 hover:text-primary hover:translate-x-1 inline-block transition-all">Order Tracking</Link></li>
              <li><Link href="/returns" className="text-slate-400 hover:text-primary hover:translate-x-1 inline-block transition-all">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="text-slate-400 hover:text-primary hover:translate-x-1 inline-block transition-all">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-primary/50" /> Get in Touch
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>123 Global Tech Tower, Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>+1 (555) 000-1234</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>hello@modernshop.com</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium italic">
            Built with Next.js, TypeORM, and Passion.
          </p>
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} ModernShop Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
             {/* Payment Icons Placeholder */}
             <div className="h-6 w-10 bg-white/10 rounded" />
             <div className="h-6 w-10 bg-white/10 rounded" />
             <div className="h-6 w-10 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </footer>
  );
}
