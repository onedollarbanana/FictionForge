"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { StatBox, SystemMessage, Spoiler } from "@/components/editor/extensions";
import "@/styles/editor.css";

interface TiptapRendererProps {
  content: string;
  className?: string;
}

export function TiptapRenderer({ content, className = "" }: TiptapRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      StatBox,
      SystemMessage,
      Spoiler,
    ],
    content: content ? JSON.parse(content) : "",
    editable: false,
    editorProps: {
      attributes: {
        class: `prose prose-lg dark:prose-invert max-w-none ${className}`,
      },
    },
  });

  if (!editor) {
    return <div className="animate-pulse h-96 bg-muted rounded" />;
  }

  return <EditorContent editor={editor} />;
}
