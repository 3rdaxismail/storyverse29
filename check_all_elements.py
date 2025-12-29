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

def print_all_elements(node, depth=0):
    indent = "  " * depth
    name = node.get("name", "?")
    node_type = node.get("type", "?")
    bounds = node.get("absoluteBoundingBox", {})
    x, y, w, h = bounds.get("x", 0), bounds.get("y", 0), bounds.get("width", 0), bounds.get("height", 0)
    
    # Show relative positions (x - 2029 is the frame start)
    rel_x = x - 2029
    rel_y = y
    
    print(f"{indent}{name} ({node_type}) | rel_x:{rel_x:.0f} rel_y:{rel_y:.0f} w:{w:.0f} h:{h:.0f}")
    
    for child in node.get("children", []):
        print_all_elements(child, depth + 1)

print("=== ALL ELEMENTS IN OTP VERIFICATION FRAME ===\n")
print_all_elements(frame)
