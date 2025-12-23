// made by namar0x0309 with ❤️ at GoAIX
import 'dotenv/config';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Wekan } from "./wekan.js";

const BASE_URL = process.env["WEKAN_BASE_URL"]?.replace(/\/$/, "") || "";
const TOKEN = process.env["WEKAN_API_TOKEN"] || "";
const USERNAME = process.env["WEKAN_USERNAME"] || "";
const PASSWORD = process.env["WEKAN_PASSWORD"] || "";
const USER_ID = process.env["WEKAN_USER_ID"] || "";

if (!BASE_URL || (!TOKEN && !(USERNAME && PASSWORD))) {
  // Fail fast so agent surfaces a clear error.
  throw new Error("Set WEKAN_BASE_URL and either WEKAN_API_TOKEN or both WEKAN_USERNAME and WEKAN_PASSWORD");
}

const wekan = new Wekan({ 
  baseUrl: BASE_URL, 
  token: TOKEN,
  username: USERNAME,
  password: PASSWORD,
  userId: USER_ID
});

const server = new McpServer(
  { name: "mcp-wekan", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// Register tools
server.tool("listBoards", "List accessible Wekan boards", {}, async () => {
  const boards = await wekan.listBoards(USER_ID);
  return { content: [{ type: "text", text: JSON.stringify(boards.map((b) => ({ id: b._id, title: b.title })))}] };
});

server.tool("listLists", "List lists in a board", {
  boardId: z.string()
}, async (args) => {
  const { boardId } = args;
  const lists = await wekan.listLists(boardId);
  return { content: [{ type: "text", text: JSON.stringify(lists.map((l) => ({ id: l._id, title: l.title })))}] };
});

server.tool("listSwimlanes", "List swimlanes in a board", {
  boardId: z.string()
}, async (args) => {
  const { boardId } = args;
  const lanes = await wekan.listSwimlanes(boardId);
  return { content: [{ type: "text", text: JSON.stringify(lanes.map((s) => ({ id: s._id, title: s.title })))}] };
});

server.tool("listCards", "List cards in a board+list", {
  boardId: z.string(),
  listId: z.string()
}, async (args) => {
  const { boardId, listId } = args;
  const cards = await wekan.listCards(boardId, listId);
  return { content: [{ type: "text", text: JSON.stringify(cards.map((c) => ({ id: c._id, title: c.title, desc: c.description })))}] };
});

server.tool("createCard", "Create a card", {
  boardId: z.string(),
  listId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  swimlaneId: z.string(),
  due: z.string().datetime().optional(),
  members: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional()
}, async (args) => {
  const { boardId, listId, title, description, swimlaneId, due, members, labels } = args;
  const body: any = {
    authorId: USER_ID,
    title,
    description: description || "",
    swimlaneId
  };
  if (due) body.dueAt = due;
  if (members) body.members = members;
  if (labels) body.labelIds = labels;
  const card = await wekan.createCard(boardId, listId, body);
  return { content: [{ type: "text", text: JSON.stringify({ id: card._id, title: card.title }) }] };
});

server.tool("moveCard", "Move a card to another list or swimlane", {
  boardId: z.string(),
  fromListId: z.string(),
  cardId: z.string(),
  listId: z.string().optional(),
  swimlaneId: z.string().optional()
}, async (args) => {
  const { boardId, fromListId, cardId, listId, swimlaneId } = args;
  const payload: any = {};
  if (listId) payload.listId = listId;
  if (swimlaneId) payload.swimlaneId = swimlaneId;
  const card = await wekan.moveCard(boardId, fromListId, cardId, payload);
  return { content: [{ type: "text", text: JSON.stringify({ id: card._id, listId: card.listId, swimlaneId: card.swimlaneId }) }] };
});

server.tool("commentCard", "Add a comment to a card", {
  boardId: z.string(),
  cardId: z.string(),
  comment: z.string().min(1)
}, async (args) => {
  const { boardId, cardId, comment } = args;
  const res = await wekan.commentCard(boardId, cardId, USER_ID, comment);
  return { content: [{ type: "text", text: JSON.stringify({ ok: true, commentId: res._id }) }] };
});

// Start transport
const transport = new StdioServerTransport();
await server.connect(transport);
