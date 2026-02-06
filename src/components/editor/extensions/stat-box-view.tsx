"use client";

import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'

const variants = ['blue', 'green', 'red', 'purple', 'gold'] as const

export function StatBoxNodeView({ node, updateAttributes }: NodeViewProps) {
  const variant = node.attrs.variant || 'blue'
  const title = node.attrs.title

  return (
    <NodeViewWrapper className={`stat-box stat-box--${variant}`}>
      <div className="stat-box-header">
        {title && <div className="stat-box-title">{title}</div>}
        <div className="stat-box-controls">
          <select
            value={variant}
            onChange={(e) => updateAttributes({ variant: e.target.value })}
            className="stat-box-variant-select"
            contentEditable={false}
          >
            {variants.map((v) => (
              <option key={v} value={v}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <NodeViewContent className="stat-box-content" />
    </NodeViewWrapper>
  )
}
