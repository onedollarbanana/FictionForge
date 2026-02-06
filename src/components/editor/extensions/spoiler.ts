import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { SpoilerNodeView } from './spoiler-view'

export interface SpoilerOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spoiler: {
      setSpoiler: (attributes?: { label?: string }) => ReturnType
    }
  }
}

export const Spoiler = Node.create<SpoilerOptions>({
  name: 'spoiler',
  group: 'block',
  content: 'block+',
  
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      label: {
        default: 'Spoiler',
        parseHTML: element => element.querySelector('summary')?.textContent || 'Spoiler',
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'details.spoiler' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['details', mergeAttributes(
      { class: 'spoiler' },
      this.options.HTMLAttributes,
      HTMLAttributes
    ), 
      ['summary', {}, node.attrs.label || 'Spoiler'],
      ['div', { class: 'spoiler-content' }, 0]
    ]
  },

  addCommands() {
    return {
      setSpoiler: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'paragraph' }],
        })
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(SpoilerNodeView)
  },
})
