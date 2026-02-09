#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Figma API configuration
const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

if (!FIGMA_API_TOKEN) {
  console.error("Error: FIGMA_API_TOKEN environment variable is required");
  console.error("Please set your Figma personal access token:");
  console.error("  Windows: $env:FIGMA_API_TOKEN='your-token-here'");
  console.error("  Linux/Mac: export FIGMA_API_TOKEN='your-token-here'");
  process.exit(1);
}

// Helper function to make Figma API requests
async function figmaApiRequest(endpoint) {
  const url = `${FIGMA_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "X-Figma-Token": FIGMA_API_TOKEN,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Create MCP server
const server = new Server(
  {
    name: "figma-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_figma_file",
        description: "Get the full content of a Figma file including all pages, frames, and components",
        inputSchema: {
          type: "object",
          properties: {
            file_key: {
              type: "string",
              description: "The Figma file key (from the URL: figma.com/file/FILE_KEY/...)",
            },
          },
          required: ["file_key"],
        },
      },
      {
        name: "get_figma_file_nodes",
        description: "Get specific nodes from a Figma file",
        inputSchema: {
          type: "object",
          properties: {
            file_key: {
              type: "string",
              description: "The Figma file key",
            },
            node_ids: {
              type: "string",
              description: "Comma-separated list of node IDs to retrieve",
            },
          },
          required: ["file_key", "node_ids"],
        },
      },
      {
        name: "get_figma_images",
        description: "Export images from a Figma file",
        inputSchema: {
          type: "object",
          properties: {
            file_key: {
              type: "string",
              description: "The Figma file key",
            },
            node_ids: {
              type: "string",
              description: "Comma-separated list of node IDs to export",
            },
            format: {
              type: "string",
              description: "Image format (png, jpg, svg, pdf)",
              enum: ["png", "jpg", "svg", "pdf"],
              default: "png",
            },
            scale: {
              type: "number",
              description: "Scale factor for the exported images (1-4)",
              default: 1,
            },
          },
          required: ["file_key", "node_ids"],
        },
      },
      {
        name: "get_figma_comments",
        description: "Get comments from a Figma file",
        inputSchema: {
          type: "object",
          properties: {
            file_key: {
              type: "string",
              description: "The Figma file key",
            },
          },
          required: ["file_key"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_figma_file": {
        const data = await figmaApiRequest(`/files/${args.file_key}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_figma_file_nodes": {
        const data = await figmaApiRequest(
          `/files/${args.file_key}/nodes?ids=${args.node_ids}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_figma_images": {
        const format = args.format || "png";
        const scale = args.scale || 1;
        const data = await figmaApiRequest(
          `/images/${args.file_key}?ids=${args.node_ids}&format=${format}&scale=${scale}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_figma_comments": {
        const data = await figmaApiRequest(`/files/${args.file_key}/comments`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Figma MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});