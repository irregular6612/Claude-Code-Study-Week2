import fs from "fs";
import path from "path";

const LOG_FILE = path.resolve(process.cwd(), "changes.log");

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const hookData = JSON.parse(Buffer.concat(chunks).toString());

  const toolName = hookData.tool_name || "unknown";
  const toolInput = hookData.tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || "unknown";

  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${toolName} -> ${filePath}\n`;

  fs.appendFileSync(LOG_FILE, logEntry);
  process.exit(0);
}

main().catch((err) => {
  console.error(`log_hook error: ${err.message}`);
  process.exit(0);
});
