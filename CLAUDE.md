# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

E-commerce data utilities project providing query functions for a SQLite database. Uses TypeScript with the `sqlite` wrapper (Promise-based) over `sqlite3`.

## Development Commands

```bash
# Install dependencies and initialize
npm run setup

# Run the main entry point
npx tsx src/main.ts

# Run the Claude Agent SDK script
npm run sdk
```

## Architecture

- `src/main.ts` - Entry point: opens SQLite DB and creates schema
- `src/schema.ts` - All table DDL (customers, products, orders, inventory, promotions, reviews, etc.)
- `src/queries/` - Query modules organized by domain (customer, product, order, analytics, inventory, promotion, review, shipping)

The project uses the `sqlite` npm package which wraps `sqlite3` with async/await support. The `Database` type from `sqlite` is passed to all query functions.

## Working with Queries

Query functions take a `Database` instance as first parameter and return Promises directly via `db.get()` (single row) or `db.all()` (multiple rows). Use parameterized queries (`?` placeholders) for all user inputs.

```typescript
import { Database } from "sqlite";

export async function getCustomerByEmail(
  db: Database,
  email: string,
): Promise<any> {
  return db.get(`SELECT * FROM customers WHERE email = ?`, [email]);
}
```

## Critical Guidance

- All database queries must be written in `./src/queries/`

## Hook System Learnings

### Exit Codes

- exit(0) = Allow the tool to proceed
- exit(2) = Block the tool with error message
- stdout messages shown to Claude on block

### Hook Input (stdin)

- JSON with tool_input containing tool parameters
- tool_input.file_path for Read tool
- tool_input.content for Write tool

### Settings.json Structure

- PreToolUse: runs BEFORE tool execution
- PostToolUse: runs AFTER tool execution
- matcher: regex pattern for tool names

### Debugging Tips

- Use: `jq . > debug.json` to inspect stdin
- Check: `node hooks/my_hook.js < test.json`
