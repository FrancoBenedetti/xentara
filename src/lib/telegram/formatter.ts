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
    
    if (line.match(/^[|:\s\-]+$/)) continue;

    if (firstDataRow) {
      headers = cells;
      firstDataRow = false;
      continue;
    }

    if (cells.length >= 2) {
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
  
  // Truncate the raw markdown BEFORE adding HTML tags to avoid slicing tags in half
  let safeText = text;
  if (safeText.length > 3000) {
    safeText = safeText.substring(0, 3000) + '... (truncated for Telegram)';
  }

  const lines = safeText.split('\n');
  const finalOutput: string[] = [];
  let currentTable: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isTableRow(line)) {
      currentTable.push(line);
    } else {
      if (currentTable.length > 0) {
        finalOutput.push(...processTable(currentTable));
        currentTable = [];
      }

      let l = escapeHTML(line);
      
      l = l.replace(/^### (.*$)/gm, '<b>$1</b>');
      l = l.replace(/^## (.*$)/gm, '<b>$1</b>');
      l = l.replace(/^# (.*$)/gm, '<b>$1</b>');
      l = l.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      l = l.replace(/__(.*?)__/g, '<b>$1</b>');
      l = l.replace(/\*(.*?)\*/g, '<i>$1</i>');
      l = l.replace(/_(.*?)_/g, '<i>$1</i>');
      l = l.replace(/`(.*?)`/g, '<code>$1</code>');
      l = l.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      
      if (line.trim() === '---') l = '━━━━━━━━━━';
      
      finalOutput.push(l);
    }
  }

  if (currentTable.length > 0) {
    finalOutput.push(...processTable(currentTable));
  }

  return finalOutput.join('\n');
}

export function formatPublicationForTelegram(publication: Publication, hub: Hub): string {
  const hubName = escapeHTML(hub.name);
  const title = escapeHTML(publication.title);
  const byline = escapeHTML(publication.byline || 'Unknown Author');
  
  // Process the summary markdown (already truncated inside)
  const summary = markdownToHTML(publication.summary || '');
  
  const commentary = publication.curator_commentary 
    ? `\n\n💬 <b>Curator's Take:</b>\n<i>${escapeHTML(publication.curator_commentary)}</i>`
    : '';

  const sourceUrl = publication.source_url ? escapeHTML(publication.source_url) : '';
  const urlLink = sourceUrl ? `\n\n🔗 <a href="${sourceUrl}">Read Full Source</a>` : '';

  return `🧠 <b>${hubName}</b>\n━━━━━━━━━━\n📰 <b>${title}</b>\n<i>By ${byline}</i>\n\n${summary}\n\n🏷️ ${publication.tags?.map(t => `#${escapeHTML(t.replace(/\s+/g, '_'))}`).join(' · ') || ''}${commentary}${urlLink}`;
}

/**
 * Alternative format: Just a clean preview with no long summary
 * Designed to be used with "Read More" buttons
 */
export function formatPreviewForTelegram(publication: Publication, hub: Hub): string {
  const hubName = escapeHTML(hub.name);
  const title = escapeHTML(publication.title);
  const byline = escapeHTML(publication.byline || 'Unknown Author');
  
  const commentary = publication.curator_commentary 
    ? `\n\n💬 <b>Curator's Take:</b>\n<i>${escapeHTML(publication.curator_commentary)}</i>`
    : '';

  const tags = publication.tags?.slice(0, 3).map(t => `#${escapeHTML(t.replace(/\s+/g, '_'))}`).join(' ') || '';

  return `🧠 <b>${hubName}</b>\n━━━━━━━━━━\n<b>${title}</b>\n<i>By ${byline}</i>${commentary}\n\n${tags}`;
}
