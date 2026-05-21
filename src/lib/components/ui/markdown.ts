export function parseMarkdown(text: string) {
	// Escape HTML first to prevent XSS (basic)
	let html = escapeHtml(text);

	// Bold
	html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

	// Italic
	html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

	// Code
	html = html.replace(/`(.*?)`/g, '<code>$1</code>');

	// Links
	html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_match, label: string, url: string) => {
		const href = sanitizeHref(url);
		return href
			? `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
			: label;
	});

	return html;
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
