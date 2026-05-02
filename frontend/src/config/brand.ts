// ============================================================
// RAJESH INDUSTRIES — Central Brand Configuration
// Update this file to change brand-wide text, links, contacts
// ============================================================

export const BRAND = {
  name: 'Rajesh Industries',
  shortName: 'Rajesh Ind.',
  tagline: 'Smart Steel Storage Solutions',
  subTagline: 'Durable. Space-saving. Designed for modern homes.',
  domain: 'steelkitchen.in',

  // Contact
  phone: '+91 98702 12660',
  phoneRaw: '9870212660',
  email: 'rajeshindustries29@gmail.com',
  address: 'Sonawala Road, Goregaon East, Mumbai – 400063',

  // WhatsApp
  whatsappNumber: '919870212660', // country code + number, no +
  whatsappBaseUrl: 'https://wa.me/919870212660',

  // SEO
  siteTitle: 'Rajesh Industries — Steel Kitchen Storage',
  siteDescription:
    'Premium steel kitchen storage products. Durable, space-saving, and designed for modern Indian homes. Shop racks, organisers, and more.',

  // CTA text
  ctaExplore: 'Explore Products',
  ctaEnquire: 'Enquire on WhatsApp',
  ctaBuy: 'Add to Cart',
} as const;

/** Generates a WhatsApp link pre-filled with a message */
export function buildWhatsAppLink(message?: string): string {
  const text = message
    ? encodeURIComponent(message)
    : encodeURIComponent(`Hi, I'm interested in your steel kitchen storage products.`);
  return `${BRAND.whatsappBaseUrl}?text=${text}`;
}

/** Generates a WhatsApp link for a specific product */
export function buildProductWhatsAppLink(productName: string): string {
  return buildWhatsAppLink(
    `Hi, I'd like to enquire about: *${productName}*. Please share more details.`
  );
}
