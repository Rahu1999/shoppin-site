'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect, useRef } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, LinkIcon, ImageIcon, Loader2 } from 'lucide-react';
import { apiPost } from '@/services/apiClient';
import { toast } from 'sonner';
import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep the editor in sync if `value` changes from outside (e.g. loading an existing post)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('Link URL');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const response = await apiPost<{ urls: string[] }>('/upload', formData);
      const url = response.urls[0];
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toolbarBtn = (active: boolean) =>
    `p-2 rounded-md hover:bg-slate-100 transition-colors ${active ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`;

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarBtn(editor.isActive('bold'))} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarBtn(editor.isActive('italic'))} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 2 }))} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 3 }))} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarBtn(editor.isActive('bulletList'))} title="Bullet list">
          <List className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarBtn(editor.isActive('orderedList'))} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" onClick={setLink} className={toolbarBtn(editor.isActive('link'))} title="Link">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button type="button" onClick={insertImage} disabled={uploading} className={toolbarBtn(false)} title="Insert image">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageFile} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
