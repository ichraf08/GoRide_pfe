import json
import sys

with open(r'C:\Users\ichra\.gemini\antigravity\brain\af8fda33-e316-46dd-9ee9-a9a8be631dcf\.system_generated\logs\overview.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    # Step 1317 is at line 467 (1-indexed)
    step = json.loads(lines[466])
    target_content = step['tool_calls'][0]['args']['ReplacementChunks']
    # This is actually the ReplacementContent, but I want the PREVIOUS content.
    # The previous content should be in the TargetContent of the ReplacementChunk.
    chunks = json.loads(target_content)
    print(chunks[0]['TargetContent'])
