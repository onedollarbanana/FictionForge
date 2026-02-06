import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { SystemMessageNodeView } from './system-message-view'

export interface SystemMessageOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    systemMessage: {
      setSystemMessage: (attributes?: { type?: string }) => ReturnType
    }
  }
}

export const SystemMessage = Node.create<SystemMessageOptions>({
  name: 'systemMessage',
  group: 'block',
  content: 'inline*',
  
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => ({
          'data-type': attributes.type,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-system-message]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(
      { 'data-system-message': '', class: `system-message system-message--${HTMLAttributes['data-type'] || 'info'}` },
      this.options.HTMLAttributes,
      HTMLAttributes
    ), 0]
  },

  addCommands() {
    return {
      setSystemMessage: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'text', text: 'System message...' }],
        })
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(SystemMessageNodeView)
  },
})
