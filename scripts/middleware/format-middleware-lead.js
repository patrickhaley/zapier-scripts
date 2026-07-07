/**
 * Zapier Code Step: Format a lead record for the middleware, which forwards
 * it to the CRM. This is the general-purpose lead formatter - use it
 * regardless of which source triggered the Zap (website chat, Facebook Lead
 * Ads, a Google Sheet, etc). Only map the Input Data variables that source
 * actually provides; leave the rest unmapped and they're safely ignored.
 *
 * Steps performed:
 * 1. Resolve the name:
 *    - If fullName is mapped (e.g. Facebook Lead Ads gives one combined
 *      name field), split it into firstName/lastName: the last word
 *      becomes lastName, everything before it becomes firstName.
 *      Single-word names get lastName = "-".
 *    - Otherwise, use the firstName/lastName inputs directly (e.g. a
 *      source that already gives separate fields).
 *    Either way the result is title-cased.
 * 2. Fix common email typos (".con" -> ".com"), lowercase, and validate.
 *    Returns null for obviously invalid addresses (e.g. "Not Provided").
 * 3. Convert a state name/abbreviation/nickname to its official
 *    abbreviation (US states/territories and Australian states/territories).
 * 4. Title case city.
 * 5. If transcript is mapped (e.g. a LiveChat lead), clean it up (strip
 *    HTML, fix timestamps, label speakers), using the resolved, title-cased
 *    firstName as the customer's speaker label. Leaves processedText null
 *    if no transcript was given.
 *
 * Zapier setup - standardized Input Data variables (name on the left must
 * match exactly). Map only the ones your trigger has; leave the rest blank:
 * - email:      the lead's email
 * - state:      the lead's state
 * - city:       the lead's city
 * - fullName:   a single combined name field (e.g. Facebook Lead Ads)
 * - firstName:  a separate first name field (e.g. a LiveChat/Sheet lead)
 * - lastName:   a separate last name field (e.g. a LiveChat/Sheet lead)
 * - transcript: a chat transcript, if this lead source has one
 *
 * Output (always all six keys, regardless of lead source):
 * - cleanedEmail: The lowercased, fixed email string, or null if invalid
 * - cleanedState: The official uppercase abbreviation, or "" if not found
 * - cleanedFirstName: Title-cased first name (parsed from fullName if that's what was given)
 * - cleanedLastName: Title-cased last name (parsed from fullName if that's what was given; "-" for single-word names)
 * - cleanedCity: Title-cased city
 * - cleanedTranscript: The cleaned transcript, or null if no transcript was given
 */

// --- Step 1: Name resolution ---

function toTitleCase(str) {
    if (!str) {
        return "";
    }
    return str.trim().toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Splits a combined name the same way parse-name.js does: last word is the
// last name, everything before it is the first name. Returns null if there's
// no full name to parse, so the caller can fall back to firstName/lastName.
function parseFullName(fullName) {
    if (!fullName) {
        return null;
    }

    const words = fullName.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) {
        return null;
    }

    if (words.length === 1) {
        return { firstName: toTitleCase(words[0]), lastName: "-" };
    }

    const lastNameWord = words[words.length - 1];
    const firstNameWords = words.slice(0, -1);

    return {
        firstName: firstNameWords.map(word => toTitleCase(word)).join(' '),
        lastName: toTitleCase(lastNameWord)
    };
}

// --- Step 2: Email typo fix ---

