#!/usr/bin/env python3
import requests

FIGMA_FILE_ID = "zuWEY4gNbhwescluD1WZAC"
NODE_ID = "23:189"
TOKEN = "figd_muZm5N792nIbsF7LX7LiUJzAz83C5nh_DApL6RM_"

url = f"https://api.figma.com/v1/files/{FIGMA_FILE_ID}/nodes"
headers = {"X-Figma-Token": TOKEN}
params = {"ids": NODE_ID}

response = requests.get(url, headers=headers, params=params)
data = response.json()

frame = data["nodes"]["23:189"]["document"]

def find_text_details(node):
    if node.get("type") == "TEXT":
        name = node.get("name", "")
        text = node.get("characters", "")
        
        if "OTP" in name or "Enter OTP we" in name:
            print(f"\n=== {name} ===")
            print(f"Text: {repr(text)}")
            
            # Get bounds
            bounds = node.get("absoluteBoundingBox", {})
            print(f"Position: x={bounds.get('x'):.0f}, y={bounds.get('y'):.0f}")
            print(f"Size: w={bounds.get('width'):.0f}, h={bounds.get('height'):.0f}")
            
            # Get style
            style = node.get("style", {})
            print(f"Font size: {style.get('fontSize')}px")
            print(f"Line height px: {style.get('lineHeightPx')}px")
            print(f"Line height %: {style.get('lineHeightPercent')}%")
            print(f"Font weight: {style.get('fontWeight')}")
            
            # Character style overrides
            style_overrides = node.get("styleOverrideTable", {})
            if style_overrides:
                for key, override in style_overrides.items():
                    print(f"  Style {key}: {override}")
    
    for child in node.get("children", []):
        find_text_details(child)

find_text_details(frame)
