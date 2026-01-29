FEATURE STAGES
1
Security Hook
Required
~15 min
Complete the read_hook.js to block .env file access.

Requirements
✓
Find TODO in
hooks/read_hook.js
✓
Block Read tool when path contains
.env
✓
Return exit code 2 to block, 0 to allow
✓
Print message: "Blocked: Cannot read .env"
Expected Behavior
1. Claude tries to read any file

2. Hook checks if path contains ".env"

3. If .env: exit(2) + error message

4. Otherwise: exit(0) to allow

Implementation Guide
File to modify: hooks/read_hook.js
Stdin JSON structure:
{
  "tool_input": {
    "file_path": "/path/to/file.txt"  // Check this for ".env"
  }
}
Key implementation code:
// Read JSON from stdin
const input = await new Promise((resolve) => {
  let data = ""
  process.stdin.on("data", (chunk) => (data += chunk))
  process.stdin.on("end", () => resolve(JSON.parse(data)))
})

const filePath = input.tool_input?.file_path || ""

// Check if trying to read .env file
if (filePath.includes(".env")) {
  console.error("Blocked: Cannot read .env file")
  process.exit(2)  // Block the operation
}

process.exit(0)  // Allow the operation
Reference: Check hooks/tsc.js for complete hook structure example
2
Query Duplicate Detection
Required
~25 min
Activate the disabled query_hook.js to prevent duplicate queries.

Requirements
✓
Find disabled code in
hooks/query_hook.js
✓
Remove the early
process.exit(0)
✓
Understand Claude Agent SDK usage
✓
Verify hook is registered in settings.json
Expected Behavior
1. Claude writes to src/queries/

2. Hook analyzes for duplicate queries

3. Uses Claude SDK to check existing code

4. Blocks if duplicate found (exit 2)

Implementation Guide
File to modify: hooks/query_hook.js
Problem - Find and remove this line (around line 9):
async function main() {
  process.exit(0)  // <-- DELETE THIS LINE to enable the hook
  // Read JSON input from stdin
  const input = await new Promise((resolve) => { ... })
Claude Agent SDK usage in the file:
import { query } from "@anthropic-ai/claude-agent-sdk"

// The hook calls Claude to analyze code for duplicates
for await (const message of query({ prompt })) {
  messages.push(message)
}

// If duplicate found, block with exit(2)
if (!resultMessage.result.includes("Changes look appropriate")) {
  console.error(`Query duplication detected:\n\n${resultMessage.result}`)
  process.exit(2)  // Block
}
Verify settings.json registration:
"PreToolUse": [
  {
    "matcher": "Write|Edit|MultiEdit",
    "hooks": [{
      "type": "command",
      "command": "node $PWD/hooks/query_hook.js",
      "timeout": 300
    }]
  }
]
3
Custom PostToolUse Hook
Bonus
~20 min
Create your own PostToolUse hook for automation.

Requirements
✓
Create new hook file (e.g.,
log_hook.js
)
✓
Trigger after Write/Edit operations
✓
Choose one: log changes / add comments / stats
✓
Register in settings.json PostToolUse
Hook Ideas
A. Log all file changes to changes.log

B. Add timestamp comment to modified files

C. Print file statistics after each edit

D. Notify when specific files are changed

Implementation Guide
Create new file: hooks/log_hook.js
PostToolUse stdin structure (tool_response available):
{
  "tool_input": { "file_path": "/path/to/file.js", "content": "..." },
  "tool_response": { "filePath": "/path/to/file.js", "success": true }
}
Example hook template (log changes):
import fs from "fs"

async function main() {
  const input = await new Promise((resolve) => {
    let data = ""
    process.stdin.on("data", (chunk) => (data += chunk))
    process.stdin.on("end", () => resolve(JSON.parse(data)))
  })

  const filePath = input.tool_response?.filePath ||
                   input.tool_input?.file_path || "unknown"
  const timestamp = new Date().toISOString()

  // Log the change
  const logEntry = `[${timestamp}] Modified: ${filePath}\n`
  fs.appendFileSync("changes.log", logEntry)

  console.log(`Logged change to ${filePath}`)
  process.exit(0)  // PostToolUse typically exits 0
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
Register in settings.json:
"PostToolUse": [
  {
    "matcher": "Write|Edit|MultiEdit",
    "hooks": [{
      "type": "command",
      "command": "node $PWD/hooks/log_hook.js"
    }]
  }
]
CLAUDE.MD EXPECTATIONS
Your CLAUDE.md should document Hook system learnings. Good examples:

Example CLAUDE.md Entries
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
- Use: jq . > debug.json to inspect stdin
- Check: node hooks/my_hook.js < test.json
SCORING RUBRIC
Category	Points
Stage 1: Security Hook
.env blocking (15) + Error message (5) + Memory (5)
25
Stage 2: Query Hook Activation
Activation (10) + Working (15) + Settings (5) + Memory (5)
35
Stage 3: Custom Hook (Bonus)
Hook creation (10) + Working (10) + Memory (5)
25
CLAUDE.md Quality
Hook concepts, exit codes, debugging tips documented
15
Time Rank Bonus
1st: +20, 2nd: +17, 3rd: +14, 4th: +11, 5th: +8, 6th+: +5
+20
Total	100 +20