function isObviouslyInvalidEmail(email) {
    if (!email || typeof email !== 'string') return true;

    const normalizedEmail = email.trim().toLowerCase();

    // Check for empty or whitespace-only strings
    if (normalizedEmail === '') return true;

    // Basic structure validation - must contain exactly one @ symbol
    const atCount = (normalizedEmail.match(/@/g) || []).length;
    if (atCount !== 1) return true;

    // Split into local and domain parts
    const [localPart, domainPart] = normalizedEmail.split('@');

    // Local part validation
    if (!localPart || localPart.length === 0 || localPart.length > 64) return true;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return true;
    if (localPart.includes('..')) return true; // consecutive dots not allowed

    // Domain part validation
    if (!domainPart || domainPart.length === 0 || domainPart.length > 253) return true;
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return true;
    if (domainPart.startsWith('-') || domainPart.endsWith('-')) return true;
    if (domainPart.includes('..')) return true; // consecutive dots not allowed

    // Must contain at least one dot in domain (for TLD)
    if (!domainPart.includes('.')) return true;

    // Split domain into parts
    const domainParts = domainPart.split('.');

    // Each domain part must be valid
    for (const part of domainParts) {
        if (!part || part.length === 0 || part.length > 63) return true;
        if (part.startsWith('-') || part.endsWith('-')) return true;
        // Must contain at least one letter or number
        if (!/[a-z0-9]/.test(part)) return true;
        // Only allow letters, numbers, and hyphens
        if (!/^[a-z0-9-]+$/.test(part)) return true;
    }

    // TLD (last part) must be at least 2 characters and contain only letters
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || !/^[a-z]+$/.test(tld)) return true;

    // Additional checks for obviously invalid patterns
    const invalidPatterns = [
        'not provided',
        'notprovided',
        'not_provided',
        'none',
        'n/a',
        'na',
        'null',
        'undefined',
        'no email',
        'noemail',
        'no_email',
        'test@test',
        'example@example',
        'email not provided',
        'no valid email',
        'invalid',
        'tbd',
        'to be determined'
    ];

    // Match as whole words/phrases, not substrings, so patterns like "na" don't
    // false-positive on real local parts that happen to contain those letters
    // (e.g. "bernardmolloy" contains "na").
    const invalidPatternRegex = new RegExp('\\b(?:' + invalidPatterns.join('|') + ')\\b');
    if (invalidPatternRegex.test(normalizedEmail)) return true;

    // Check for valid characters in local part (basic set)
    const localPartRegex = /^[a-z0-9._-]+$/;
    if (!localPartRegex.test(localPart)) return true;

    return false;
}

function fixEmailTypo(email) {
    if (isObviouslyInvalidEmail(email)) {
        return null;
    }

    // Use a regular expression to replace all occurrences of '.con' with '.com'
    let correctedEmail = email.replace(/\.con/g, '.com').toLowerCase();

    return {
        original: email,
        corrected: correctedEmail,
        wasChanged: email !== correctedEmail
    };
}

// --- Step 3: State abbreviation lookup ---

const stateMap = {
  // US States & Territories (Add more variations as needed)
  'alabama': 'AL', 'al': 'AL',
  'alaska': 'AK', 'ak': 'AK',
  'arizona': 'AZ', 'az': 'AZ',
  'arkansas': 'AR', 'ar': 'AR',
  'california': 'CA', 'cali': 'CA', 'ca': 'CA',
  'colorado': 'CO', 'co': 'CO',
  'connecticut': 'CT', 'conn': 'CT', 'ct': 'CT',
  'delaware': 'DE', 'de': 'DE',
  'florida': 'FL', 'fla': 'FL', 'fl': 'FL',
  'georgia': 'GA', 'ga': 'GA',
  'hawaii': 'HI', 'hi': 'HI',
  'idaho': 'ID', 'id': 'ID',
  'illinois': 'IL', 'ill': 'IL', 'il': 'IL',
  'indiana': 'IN', 'ind': 'IN', 'in': 'IN',
  'iowa': 'IA', 'ia': 'IA',
  'kansas': 'KS', 'kan': 'KS', 'ks': 'KS',
  'kentucky': 'KY', 'ky': 'KY',
  'louisiana': 'LA', 'la': 'LA',
  'maine': 'ME', 'me': 'ME',
  'maryland': 'MD', 'md': 'MD',
  'massachusetts': 'MA', 'mass': 'MA', 'ma': 'MA',
  'michigan': 'MI', 'mich': 'MI', 'mi': 'MI',
  'minnesota': 'MN', 'minn': 'MN', 'mn': 'MN',
  'mississippi': 'MS', 'miss': 'MS', 'ms': 'MS',
  'missouri': 'MO', 'mo': 'MO',
  'montana': 'MT', 'mont': 'MT', 'mt': 'MT',
  'nebraska': 'NE', 'neb': 'NE', 'ne': 'NE',
  'nevada': 'NV', 'nev': 'NV', 'nv': 'NV',
  'new hampshire': 'NH', 'nh': 'NH',
  'new jersey': 'NJ', 'nj': 'NJ',
  'new mexico': 'NM', 'nm': 'NM',
  'new york': 'NY', 'ny': 'NY',
  'north carolina': 'NC', 'nc': 'NC',
  'north dakota': 'ND', 'nd': 'ND',
  'ohio': 'OH', 'oh': 'OH',
  'oklahoma': 'OK', 'okla': 'OK', 'ok': 'OK',
  'oregon': 'OR', 'ore': 'OR', 'or': 'OR',
  'pennsylvania': 'PA', 'penn': 'PA', 'pa': 'PA',
  'rhode island': 'RI', 'ri': 'RI',
  'south carolina': 'SC', 'sc': 'SC',
  'south dakota': 'SD', 'sd': 'SD',
  'tennessee': 'TN', 'tenn': 'TN', 'tn': 'TN',
  'texas': 'TX', 'tex': 'TX', 'tx': 'TX',
  'utah': 'UT', 'ut': 'UT',
  'vermont': 'VT', 'vt': 'VT',
  'virginia': 'VA', 'va': 'VA',
  'washington': 'WA', 'wash': 'WA', // Note: WA is also Western Australia
  'west virginia': 'WV', 'wv': 'WV',
  'wisconsin': 'WI', 'wis': 'WI', 'wi': 'WI',
  'wyoming': 'WY', 'wyo': 'WY', 'wy': 'WY',
  // US Territories
  'american samoa': 'AS', 'as': 'AS',
  'district of columbia': 'DC', 'dc': 'DC',
  'guam': 'GU', 'gu': 'GU',
  'northern mariana islands': 'MP', 'mp': 'MP',
  'puerto rico': 'PR', 'pr': 'PR',
  'virgin islands': 'VI', 'vi': 'VI',

  // Australian States & Territories
  'australian capital territory': 'ACT', 'act': 'ACT',
  'new south wales': 'NSW', 'nsw': 'NSW',
  'northern territory': 'NT', 'nt': 'NT',
  'queensland': 'QLD', 'qld': 'QLD',
  'south australia': 'SA', 'sa': 'SA',
  'tasmania': 'TAS', 'tas': 'TAS',
  'victoria': 'VIC', 'vic': 'VIC',
  'western australia': 'WA', 'wa': 'WA' // Note: WA is also Washington state
};

