import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { StatBoxNodeView } from './stat-box-view'

export interface StatBoxOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    statBox: {
      setStatBox: (attributes?: { variant?: string; title?: string }) => ReturnType
    }
  }
}

export const StatBox = Node.create<StatBoxOptions>({
  name: 'statBox',
  group: 'block',
  content: 'block+',
  
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      variant: {
        default: 'blue',
        parseHTML: element => element.getAttribute('data-variant'),
        renderHTML: attributes => ({
          'data-variant': attributes.variant,
        }),
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => ({
          'data-title': attributes.title,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-stat-box]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(
      { 'data-stat-box': '', class: `stat-box stat-box--${HTMLAttributes['data-variant'] || 'blue'}` },
      this.options.HTMLAttributes,
      HTMLAttributes
    ), 0]
  },

  addCommands() {
    return {
      setStatBox: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'paragraph' }],
        })
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(StatBoxNodeView)
  },
})
