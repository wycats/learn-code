export function parseMarkdown(text: string) {
	let html = '';
	let lastIndex = 0;
	const linkPattern = /\[(.*?)\]\((.*?)\)/g;

	for (const match of text.matchAll(linkPattern)) {
		const [fullMatch, label, url] = match;
		const matchIndex = match.index ?? 0;

		html += parseInlineText(text.slice(lastIndex, matchIndex));
		html += renderLink(label, url);
		lastIndex = matchIndex + fullMatch.length;
	}

	html += parseInlineText(text.slice(lastIndex));

	return html;
}

function parseInlineText(text: string) {
	let html = escapeHtml(text);

	// Bold
	html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

	// Italic
	html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

	// Code
	html = html.replace(/`(.*?)`/g, '<code>$1</code>');

	return html;
}

function renderLink(label: string, url: string) {
	const href = sanitizeHref(url);
	const labelHtml = parseInlineText(label);

	return href
		? `<a href="${href}" target="_blank" rel="noopener noreferrer">${labelHtml}</a>`
		: labelHtml;
}

function escapeHtml(text: string) {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string) {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function sanitizeHref(rawHref: string) {
	const trimmed = rawHref.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith('/') || trimmed.startsWith('#')) return escapeAttribute(trimmed);

	try {
		const parsed = new URL(trimmed);
		if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
			return escapeAttribute(parsed.href);
		}
	} catch {
		return null;
	}

	return null;
}
