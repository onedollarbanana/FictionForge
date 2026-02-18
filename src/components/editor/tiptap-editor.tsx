"use client";

import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { EditorToolbar } from './editor-toolbar'
import { StatBox, SystemMessage, Spoiler } from './extensions'
import '@/styles/editor.css'

/**
 * Cleans HTML pasted from Word, Google Docs, and other rich text sources.
 * Strips unwanted styles, classes, and attributes while preserving structure.
 */
function cleanPastedHTML(html: string): string {
  if (typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove all style, meta, link, and xml tags (Word/Docs add these)
  doc.querySelectorAll('style, meta, link, xml, o\\:p, w\\:wrap').forEach(el => el.remove());

  // Process all elements
  doc.querySelectorAll('*').forEach(el => {
    // Remove all class attributes (Word classes like MsoNormal, etc.)
    el.removeAttribute('class');

    // Remove all style attributes (inline styles from Word/Docs)
    el.removeAttribute('style');

    // Remove Word-specific attributes
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('mso-') ||
          attr.name.startsWith('v:') ||
          attr.name.startsWith('o:') ||
          attr.name.startsWith('w:') ||
          attr.name === 'lang' ||
          attr.name === 'dir') {
        el.removeAttribute(attr.name);
      }
    });

    // Convert Word-style bold/italic spans (remove empty spans)
    if (el.tagName === 'SPAN' && el.innerHTML === el.textContent) {
      // Unwrap span - replace with just text
      el.replaceWith(...Array.from(el.childNodes));
    }
  });

  // Convert Google Docs line breaks
  doc.querySelectorAll('br.Apple-interchange-newline').forEach(br => {
    br.removeAttribute('class');
  });

  // Clean up empty paragraphs that only contain &nbsp; or whitespace
  doc.querySelectorAll('p').forEach(p => {
    if (p.innerHTML.trim() === '&nbsp;' || p.innerHTML.trim() === '') {
      // Keep as empty paragraph (Tiptap handles these correctly)
      p.innerHTML = '<br>';
    }
  });

  return doc.body.innerHTML;
}

interface TiptapEditorProps {
  content: JSONContent | null
  onChange: (content: JSONContent) => void
  placeholder?: string
}

export function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your chapter...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      StatBox,
      SystemMessage,
      Spoiler,
    ],
    content: content || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
      transformPastedHTML(html) {
        return cleanPastedHTML(html);
      },
    },
  })

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

// Utility to count words from Tiptap JSON
export function countWordsFromJSON(json: JSONContent): number {
  let count = 0
  
  function traverse(node: JSONContent) {
    if (node.type === 'text' && node.text) {
      count += node.text.trim().split(/\s+/).filter(Boolean).length
    }
    if (node.content) {
      node.content.forEach(traverse)
    }
  }
  
  if (json) {
    traverse(json)
  }
  return count
}

// Convert JSON to HTML for publishing
export function getHTMLFromJSON(json: JSONContent): string {
  // This would normally use generateHTML from @tiptap/html
  // For now, we'll store both JSON and let the reader render from JSON
  return ''
}
