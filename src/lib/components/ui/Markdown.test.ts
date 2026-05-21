import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './markdown';

describe('parseMarkdown', () => {
	it('renders basic emphasis and safe https links', () => {
		expect(parseMarkdown('Read **this** [guide](https://example.test/path?q=1).')).toBe(
			'Read <strong>this</strong> <a href="https://example.test/path?q=1" target="_blank" rel="noopener noreferrer">guide</a>.'
		);
	});

	it('escapes html in user content', () => {
		expect(parseMarkdown('<img src=x onerror=alert(1)>')).toBe(
			'&lt;img src=x onerror=alert(1)&gt;'
		);
	});

	it('drops javascript links while preserving label text', () => {
		expect(parseMarkdown('[click me](javascript:alert)')).toBe('click me');
	});

	it('escapes quotes in link href attributes', () => {
		expect(parseMarkdown('[safe](https://example.test/?q=" onclick="alert)')).toBe(
			'<a href="https://example.test/?q=%22%20onclick=%22alert" target="_blank" rel="noopener noreferrer">safe</a>'
		);
	});
});
