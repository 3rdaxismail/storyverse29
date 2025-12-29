#!/usr/bin/env python3
import requests
import json

FIGMA_FILE_ID = "zuWEY4gNbhwescluD1WZAC"
NODE_ID = "23-189"
TOKEN = "figd_muZm5N792nIbsF7LX7LiUJzAz83C5nh_DApL6RM_"

url = f"https://api.figma.com/v1/files/{FIGMA_FILE_ID}/nodes"
headers = {"X-Figma-Token": TOKEN}
params = {"ids": NODE_ID}

response = requests.get(url, headers=headers, params=params)
data = response.json()

# Debug: show what we got
print(f"Response keys: {data.keys()}")
if "nodes" in data:
    print(f"Nodes keys: {data['nodes'].keys()}")
    for key in data["nodes"].keys():
        print(f"  Node: {key}")
        node = data["nodes"][key]
        if "document" in node:
            frame_data = node["document"]
        else:
            print(f"    Keys in node: {node.keys()}")
            frame_data = node
else:
    print(f"Error: {data}")
    exit(1)

print("=== OTP VERIFICATION FRAME STRUCTURE ===\n")
print(f"Frame: {frame_data['name']}")
print(f"Type: {frame_data['type']}")
print(f"Dimensions: {frame_data['absoluteBoundingBox']}\n")

def print_tree(node, depth=0):
    indent = "  " * depth
    bounds = node.get("absoluteBoundingBox", {})
    x = bounds.get("x", 0)
    y = bounds.get("y", 0)
    w = bounds.get("width", 0)
    h = bounds.get("height", 0)
    
    node_type = node.get("type", "Unknown")
    node_name = node.get("name", "Unnamed")
    
    print(f"{indent}├─ {node_name} ({node_type}) | x:{x:.0f} y:{y:.0f} w:{w:.0f} h:{h:.0f}")
    
    # Print fill and stroke info for key elements
    if node_type == "COMPONENT" or node_type == "FRAME":
        fills = node.get("fills", [])
        strokes = node.get("strokes", [])
        if fills and fills[0].get("visible", True):
            color = fills[0].get("color", {})
            print(f"{indent}   └─ Fill: rgba({int(color.get('r', 0)*255)},{int(color.get('g', 0)*255)},{int(color.get('b', 0)*255)},{color.get('a', 1)})")
        if strokes and strokes[0].get("visible", True):
            print(f"{indent}   └─ Stroke visible")
    
    children = node.get("children", [])
    for i, child in enumerate(children):
        is_last = i == len(children) - 1
        print_tree(child, depth + 1)

print("\nHierarchy:")
print_tree(frame_data)

# Find logo and header elements specifically
def find_elements(node, target_names=[]):
    results = []
    if any(name.lower() in node.get("name", "").lower() for name in target_names):
        results.append({
            "name": node.get("name"),
            "type": node.get("type"),
            "bounds": node.get("absoluteBoundingBox")
        })
    for child in node.get("children", []):
        results.extend(find_elements(child, target_names))
    return results

logo_elements = find_elements(frame_data, ["logo", "header", "storyverse"])
print("\n\n=== LOGO/HEADER ELEMENTS ===")
for elem in logo_elements:
    print(f"{elem['name']} ({elem['type']})")
    print(f"  Position: x={elem['bounds']['x']:.0f}, y={elem['bounds']['y']:.0f}")
    print(f"  Size: {elem['bounds']['width']:.0f}x{elem['bounds']['height']:.0f}\n")
