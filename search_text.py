import requests
import json

figma_token = 'figd_muZm5N792nIbsF7LX7LiUJzAz83C5nh_DApL6RM_'
file_id = 'zuWEY4gNbhwescluD1WZAC'

url = f'https://api.figma.com/v1/files/{file_id}'
headers = {'X-FIGMA-TOKEN': figma_token}

response = requests.get(url, headers=headers)
data = response.json()

# Search for any text nodes containing "Storyverse" or "words matter"
def search_text(node, depth=0):
    if 'characters' in node:
        txt = node.get('characters', '')
        if any(x in txt for x in ['Storyverse', 'words', 'matter']):
            print(f"{'  '*depth}FOUND: {node['name']} - {repr(txt[:60])}")
    
    if 'children' in node:
        for child in node['children']:
            search_text(child, depth+1)

print('Searching entire file for "Storyverse", "words", "matter":')
if 'document' in data:
    search_text(data['document'])
