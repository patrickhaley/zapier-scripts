# Zapier Scripts Collection

A collection of standalone JavaScript scripts for use in Zapier Code Steps. Each script reads from `inputData` and writes to `output`.

## Repository Structure

```
scripts/         # All Zapier Code Step scripts (named: domain-action.js)
  email-fix-typo.js
  livechat-sanitize.js
  name-parse.js
  state-abbreviate.js
  transcript-clean.js
```

## Usage

Copy and paste any script from `scripts/` into a Zapier Code Step. Each script is self-contained with no external dependencies.

## Scripts

| Script | Input | Output | Description |
|--------|-------|--------|-------------|
| `email-fix-typo.js` | `inputData.email` | `correctedEmail` | Fixes `.con` → `.com` typos; returns `null` for invalid inputs like "Not Provided" |
| `livechat-sanitize.js` | `inputData.transcript`, `inputData.description` | `sanitizedTranscript`, `sanitizedDescription` | Strips HTML tags and decodes entities from livechat transcript and description |
| `name-parse.js` | `inputData.fullName` | `firstName`, `lastName` | Splits full name with title casing; single-word names get `"-"` as last name |
| `state-abbreviate.js` | `inputData.stateInput` | `stateAbbreviation` | Converts US/Australian state names to official abbreviations |
| `transcript-clean.js` | `inputData.transcript`, `inputData.firstName` | `processedText` | Sanitizes livechat transcripts: strips HTML, removes dates from timestamps, labels speakers |
