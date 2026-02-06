"use client";

import { useState } from 'react'
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'

export function SpoilerNodeView({ node, updateAttributes }: NodeViewProps) {
  const [isOpen, setIsOpen] = useState(true) // Open by default in editor
  const label = node.attrs.label || 'Spoiler'

  return (
    <NodeViewWrapper className="spoiler-wrapper">
      <details className="spoiler" open={isOpen}>
        <summary 
          onClick={(e) => {
            e.preventDefault()
            setIsOpen(!isOpen)
          }}
          className="spoiler-summary"
        >
          <input
            type="text"
            value={label}
            onChange={(e) => updateAttributes({ label: e.target.value })}
            className="spoiler-label-input"
            placeholder="Spoiler label..."
            onClick={(e) => e.stopPropagation()}
          />
          <span className="spoiler-toggle" contentEditable={false}>
            {isOpen ? '▼' : '▶'}
          </span>
        </summary>
        <div className="spoiler-content">
          <NodeViewContent />
        </div>
      </details>
    </NodeViewWrapper>
  )
}
