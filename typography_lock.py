import requests
import json

figma_token = 'figd_muZm5N792nIbsF7LX7LiUJzAz83C5nh_DApL6RM_'
file_id = 'zuWEY4gNbhwescluD1WZAC'
node_id = '23:189'

url = f'https://api.figma.com/v1/files/{file_id}/nodes?ids={node_id}'
headers = {'X-FIGMA-TOKEN': figma_token}

response = requests.get(url, headers=headers)
data = response.json()

frame = data['nodes']['23:189']['document']

print('=== TYPOGRAPHY LOCK DATA ===')
print()

# Get all text elements
text_elements = [
    ('OTP Verification', frame['children'][2]),  # index 2
    ('Subtitle', frame['children'][5]),  # index 5
    ('Button', frame['children'][7]),  # index 7
]

for name, elem in text_elements:
    print(f'{name}:')
    print(f'  Text: {repr(elem.get("characters", "")[:50])}')
    
    style = elem.get('style', {})
    print(f'  Font: {style.get("fontFamily")}')
    print(f'  Size: {style.get("fontSize")}px')
    print(f'  Weight: {style.get("fontWeight")}')
    print(f'  LineHeight: {style.get("lineHeightPx")}px')
    print(f'  LineHeight %: {style.get("lineHeightPercentFontSize")}%')
    
    # Check for character-level overrides
    if 'characterStyleOverrides' in elem and elem['characterStyleOverrides']:
        print(f'  Character overrides: {elem["characterStyleOverrides"][:5]}...')
        print(f'  Style table:')
        for key, override in elem.get('styleOverrideTable', {}).items():
            print(f'    Style {key}:')
            print(f'      Size: {override.get("fontSize")}px')
            print(f'      Weight: {override.get("fontWeight")}')
            if 'fills' in override:
                c = override['fills'][0].get('color', {})
                r = int(c.get('r', 0)*255)
                g = int(c.get('g', 0)*255)
                b = int(c.get('b', 0)*255)
                print(f'      Color: #{r:02x}{g:02x}{b:02x}')
    
    print()

# Input and button
print('Input field (Group 58):')
input_group = frame['children'][3]
input_rect = input_group['children'][0]
print(f'  Height: {input_rect["absoluteBoundingBox"]["height"]}px')
print()

print('Button (Rectangle 30):')
button = frame['children'][6]
print(f'  Height: {button["absoluteBoundingBox"]["height"]}px')
