"use client";

import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'

const types = ['info', 'success', 'warning', 'error', 'quest'] as const

const typeIcons: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  quest: '🎯',
}

export function SystemMessageNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const type = node.attrs.type || 'info'

  return (
    <NodeViewWrapper className={`system-message system-message--${type}`}>
      <div className="system-message-icon" contentEditable={false}>
        {typeIcons[type] || '📢'}
      </div>
      <NodeViewContent className="system-message-content" />
      {editor.isEditable && (
        <select
          value={type}
          onChange={(e) => updateAttributes({ type: e.target.value })}
          className="system-message-type-select"
          contentEditable={false}
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      )}
    </NodeViewWrapper>
  )
}
