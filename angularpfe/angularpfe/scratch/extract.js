const fs = require('fs');
const logPath = 'C:\\Users\\ichra\\.gemini\\antigravity\\brain\\af8fda33-e316-46dd-9ee9-a9a8be631dcf\\.system_generated\\logs\\overview.txt';
const log = fs.readFileSync(logPath, 'utf8');
const lines = log.split('\n');
for (const line of lines) {
    if (line.includes('"step_index":1317')) {
        const step = JSON.parse(line);
        const chunks = JSON.parse(step.tool_calls[0].args.ReplacementChunks);
        console.log(chunks[0].TargetContent);
        process.exit(0);
    }
}
console.log('Not found');