function abbreviateState(stateRaw) {
    let stateAbbreviation = "";

    if (stateRaw) {
        const cleanedInput = stateRaw
            .trim()
            .replace(/[^a-zA-Z\s]/g, '') // Keep only letters and spaces
            .replace(/\s+/g, ' ')        // Collapse multiple spaces to single spaces
            .trim()
            .toLowerCase();

        if (cleanedInput.length > 0 && stateMap.hasOwnProperty(cleanedInput)) {
            stateAbbreviation = stateMap[cleanedInput];
        }
    }

    return stateAbbreviation;
}

// --- Step 4: Transcript cleanup ---

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

// customerFirstName should be the resolved, title-cased name from step 1, so
// the speaker label in the transcript matches the name sent to the CRM.
function cleanTranscript(transcript, customerFirstName) {
    if (!transcript) {
        return null;
    }

    let processed = decodeEntities(transcript)
        // Strip HTML tags
        .replace(/<[^>]+>/g, '')
        // Convert literal \n to real newlines
        .replace(/\\n/g, '\n')
        // Strip dates from timestamps: "(2025-02-11 8:47am)" -> "(8:47am)"
        // (month/day may be 1 or 2 digits, e.g. "2026-07-6")
        .replace(/\(\d{4}-\d{1,2}-\d{1,2}\s(\d+:\d+[ap]m)\)/g, '($1)');

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

    // Replace each detected agent name with "Chat Agent"
    for (const name of agentNames) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        processed = processed.replace(new RegExp('^' + escaped + '(\\s*[:(])', 'gm'), 'Chat Agent$1');
    }

    // Replace customer labels with first name (falls back to "User" if missing)
    const customerLabel = customerFirstName || 'User';
    processed = processed
        .replace(/^User(\s*[:(])/gm, customerLabel + '$1')
        .replace(/^Visitor(\s*[:(])/gm, customerLabel + '$1');

    // If the first non-empty line has no speaker prefix, it's the automated
    // welcome message - label it as Chat Agent. Speaker labels can be
    // multi-word (e.g. "Chat Agent", a multi-word customer first name), so
    // check generically for "some label text, then : or (" rather than
    // assuming a single word.
    const lines = processed.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().length > 0) {
            if (!/^[^\n:(]{1,40}[:(]/.test(lines[i])) {
                lines[i] = 'Chat Agent: ' + lines[i];
            }
            break;
        }
    }
    processed = lines.join('\n');

    // Add a blank line between each message for readability
    return processed.replace(/\n+/g, '\n\n').trim();
}

// --- Main Logic ---

const parsedName = parseFullName(inputData.fullName);
const firstName = parsedName ? parsedName.firstName : toTitleCase(inputData.firstName);
const lastName = parsedName ? parsedName.lastName : toTitleCase(inputData.lastName);

const emailResult = fixEmailTypo(inputData.email);

output = {
    cleanedEmail: emailResult === null ? null : emailResult.corrected,
    cleanedState: abbreviateState(inputData.state),
    cleanedFirstName: firstName,
    cleanedLastName: lastName,
    cleanedCity: toTitleCase(inputData.city),
    cleanedTranscript: cleanTranscript(inputData.transcript, firstName)
};
