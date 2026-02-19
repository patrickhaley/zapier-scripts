/**
 * Zapier Code Step: Clean up livechat transcript formatting.
 *
 * - Decodes HTML entities and strips HTML tags (sanitizes user-generated content)
 * - Strips dates from timestamps, keeping only the time
 * - Replaces "I" / "Bot" prefix with "Live Chat"
 * - Replaces "User" prefix with the customer's first name
 *
 * Example:
 * - '<span style="white-space: nowrap;">G.J.</span> Gardner' → "G.J. Gardner"
 * - "I (2025-02-11 8:47am): Hello!"    → "Live Chat (8:47am): Hello!"
 * - "User (2025-02-11 8:48am): Hi"     → "Patrick (8:48am): Hi"
 *
 * Input:
 * - inputData.transcript: The full chat transcript text with timestamps
 * - inputData.firstName: The customer's first name (from the name-parse step)
 *
 * Output:
 * - processedText: The cleaned transcript
 */

const transcript = inputData.transcript;
const firstName = inputData.firstName;

if (!transcript) {
    return { processedText: null };
}

// Decode HTML entities so encoded payloads (e.g. &lt;script&gt;) become real
// tags and get caught by the tag strip. Zapier Code Steps don't have a DOM,
// so we handle the common named entities and numeric codes manually.
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

const processed = decodeEntities(transcript)
    // Strip HTML tags: <span style="...">Some text</span> → Some text
    .replace(/<[^>]+>/g, '')
    // Strip dates from timestamps: "(2025-02-11 8:47am)" → "(8:47am)"
    .replace(/\(\d{4}-\d{2}-\d{2}\s(\d+:\d+[ap]m)\)/g, '($1)')
    // Replace "I (" with "Live Chat (" at the start of lines
    .replace(/^I (\()/gm, 'Live Chat $1')
    // Replace "Bot (" with "Live Chat (" at the start of lines
    .replace(/^Bot (\()/gm, 'Live Chat $1')
    // Replace "User (" with the customer's first name
    .replace(/^User (\()/gm, (firstName || 'User') + ' $1');

return { processedText: processed };
