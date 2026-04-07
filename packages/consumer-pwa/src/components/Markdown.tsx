'use client'

import React from 'react'

interface MarkdownProps {
  content: string
  className?: string
}

export default function Markdown({ content, className = '' }: MarkdownProps) {
  if (!content) return null

  // Refined mini-parser for PWA
  let parsingTable = false
  let tableRows: string[] = []
  const lines = content.split('\n')
  const processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|')
    
    if (isTableLine) {
      if (!parsingTable) parsingTable = true
      if (/^\|[-:| ]+\|$/.test(line.trim())) continue
      
      const isHeader = tableRows.length === 0
      const cells = line.trim().slice(1, -1).split('|').map(c => c.trim())
      const rowContent = cells.map(c => 
        isHeader ? `<th>${c}</th>` : `<td>${c}</td>`
      ).join('')
      
      tableRows.push(`<tr>${rowContent}</tr>`)
    } else {
      if (parsingTable) {
        processedLines.push(`<div class="md-table-wrapper"><table><tbody>${tableRows.join('')}</tbody></table></div>`)
        parsingTable = false
        tableRows = []
      }
      processedLines.push(line)
    }
  }

  if (parsingTable) {
    processedLines.push(`<div class="md-table-wrapper"><table><tbody>${tableRows.join('')}</tbody></table></div>`)
  }

  const html = processedLines.join('\n')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\*(.+)/gm, '<li>$1</li>')
    .replace(/^- (.+)/gm, '<li>$1</li>')

  const paragraphs = html.split(/\n\n+/).map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<li') || p.trim().startsWith('<div')) return p
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`
  }).join('')

  return (
    <div 
      className={`markdown-body ${className}`}
      dangerouslySetInnerHTML={{ __html: paragraphs }} 
    />
  )
}
