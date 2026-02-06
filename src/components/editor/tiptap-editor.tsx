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
import { EditorToolbar } from './editor-toolbar'
import { StatBox, SystemMessage, Spoiler } from './extensions'
import '@/styles/editor.css'

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
