# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of standalone JavaScript scripts designed for use in Zapier Code Steps. Each script is a self-contained file that reads from `inputData` (provided by Zapier) and writes to `output`.

## Repository Structure

All scripts live in `scripts/`, organized into subfolders by scope:

- `scripts/combined/` — full pipelines wired directly into a production Zap step (e.g. `format-middleware-lead.js`, which formats a lead for the middleware/CRM webhook regardless of source)
- `scripts/generic/` — cross-domain building blocks usable regardless of lead source (e.g. email typo fixing, state abbreviation)
- `scripts/facebook/` — building blocks specific to Facebook Lead Ads
- `scripts/livechat/` — building blocks specific to LiveChat

When adding a new script, place it in the folder matching its scope. If it doesn't fit an existing folder, create a new one named for that scope (e.g. `scripts/google-sheets/`).

## Zapier Code Step Conventions

- **Input**: Scripts receive data via the global `inputData` object (e.g., `inputData.email`, `inputData.fullName`)
- **Output**: Scripts must assign results to the global `output` variable as a plain object
- **Environment**: Zapier Code Steps run vanilla JavaScript (no Node.js modules, no imports/exports)
- **No dependencies**: Each script must be fully self-contained — all helpers defined inline

## No Build/Test/Lint

There is no build system, test runner, or linter configured. Scripts are manually copy-pasted into Zapier Code Steps.
