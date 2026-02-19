/**
 * Zapier Code Step: Sanitize livechat input fields.
 *
 * Decodes HTML entities and strips HTML tags from the transcript and
 * description fields. This prevents user-generated HTML/script content
 * from passing through to downstream steps (CRM, email, etc.).
 *
 * Zapier automatically handles JSON serialization of the returned object,
 * so no manual escaping of quotes/newlines is needed.
 *
 * Input:
 * - inputData.transcript:  The raw livechat transcript text
 * - inputData.description: A summary or description of the chat
 *
 * Output:
 * - sanitizedTranscript:  The cleaned transcript text
 * - sanitizedDescription: The cleaned description text
 */

const entityMap = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&nbsp;': ' '
};

function decodeEntities(str) {
    return str
        .replace(/&(?:amp|lt|gt|quot|nbsp|apos|#39);/gi, match => entityMap[match.toLowerCase()] || match)
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function sanitize(text) {
    if (!text || typeof text !== 'string') return '';
    return decodeEntities(text).replace(/<[^>]+>/g, '');
}

return {
    sanitizedTranscript: sanitize(inputData.transcript),
    sanitizedDescription: sanitize(inputData.description)
};
