#!/usr/bin/env python3
import requests
import json

FIGMA_FILE_ID = "zuWEY4gNbhwescluD1WZAC"
NODE_ID = "23:189"
TOKEN = "figd_muZm5N792nIbsF7LX7LiUJzAz83C5nh_DApL6RM_"

url = f"https://api.figma.com/v1/files/{FIGMA_FILE_ID}/nodes"
headers = {"X-Figma-Token": TOKEN}
params = {"ids": NODE_ID}

response = requests.get(url, headers=headers, params=params)
data = response.json()

frame = data["nodes"]["23:189"]["document"]

def extract_all(node, depth=0):
    """Extract all node info including fills"""
    indent = "  " * depth
    name = node.get("name", "?")
    node_type = node.get("type", "?")
    
    # For TEXT nodes, show everything
    if node_type == "TEXT":
        print(f"\n{indent}=== TEXT: {name} ===")
        print(f"{indent}Characters: {node.get('characters', '')}")
        print(f"{indent}Font: {node.get('style', {}).get('fontFamily')} {node.get('style', {}).get('fontSize')}px")
        
        fills = node.get("fills", [])
        print(f"{indent}Fills count: {len(fills)}")
        for i, fill in enumerate(fills):
            print(f"{indent}  Fill[{i}]: {fill}")
            
    for child in node.get("children", []):
        extract_all(child, depth + 1)

extract_all(frame)
