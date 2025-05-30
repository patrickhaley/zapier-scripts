// --- Helper Function for Title Casing ---
// Handles single words and multi-word strings correctly.
function toTitleCase(str) {
    if (!str) {
      return ""; // Return empty if input is null, undefined, or empty
    }
    // Convert the whole string to lowercase first, then capitalize the first letter of each word.
    return str.toLowerCase()
              .split(' ') // Split into words
              .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
              .join(' '); // Join back with single spaces
  }
  
  // --- Main Logic ---
  
  // 1. Get the Full Name from the input data provided by Zapier
  const fullNameInput = inputData.fullName;
  
  let firstName = "";
  let lastName = "";
  
  // 2. Handle null/undefined input gracefully
  if (fullNameInput) {
    // 3. Trim leading/trailing whitespace
    const trimmedName = fullNameInput.trim();
  
    // 4. Handle empty string after trimming
    if (trimmedName.length === 0) {
      // Leave firstName and lastName as ""
    } else {
      // 5. Split the name into words, filtering out empty strings from multiple spaces
      const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
  
      // 6. Apply the parsing rules
      if (words.length === 1) {
        // Single-word name: Title Case word is First Name, Last Name is "-"
        firstName = toTitleCase(words[0]);
        lastName = "-";
      } else if (words.length > 1) {
        // Multi-word name: Last word is Last Name (Title Cased)
        // All preceding words joined are First Name (Title Cased)
        const lastNameWord = words[words.length - 1];
        const firstNameWords = words.slice(0, -1);
  
        lastName = toTitleCase(lastNameWord);
        // Title case each word in the first name part *before* joining
        firstName = firstNameWords.map(word => toTitleCase(word)).join(' ');
      }
      // Note: If words array was somehow empty after filtering (e.g., input was just " "),
      // it falls through, leaving firstName and lastName as "", which is correct.
    }
  }
  
  // 7. Return the results as an object.
  output = {
    firstName: firstName,
    lastName: lastName
  };
  