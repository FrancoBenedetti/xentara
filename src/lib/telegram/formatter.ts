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
 * Very basic Markdown to HTML converter for Telegram
 * Targets: **bold**, *italic*, [link](url), `code`, ### headers
 */
export function markdownToHTML(text: string): string {
  if (!text) return '';
  
  let html = escapeHTML(text);
  
  // Headers (###, ##, #) -> Bold
  html = html.replace(/^### (.*$)/gm, '<b>$1</b>');
  html = html.replace(/^## (.*$)/gm, '<b>$1</b>');
  html = html.replace(/^# (.*$)/gm, '<b>$1</b>');
  
  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/__(.*?)__/g, '<b>$1</b>');
  
  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
  html = html.replace(/_(.*?)_/g, '<i>$1</i>');
  
  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Links ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // Horizontal rule (---)
  html = html.replace(/^---$/gm, '━━━━━━━━━━');

  return html;
}

export function formatPublicationForTelegram(publication: Publication, hub: Hub): string {
  const hubName = escapeHTML(hub.name);
  const title = escapeHTML(publication.title);
  const byline = escapeHTML(publication.byline || 'Unknown Author');
  
  // Use markdownToHTML for the summary since it comes from AI in Markdown
  const summary = markdownToHTML(publication.summary || '');
  
  // Truncate summary if too long for Telegram (approx 4096 char limit total)
  // We truncate after HTML conversion which is slightly risky for tag closing
  // but simpler. A better way would be to truncate the source, but tags change length.
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
