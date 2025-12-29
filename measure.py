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
fx = frame['absoluteBoundingBox']['x']
fy = frame['absoluteBoundingBox']['y']

def rel(elem):
    b = elem['absoluteBoundingBox']
    return {'t': round(b['y']-fy), 'l': round(b['x']-fx), 'w': round(b['width']), 'h': round(b['height'])}

print('FRAME: {} x {}'.format(frame['absoluteBoundingBox']['width'], frame['absoluteBoundingBox']['height']))
print()

for child in frame['children']:
    pos = rel(child)
    print('{}: t={}px, l={}px, w={}px, h={}px'.format(child['name'], pos['t'], pos['l'], pos['w'], pos['h']))
    
    if 'characters' in child:
        print('  TEXT: {}'.format(repr(child['characters'][:50])))
    
    if 'style' in child:
        s = child['style']
        print('  FONT: {}px weight={}'.format(s.get('fontSize'), s.get('fontWeight')))
        print('  LINEHEIGHT: {}px'.format(s.get('lineHeightPx')))
    
    if 'fills' in child and child['fills']:
        for f in child['fills']:
            if f.get('type') == 'SOLID':
                c = f.get('color', {})
                r = int(c.get('r', 0)*255)
                g = int(c.get('g', 0)*255)
                b_val = int(c.get('b', 0)*255)
                print('  COLOR: #{:02x}{:02x}{:02x}'.format(r, g, b_val))
    
    print()
