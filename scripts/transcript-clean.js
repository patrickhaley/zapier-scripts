/**
 * Zapier Code Step: Clean up livechat transcript formatting.
 *
 * - Decodes HTML entities and strips HTML tags (sanitizes user-generated content)
 * - Converts literal \n sequences to real line breaks
 * - Strips dates from timestamps, keeping only the time
 * - Auto-detects the agent name and replaces it with "Live Chat"
 * - Replaces "User" / "Visitor" prefix with the customer's first name
 *
 * Handles two transcript formats:
 * - Timestamped: "I (2025-02-11 8:47am): Hello!"  → "Live Chat (8:47am): Hello!"
 * - Plain:       "Denver: Hello!"                  → "Live Chat: Hello!"
 *
 * Agent detection works by scanning for speaker labels at line starts.
 * Any speaker that isn't "User" or "Visitor" is treated as the agent.
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

let processed = decodeEntities(transcript)
    // Strip HTML tags
    .replace(/<[^>]+>/g, '')
    // Convert literal \n to real newlines
    .replace(/\\n/g, '\n')
    // Strip dates from timestamps: "(2025-02-11 8:47am)" → "(8:47am)"
    .replace(/\(\d{4}-\d{2}-\d{2}\s(\d+:\d+[ap]m)\)/g, '($1)');

// Auto-detect agent name(s): any speaker that isn't "User" or "Visitor".
// Matches "Name:" or "Name (" at the start of a line.
const customerNames = new Set(['user', 'visitor']);
const agentNames = new Set();

for (const line of processed.split('\n')) {
    const match = line.match(/^([A-Z][a-zA-Z]*)\s*[:(]/);
    if (match && !customerNames.has(match[1].toLowerCase())) {
        agentNames.add(match[1]);
    }
}

// Replace each detected agent name with "Live Chat"
for (const name of agentNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    processed = processed.replace(new RegExp('^' + escaped + '(\\s*[:(])', 'gm'), 'Live Chat$1');
}

// Replace customer labels with first name (falls back to "User" if missing)
const customerLabel = firstName || 'User';
processed = processed
    .replace(/^User(\s*[:(])/gm, customerLabel + '$1')
    .replace(/^Visitor(\s*[:(])/gm, customerLabel + '$1');

// Add a blank line between each message for readability
processed = processed.replace(/\n+/g, '\n\n').trim();

return { processedText: processed };
