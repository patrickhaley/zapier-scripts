// This Zapier Code step corrects email addresses by replacing '.con' with '.com'.
// It takes an email from inputData.email, performs the correction if needed,
// and outputs the result as correctedEmail for use in subsequent steps.

function fixEmailTypo(email) {
    if (typeof email !== 'string') {
        throw new Error('Input must be a string');
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

if (!email) {
    throw new Error('No email provided in inputData');
}

const result = fixEmailTypo(email);

if (result.wasChanged) {
    console.log(`Email corrected from "${result.original}" to "${result.corrected}"`);
} else {
    console.log('No correction needed');
}

// Set the output for use in subsequent Zapier steps
output = { correctedEmail: result.corrected };