import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'

/**
 * Robust Markdown to HTML parser for Web View
 * Handles \r\n, tables, code blocks, and lists with high precision.
 */
function parseMarkdownToWebHTML(content: string): string {
  if (!content) return '';

  // Standardize line endings
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.split('\n');
  
  const blocks: string[] = [];
  let currentTable: string[][] = [];
  let currentCodeBlock: string[] = [];
  let currentParagraph: string[] = [];
  
  let mode: 'normal' | 'code' | 'table' = 'normal';

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        blocks.push(`<p>${processInline(text)}</p>`);
      }
      currentParagraph = [];
    }
  };

  const flushTable = () => {
    if (currentTable.length > 0) {
      const rows = currentTable.map((cells, idx) => {
        const tag = idx === 0 ? 'th' : 'td';
        return `<tr>${cells.map(c => `<${tag}>${processInline(c)}</${tag}>`).join('')}</tr>`;
      });
      blocks.push(`<div class="table-container"><table><tbody>${rows.join('')}</tbody></table></div>`);
      currentTable = [];
    }
  };

  const processInline = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code Block Toggle
    if (trimmed.startsWith('```')) {
      if (mode === 'code') {
        const codeText = currentCodeBlock.join('\n');
        blocks.push(`<pre><code>${codeText}</code></pre>`);
        currentCodeBlock = [];
        mode = 'normal';
      } else {
        flushParagraph();
        flushTable();
        mode = 'code';
      }
      continue;
    }

    // While in Code Mode
    if (mode === 'code') {
      // Escape HTML in code blocks but preserve raw indent
      currentCodeBlock.push(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }

    // Table Row Detection
    if (trimmed.startsWith('|') && trimmed.split('|').length > 2) {
      if (mode !== 'table') {
        flushParagraph();
        mode = 'table';
      }
      // Skip separator rows like |---|---|
      if (!/^\|[-:| ]+\|$/.test(trimmed)) {
        const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
        currentTable.push(cells);
      }
      continue;
    } else if (mode === 'table') {
      flushTable();
      mode = 'normal';
    }

    // Headlines (H1-H6)
    if (trimmed.startsWith('#')) {
      flushParagraph();
      const match = trimmed.match(/^(#+)\s+(.*)/);
      if (match) {
        const level = Math.min(match[1].length, 6);
        const text = match[2];
        blocks.push(`<h${level}>${processInline(text)}</h${level}>`);
        continue;
      }
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      blocks.push('<hr/>');
      continue;
    }

    // Bullet Lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      const text = trimmed.replace(/^[*-\d.]+\s+/, '');
      blocks.push(`<ul><li>${processInline(text)}</li></ul>`); // Simplified: each item in own UL for now
      continue;
    }

    // Empty Line
    if (trimmed === '') {
      flushParagraph();
    } else {
      currentParagraph.push(trimmed);
    }
  }

  // Final Flushes
  flushParagraph();
  flushTable();
  if (mode === 'code' && currentCodeBlock.length > 0) {
    blocks.push(`<pre><code>${currentCodeBlock.join('\n')}</code></pre>`);
  }

  return blocks.join('');
}

export default async function PublicationViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: pub, error } = await supabase
    .from('publications')
    .select('*, hubs(name, brand_color)')
    .eq('id', id)
    .single()

  if (error || !pub) notFound()

  const htmlContent = parseMarkdownToWebHTML(pub.summary || '')

  return (
    <div style={{ 
      background: '#0a0a0c', 
      color: '#e4e4e7', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '1.5rem',
      lineHeight: 1.6
    }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #27272a', paddingBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '0.25rem 0.85rem', 
            background: `${pub.hubs.brand_color || '#6366f1'}22`, 
            color: pub.hubs.brand_color || '#6366f1',
            borderRadius: '99px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '1.25rem'
          }}>
            {pub.hubs.name} Intelligence
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '0.75rem', color: '#ffffff' }}>
            {pub.title}
          </h1>
          {pub.byline && (
            <p style={{ color: '#a1a1aa', fontSize: '1rem', fontWeight: 500, margin: 0 }}>
              By {pub.byline}
            </p>
          )}
        </header>

        {pub.curator_commentary && (
            <div style={{ 
                background: 'rgba(99, 102, 241, 0.05)', 
                borderLeft: `4px solid ${pub.hubs.brand_color || '#6366f1'}`,
                padding: '1.25rem 1.75rem',
                marginBottom: '3rem',
                borderRadius: '0 0.75rem 0.75rem 0'
            }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: pub.hubs.brand_color || '#6366f1', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Curator Perspective
                </p>
                <p style={{ margin: 0, fontStyle: 'italic', color: '#d1d1d6', fontSize: '1rem' }}>
                    &ldquo;{pub.curator_commentary}&rdquo;
                </p>
            </div>
        )}

        <main className="content-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />

        <footer style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '4rem' }}>
            {pub.source_url && (
                <a 
                    href={pub.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '1rem',
                        background: '#ffffff',
                        color: '#000000',
                        textAlign: 'center',
                        borderRadius: '0.75rem',
                        fontWeight: 900,
                        textDecoration: 'none',
                    }}
                >
                    Read Original Article ↗
                </a>
            )}
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#71717a' }}>
                Delivered by Xentara Library & Distribution Engine
            </p>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; }
        .content-body p { margin-bottom: 1.25rem; font-size: 1.05rem; }
        .content-body h1 { color: #ffffff; font-size: 1.75rem; margin-top: 2.5rem; }
        .content-body h2 { color: #ffffff; font-size: 1.5rem; margin-top: 2rem; }
        .content-body h3 { color: #ffffff; font-size: 1.25rem; margin-top: 1.5rem; }
        .content-body h4 { color: #ffffff; font-size: 1.1rem; margin-top: 1.25rem; }
        .content-body strong { color: #ffffff; }
        .content-body li { margin-bottom: 0.5rem; color: #d4d4d8; list-style-position: inside; }
        .content-body a { color: ${pub.hubs.brand_color || '#6366f1'}; text-decoration: underline; }
        .content-body hr { height: 1px; border: none; background: #27272a; margin: 2rem 0; }
        .content-body ul { margin-bottom: 1.25rem; padding-left: 0; }
        
        pre { 
            background: #111113; 
            padding: 1.25rem; 
            border-radius: 0.75rem; 
            overflow-x: auto; 
            margin: 1.5rem 0;
            border: 1px solid #27272a;
        }
        code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 0.9rem; color: #e4e4e7; line-height: 1.5; }
        pre code { white-space: pre; word-break: normal; }
        :not(pre) > code { 
            background: #27272a; 
            padding: 0.2rem 0.4rem; 
            border-radius: 0.4rem; 
            font-size: 0.85em;
        }
        
        .table-container { 
            overflow-x: auto; 
            margin: 1.5rem 0; 
            border: 1px solid #27272a; 
            border-radius: 0.75rem; 
        }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { background: #18181b; padding: 0.75rem 1rem; text-align: left; color: #ffffff; border-bottom: 1px solid #27272a; }
        td { padding: 0.75rem 1rem; border-bottom: 1px solid #27272a; color: #d4d4d8; }
        tr:last-child td { border-bottom: none; }
      `}} />
    </div>
  )
}
