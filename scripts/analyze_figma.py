#!/usr/bin/env python3
import http.client
import json
import sys
from typing import Any, Dict, List, Optional

FIGMA_TOKEN = 'figd_GNfKFlaNn0tdgoORdkGvi01Z7ZqWUyvGanzcWpsQ'
FILE_ID = 'zuWEY4gNbhwescluD1WZAC'
NODE_ID = '5:51'

def fetch_figma_file() -> Dict[str, Any]:
    """Fetch the Figma file from the API."""
    print("🔍 Fetching Figma file from API...")
    
    conn = http.client.HTTPSConnection('api.figma.com')
    headers = {
        'X-FIGMA-TOKEN': FIGMA_TOKEN,
        'User-Agent': 'Python/FigmaAnalyzer'
    }
    
    try:
        conn.request('GET', f'/v1/files/{FILE_ID}', headers=headers)
        response = conn.getresponse()
        data = response.read().decode('utf-8')
        
        if response.status != 200:
            print(f"❌ Error: HTTP {response.status}")
            print(data[:500])
            sys.exit(1)
            
        return json.loads(data)
    finally:
        conn.close()

def find_node_by_id(node: Dict[str, Any], node_id: str) -> Optional[Dict[str, Any]]:
    """Recursively find a node by its ID."""
    if node.get('id') == node_id:
        return node
    
    if 'children' in node:
        for child in node['children']:
            result = find_node_by_id(child, node_id)
            if result:
                return result
    
    return None

def hex_color(paint: Dict[str, Any]) -> Optional[str]:
    """Convert Figma color to hex."""
    if not paint or 'color' not in paint:
        return None
    
    color = paint['color']
    r = int(round(color.get('r', 0) * 255))
    g = int(round(color.get('g', 0) * 255))
    b = int(round(color.get('b', 0) * 255))
    a = color.get('a', 1)
    
    hex_val = f'#{r:02x}{g:02x}{b:02x}'
    if a < 1:
        hex_val += f'{int(round(a * 255)):02x}'
    
    return hex_val

def analyze_node(node: Dict[str, Any], depth: int = 0) -> Dict[str, Any]:
    """Analyze a node and extract all relevant design information."""
    analysis: Dict[str, Any] = {
        'id': node.get('id'),
        'name': node.get('name'),
        'type': node.get('type'),
    }
    
    # Dimensions
    if 'width' in node and 'height' in node:
        analysis['dimensions'] = {
            'x': node.get('x', 0),
            'y': node.get('y', 0),
            'width': node.get('width', 0),
            'height': node.get('height', 0),
        }
    
    # Fills (colors)
    if 'fills' in node and node['fills']:
        analysis['fills'] = [
            {
                'color': hex_color(f),
                'opacity': f.get('opacity', 1),
                'type': f.get('type'),
            }
            for f in node['fills']
            if f.get('type') == 'SOLID'
        ]
    
    # Strokes
    if 'strokes' in node and node['strokes']:
        analysis['strokes'] = [
            {
                'color': hex_color(s),
                'opacity': s.get('opacity', 1),
                'width': node.get('strokeWeight', 1),
            }
            for s in node['strokes']
            if s.get('type') == 'SOLID'
        ]
    
    # Typography
    if 'fontFamily' in node:
        analysis['typography'] = {
            'fontFamily': node.get('fontFamily'),
            'fontSize': node.get('fontSize'),
            'fontWeight': node.get('fontWeight', 400),
            'letterSpacing': node.get('letterSpacing', 0),
            'lineHeightPx': node.get('lineHeightPx'),
            'textAlign': node.get('textAlignHorizontal', 'LEFT'),
        }
    
    # Text content
    if 'characters' in node:
        analysis['textContent'] = node.get('characters')
    
    # Layout
    if 'layoutMode' in node:
        analysis['layout'] = {
            'mode': node.get('layoutMode'),
            'spacing': node.get('itemSpacing', 0),
            'padding': {
                'top': node.get('paddingTop'),
                'right': node.get('paddingRight'),
                'bottom': node.get('paddingBottom'),
                'left': node.get('paddingLeft'),
            } if 'paddingLeft' in node else None,
        }
    
    # Corner radius
    if 'cornerRadius' in node:
        analysis['cornerRadius'] = node.get('cornerRadius')
    
    # Opacity
    if 'opacity' in node and node['opacity'] < 1:
        analysis['opacity'] = node.get('opacity')
    
    # Shadow/Effects
    if 'effects' in node and node['effects']:
        analysis['effects'] = [
            {
                'type': e.get('type'),
                'color': hex_color(e) if 'color' in e else None,
                'offset': {'x': e.get('offset', {}).get('x'), 'y': e.get('offset', {}).get('y')},
                'radius': e.get('radius'),
            }
            for e in node['effects']
        ]
    
    # Children
    if 'children' in node:
        analysis['childrenCount'] = len(node['children'])
        analysis['children'] = [analyze_node(child, depth + 1) for child in node['children']]
    
    return analysis

def list_nodes(node: Dict[str, Any], indent: int = 0) -> None:
    """Print the node tree."""
    prefix = '  ' * indent
    node_id = node.get('id', 'unknown')
    node_type = node.get('type', 'unknown')
    print(f'{prefix}{node.get("name")} ({node_id}) [{node_type}]')
    
    if 'children' in node:
        for child in node['children']:
            list_nodes(child, indent + 1)

def main():
    try:
        # Fetch the file
        figma_data = fetch_figma_file()
        print(f"✅ File fetched successfully")
        
        # List all nodes
        print("\n📄 Document Structure:")
        list_nodes(figma_data['document'])
        
        # Find the target node
        print(f"\n🔎 Finding node: {NODE_ID}")
        target_node = find_node_by_id(figma_data['document'], NODE_ID)
        
        if not target_node:
            print(f"❌ Node {NODE_ID} not found!")
            sys.exit(1)
        
        print(f"✅ Found: '{target_node.get('name')}' ({target_node.get('type')})")
        
        # Analyze the node
        print("\n📊 Analyzing node structure...")
        analysis = analyze_node(target_node)
        
        # Save to file
        output_path = 'd:/storyverse/figma-analysis.json'
        with open(output_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        print(f"✅ Analysis complete!")
        print(f"💾 Output saved to: {output_path}")
        print(f"\n📋 Summary:")
        print(f"   Name: {target_node.get('name')}")
        print(f"   Type: {target_node.get('type')}")
        print(f"   Children: {len(target_node.get('children', []))}")
        print(f"\n🎨 Full Analysis:\n")
        print(json.dumps(analysis, indent=2))
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
