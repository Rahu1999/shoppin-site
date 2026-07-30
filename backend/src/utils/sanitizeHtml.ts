import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as unknown as Parameters<typeof createDOMPurify>[0]);

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 's',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li', 'blockquote',
  'a', 'img', 'code', 'pre',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height'];

/** Sanitizes rich-text HTML (from the blog editor) to a strict allowlist before it's persisted. */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR });
}
