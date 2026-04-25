const text = "• **Alle stelsels:** <https://bit.ly/4kol0y5> <br>• **Gratis hulpbronne:** <https://bit.ly/3PATPoL>";

const processInline = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br />')
    .replace(/&lt;(https?:\/\/[^&]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};

console.log(processInline(text));
