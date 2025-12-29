import json
import sys

# Try to find group-header-actions in all figma JSON files
figma_files = [
    'd:\\storyverse\\figma-design.json',
    'd:\\storyverse\\dashboard_figma.json',
    'd:\\storyverse\\figma_full.json',
]

for filepath in figma_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert to string and search
        json_str = json.dumps(data, indent=2)
        
        if 'group-header-actions' in json_str or 'header-actions' in json_str:
            print(f"Found in: {filepath}")
            
            # Extract the specific node
            if 'nodes' in data:
                for node_id, node_data in data['nodes'].items():
                    json_node = json.dumps(node_data, indent=2)
                    if 'group-header-actions' in json_node or 'header' in json_node and 'action' in json_node:
                        print(json.dumps(node_data, indent=2)[:2000])
                        break
            break
        else:
            print(f"Not found in: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

# If not found, create a default header actions component
print("\n\nNo exact match found. Creating standard header actions component...")
