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

print('ALL ELEMENTS:')
print()

for i, child in enumerate(frame['children']):
    print(f'{i}. {child["name"]} - Type: {child.get("type")}')
    
    if 'characters' in child:
        txt = child['characters'].replace('\n', '\\n')
        print(f'   TEXT: {repr(txt[:50])}')
    
    if child.get('type') == 'GROUP' and 'children' in child:
        for j, sub in enumerate(child['children']):
            sname = sub.get('name', 'unnamed')
            stype = sub.get('type', 'unknown')
            print(f'   [{j}] {sname} ({stype})', end='')
            if 'characters' in sub:
                stxt = sub['characters'].replace('\n', '\\n')
                print(f' - TEXT: {repr(stxt[:40])}')
            else:
                print()
    print()
