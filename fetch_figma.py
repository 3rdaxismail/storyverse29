#!/usr/bin/env python3
import requests
import json

# Use provided token
figma_token = 'figd_muZm5N792nIbsF7LX7LiUJzAz83C5nh_DApL6RM_'

file_id = 'zuWEY4gNbhwescluD1WZAC'
node_id = '23-189'

if figma_token:
    print(f"Fetching design from Figma file: {file_id}, node: {node_id}")
    url = f'https://api.figma.com/v1/files/{file_id}/nodes?ids={node_id}'
    headers = {'X-FIGMA-TOKEN': figma_token}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f'Error: {response.status_code}')
        print(response.text)
else:
    print('ERROR: FIGMA_TOKEN not found in environment variables or .env file')
    print('Please set FIGMA_TOKEN environment variable or create .env file')
