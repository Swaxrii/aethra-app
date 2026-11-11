import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const uri = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const { projectToHTML } = await import(
  uri(await readFile(new URL("../src/lib/store.js", import.meta.url), "utf8"))
);

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
