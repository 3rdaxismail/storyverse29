import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 3060 });

wss.on("connection", (ws: WebSocket) => {
  console.log("MCP Figma client connected");

  ws.on("message", (message: WebSocket.Data) => {
    console.log("Received:", message.toString());
  });
});

wss.on("error", (error: any) => {
  console.error("WebSocket server error:", error);
});

wss.on("listening", () => {
  console.log("✅ MCP Figma WebSocket server is listening on port 3060");
});

console.log("🚀 Starting MCP Figma WebSocket server on port 3060...");

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebSocket server...");
  wss.close(() => {
    console.log("✅ WebSocket server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n🛑 WebSocket server terminated");
  wss.close();
  process.exit(0);
});
