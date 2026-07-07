# Zapier Scripts Collection

A collection of standalone JavaScript scripts for use in Zapier Code Steps. Each script reads from `inputData` and writes to `output`.

## Repository Structure

```
scripts/
  combined/            # Full pipelines wired directly into a production Zap step
    format-middleware-lead.js
  generic/             # Cross-domain building blocks, usable regardless of lead source
    fix-email-typos.js
    abbreviate-state.js
  facebook/            # Facebook Lead Ads specific building blocks
    parse-name.js
  livechat/            # LiveChat specific building blocks
    sanitize-fields.js
    format-transcript.js
```

## Usage

Copy and paste any script from `scripts/` into a Zapier Code Step. Each script is self-contained with no external dependencies.

## Scripts

### combined/

| Script | Input | Output | Description |
|--------|-------|--------|-------------|
| `format-middleware-lead.js` | `inputData.email`, `inputData.state`, `inputData.city`, `inputData.fullName` *or* `inputData.firstName`/`inputData.lastName`, `inputData.transcript` (optional) | `cleanedEmail`, `cleanedState`, `cleanedFirstName`, `cleanedLastName`, `cleanedCity`, `cleanedTranscript` | General-purpose lead formatter for the middleware/CRM webhook: email typo fix, state abbreviation, name resolution (combined or split), city title casing, and transcript cleanup if a transcript is present. Map only the inputs your lead source provides. |

### generic/

| Script | Input | Output | Description |
|--------|-------|--------|-------------|
| `fix-email-typos.js` | `inputData.email` | `correctedEmail` | Fixes `.con` → `.com` typos; returns `null` for invalid inputs like "Not Provided" |
| `abbreviate-state.js` | `inputData.stateInput` | `stateAbbreviation` | Converts US/Australian state names to official abbreviations |

### facebook/

| Script | Input | Output | Description |
|--------|-------|--------|-------------|
| `parse-name.js` | `inputData.fullName` | `firstName`, `lastName` | Splits full name with title casing; single-word names get `"-"` as last name |

### livechat/

| Script | Input | Output | Description |
|--------|-------|--------|-------------|
| `sanitize-fields.js` | `inputData.transcript`, `inputData.description` | `sanitizedTranscript`, `sanitizedDescription` | Strips HTML tags and decodes entities from the transcript and description fields; no reformatting |
| `format-transcript.js` | `inputData.transcript`, `inputData.firstName` | `processedText` | Full transcript reformat: strips HTML, removes dates from timestamps, labels speakers |
