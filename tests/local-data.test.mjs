import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const values = new Map();
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
globalThis.window = { localStorage: storage, dispatchEvent() {} };
const uri = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const local = await import(
  uri(await readFile(new URL("../src/lib/localConversations.js", import.meta.url), "utf8"))
);
const { projectToHTML } = await import(
  uri(await readFile(new URL("../src/lib/store.js", import.meta.url), "utf8"))
);

beforeEach(() => values.clear());

test("browser conversations remain available for opt-in backup", () => {
  const conversation = { id: "p-1", title: "Idea", messages: [{ role: "user", text: "Hello" }] };
  values.set("aethra_projects", JSON.stringify([conversation]));
  assert.deepEqual(local.readConversations(), [conversation]);
  assert.deepEqual(JSON.parse(local.exportConversationBackup()).conversations, [conversation]);
  assert.equal(values.get("aethra_projects"), JSON.stringify([conversation]));
});

test("invalid browser conversations are never overwritten", () => {
  values.set("aethra_projects", "invalid-json");
  assert.throws(() => local.readConversations());
  assert.throws(() => local.exportConversationBackup());
  assert.equal(values.get("aethra_projects"), "invalid-json");
});

test("HTML export escapes conversation content", () => {
  const html = projectToHTML(
    {
      title: "<script>alert(1)</script>",
      model: "Aethra 1.0",
      messages: [{ role: "user", text: "<img src=x onerror=alert(1)>" }],
    },
    "You",
  );
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&lt;img"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img"));
});
