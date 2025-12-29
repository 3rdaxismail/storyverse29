#!/usr/bin/env python3
import json

with open('figma_response.json', 'r') as f:
    lines = f.readlines()
    # Skip first line if it contains "Fetching"
    start = 1 if 'Fetching' in lines[0] else 0
    data = json.loads(''.join(lines[start:]))

frame = data['nodes']['23:189']['document']
frame_x = frame['absoluteBoundingBox']['x']
frame_y = frame['absoluteBoundingBox']['y']

# Relative position function
def rel_pos(elem):
    bbox = elem['absoluteBoundingBox']
    return {
        'top': bbox['y'] - frame_y,
        'left': bbox['x'] - frame_x,
        'width': bbox['width'],
        'height': bbox['height']
    }

print("FRAME DIMENSIONS:", frame['absoluteBoundingBox']['width'], "x", frame['absoluteBoundingBox']['height'])
print()

for child in frame['children']:
    print(f"ELEMENT: {child['name']} ({child['id']})")
    pos = rel_pos(child)
    print(f"  Position: top={pos['top']:.2f}px, left={pos['left']:.2f}px, width={pos['width']:.2f}px, height={pos['height']:.2f}px")
    
    if 'cornerRadius' in child:
        print(f"  BorderRadius: {child['cornerRadius']}px")
    
    if 'characters' in child:
        print(f"  Text: {repr(child['characters'][:50])}")
    
    if 'style' in child:
        s = child['style']
        print(f"  Font: {s.get('fontFamily')} {s.get('fontSize')}px, weight {s.get('fontWeight')}")
        if s.get('lineHeightPx'):
            print(f"  LineHeight: {s.get('lineHeightPx')}px")
    
    if 'fills' in child and child['fills']:
        for fill in child['fills']:
            if fill.get('type') == 'SOLID':
                c = fill.get('color', {})
                r = int(c.get('r', 0) * 255)
                g = int(c.get('g', 0) * 255)
                b = int(c.get('b', 0) * 255)
                print(f"  Fill: #{r:02x}{g:02x}{b:02x}")
    
    print()
