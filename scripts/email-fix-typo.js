/**
 * Zapier Code Step: Fix common email typos and filter out invalid addresses.
 *
 * Corrects ".con" → ".com" typos, then validates the email structure. Returns
 * null for obviously invalid inputs (e.g., "Not Provided", "n/a", missing @ symbol).
 *
 * Input:
 * - inputData.email: The raw email address string
 *
 * Output:
 * - correctedEmail: The fixed email string, or null if the input is invalid
 */

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
    
    if (invalidPatterns.some(pattern => normalizedEmail.includes(pattern))) return true;
    
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
    let correctedEmail = email.replace(/\.con/g, '.com');
    
    return {
        original: email,
        corrected: correctedEmail,
        wasChanged: email !== correctedEmail
    };
}

// Use the email from inputData
const email = inputData.email;
const result = fixEmailTypo(email);

if (result === null) {
    console.log('Invalid email address provided, returning null');
    output = { correctedEmail: null };
} else if (result.wasChanged) {
    console.log(`Email corrected from "${result.original}" to "${result.corrected}"`);
    output = { correctedEmail: result.corrected };
} else {
    console.log('No correction needed');
    output = { correctedEmail: result.corrected };
}