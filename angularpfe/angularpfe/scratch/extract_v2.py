import json
import os

log_path = r'C:\Users\ichra\.gemini\antigravity\brain\af8fda33-e316-46dd-9ee9-a9a8be631dcf\.system_generated\logs\overview.txt'
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if '"step_index":1317' in line:
            step = json.loads(line)
            chunks = json.loads(step['tool_calls'][0]['args']['ReplacementChunks'])
            print(chunks[0]['TargetContent'])
            break
