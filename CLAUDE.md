# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of standalone JavaScript scripts designed for use in Zapier Code Steps. Each script is a self-contained file that reads from `inputData` (provided by Zapier) and writes to `output`.

## Repository Structure

All scripts live in `scripts/`. New scripts should be added there.

## Zapier Code Step Conventions

- **Input**: Scripts receive data via the global `inputData` object (e.g., `inputData.email`, `inputData.fullName`)
- **Output**: Scripts must assign results to the global `output` variable as a plain object
- **Environment**: Zapier Code Steps run vanilla JavaScript (no Node.js modules, no imports/exports)
- **No dependencies**: Each script must be fully self-contained — all helpers defined inline

## No Build/Test/Lint

There is no build system, test runner, or linter configured. Scripts are manually copy-pasted into Zapier Code Steps.
