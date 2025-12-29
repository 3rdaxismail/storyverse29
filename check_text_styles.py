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

def extract_text_details(node, depth=0):
    """Extract detailed text node info including character styles"""
    indent = "  " * depth
    
    if node.get("type") == "TEXT":
        name = node.get("name", "?")
        text = node.get("characters", "")
        
        print(f"\n{indent}=== TEXT: {name} ===")
        print(f"{indent}Full text: {repr(text)}")
        
        # Get fill for the whole text node
        fills = node.get("fills", [])
        if fills:
            color = fills[0].get("color", {})
            r = int(color.get("r", 0) * 255)
            g = int(color.get("g", 0) * 255)
            b = int(color.get("b", 0) * 255)
            print(f"{indent}Node fill: #{r:02x}{g:02x}{b:02x}")
        
        # Check for character-level style overrides
        style_override_table = node.get("styleOverrideTable", {})
        if style_override_table:
            print(f"{indent}Style override table: {style_override_table}")
        
        # Check for character fill overrides
        char_fill_overrides = node.get("charFillOverrides", [])
        if char_fill_overrides:
            print(f"{indent}Character fill overrides: {char_fill_overrides}")
        
        # Check raw style data
        style = node.get("style", {})
        print(f"{indent}Style keys: {style.keys() if style else 'none'}")
    
    for child in node.get("children", []):
        extract_text_details(child, depth + 1)

extract_text_details(frame)
