import { WebSocketServer } from "ws";

const PORT = 3060;

const wss = new WebSocketServer({ port: PORT });

wss.on("listening", () => {
  console.log("MCP WebSocket listening on port", PORT);
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    console.log("Received:", msg.toString());
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

process.on("uncaughtException", (err) => {
  console.error("MCP crash:", err);
});

process.stdin.resume(); // prevent exit
