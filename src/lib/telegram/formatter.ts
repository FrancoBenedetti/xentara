import { Publication, Hub } from '@/app/dashboard/actions';

/**
 * Escapes characters for Telegram HTML mode
 */
export function escapeHTML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Detects if a line is a table row in Markdown
 */
function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|');
}

/**
 * Converts a markdown table into a more readable list format for Telegram mobile
 */
function processTable(lines: string[]): string[] {
  let firstDataRow = true;
  let headers: string[] = [];
  const result: string[] = [];

  for (const line of lines) {
    const cells = line.trim().split('|').filter(c => c.trim() !== '' || line.includes('||')).map(c => c.trim());
    
    // Skip divider row
    if (line.match(/^[|:\s\-]+$/)) continue;

    if (firstDataRow) {
      headers = cells;
      firstDataRow = false;
      // We don't print the header as a standalone line usually, 
      // but we use it for the "Key: Value" mapping.
      continue;
    }

    // Format the row as a list item
    if (cells.length >= 2) {
      // Bold the first cell as the title
      const title = cells[0].replace(/\*\*/g, ''); 
      const details = cells.slice(1).map(c => c.replace(/\*\*/g, '')).join(' · ');
      result.push(`• <b>${escapeHTML(title)}</b>: ${escapeHTML(details)}`);
    } else if (cells.length === 1) {
      result.push(`• ${escapeHTML(cells[0].replace(/\*\*/g, ''))}`);
    }
  }

  return result;
}

/**
 * Very basic Markdown to HTML converter for Telegram
 */
export function markdownToHTML(text: string): string {
  if (!text) return '';
  
  const lines = text.split('\n');
  const finalOutput: string[] = [];
  let currentTable: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isTableRow(line)) {
      currentTable.push(line);
    } else {
      // If we were processing a table and it just ended
      if (currentTable.length > 0) {
        finalOutput.push(...processTable(currentTable));
        currentTable = [];
      }

      // Process standard line
      let l = escapeHTML(line);
      
      // Headers (###, ##, #) -> Bold
      l = l.replace(/^### (.*$)/gm, '<b>$1</b>');
      l = l.replace(/^## (.*$)/gm, '<b>$1</b>');
      l = l.replace(/^# (.*$)/gm, '<b>$1</b>');
      
      // Bold (**text** or __text__)
      l = l.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      l = l.replace(/__(.*?)__/g, '<b>$1</b>');
      
      // Italic (*text* or _text_)
      l = l.replace(/\*(.*?)\*/g, '<i>$1</i>');
      l = l.replace(/_(.*?)_/g, '<i>$1</i>');
      
      // Inline Code (`code`)
      l = l.replace(/`(.*?)`/g, '<code>$1</code>');
      
      // Links ([text](url))
      l = l.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      
      // Horizontal rule (---)
      if (line.trim() === '---') l = '━━━━━━━━━━';
      
      finalOutput.push(l);
    }
  }

  // Handle trailing table
  if (currentTable.length > 0) {
    finalOutput.push(...processTable(currentTable));
  }

  return finalOutput.join('\n');
}

export function formatPublicationForTelegram(publication: Publication, hub: Hub): string {
  const hubName = escapeHTML(hub.name);
  const title = escapeHTML(publication.title);
  const byline = escapeHTML(publication.byline || 'Unknown Author');
  
  const summary = markdownToHTML(publication.summary || '');
  
  let finalSummary = summary;
  if (finalSummary.length > 3500) {
    finalSummary = finalSummary.substring(0, 3500) + '...';
  }

  const tags = publication.tags?.map(t => `#${escapeHTML(t.replace(/\s+/g, '_'))}`).join(' · ') || '';
  
  let sentimentBlock = '';
  if (publication.sentiment_score !== null && publication.sentiment_score !== undefined) {
    const score = publication.sentiment_score;
    const normalized = Math.max(0, Math.min(1, score));
    const filled = Math.round(normalized * 5);
    sentimentBlock = '■'.repeat(filled) + '□'.repeat(5 - filled);
    sentimentBlock = `\n📊 sentiment: ${sentimentBlock}`;
  }

  const commentary = publication.curator_commentary 
    ? `\n\n💬 <b>Curator's Take:</b>\n<i>${escapeHTML(publication.curator_commentary)}</i>`
    : '';

  const sourceUrl = publication.source_url ? escapeHTML(publication.source_url) : '';
  const urlLink = sourceUrl ? `\n\n🔗 <a href="${sourceUrl}">Read Full Source</a>` : '';

  return `🧠 <b>${hubName}</b>\n━━━━━━━━━━\n📰 <b>${title}</b>\n<i>By ${byline}</i>\n\n${finalSummary}\n\n🏷️ ${tags}${sentimentBlock}${commentary}${urlLink}`;
}
