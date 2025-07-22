// --- State Abbreviation Lookup Map ---

// Keys are lowercase, cleaned versions of possible inputs (full names, common variations, abbreviations)
// Values are the official UPPERCASE abbreviations.

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

// --- Main Logic ---

// 1. Get the State input from Zapier
const stateInputRaw = inputData.stateInput;
let stateAbbreviation = ""; // Default to empty string (represents null/no match)

// 2. Handle null/undefined/empty input
if (stateInputRaw) {
  // 3. Pre-process the input:
  //    - Trim whitespace
  //    - Remove non-alphabetic characters (except spaces)
  //    - Collapse multiple spaces
  //    - Convert to lowercase
  const cleanedInput = stateInputRaw
    .trim()
    .replace(/[^a-zA-Z\s]/g, '') // Keep only letters and spaces
    .replace(/\s+/g, ' ')        // Collapse multiple spaces to single spaces
    .trim()                      // Trim again in case of leading/trailing spaces after cleaning
    .toLowerCase();

  // 4. Check if cleaned input is not empty and lookup in the map
  if (cleanedInput.length > 0 && stateMap.hasOwnProperty(cleanedInput)) {
      stateAbbreviation = stateMap[cleanedInput];
  }
  // If input is empty after cleaning, or not found in map, stateAbbreviation remains ""
}

// 5. Return the result
output = {
  stateAbbreviation: stateAbbreviation
};
