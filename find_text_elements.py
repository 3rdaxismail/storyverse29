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

def find_text_elements(node):
    if node.get("type") == "TEXT":
        name = node.get("name", "")
        text = node.get("characters", "")
        bounds = node.get("absoluteBoundingBox", {})
        rel_y = bounds.get("y", 0)
        rel_x = bounds.get("x", 0) - 2029
        
        print(f"{name}: '{text}' | x:{rel_x:.0f} y:{rel_y:.0f}")
    
    for child in node.get("children", []):
        find_text_elements(child)

print("=== TEXT ELEMENTS IN FRAME ===\n")
find_text_elements(frame)
