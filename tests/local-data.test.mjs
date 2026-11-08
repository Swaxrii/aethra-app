import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const values = new Map();
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
globalThis.localStorage = storage;
globalThis.window = { localStorage: storage, dispatchEvent() {} };
const uri = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const persistenceSource = await readFile(
  new URL("../src/lib/localConversations.js", import.meta.url),
  "utf8",
);
const persistenceUri = uri(persistenceSource);
const storeSource = (
  await readFile(new URL("../src/lib/store.js", import.meta.url), "utf8")
).replace('"./localConversations"', JSON.stringify(persistenceUri));
const storeUri = uri(storeSource);
const store = await import(storeUri);
const persistence = await import(persistenceUri);
const auth = await import(
  uri(await readFile(new URL("../src/lib/localAuth.js", import.meta.url), "utf8"))
);
const ai = await import(
  uri(
    (await readFile(new URL("../src/lib/ai.js", import.meta.url), "utf8")).replace(
      '"./store"',
      JSON.stringify(storeUri),
    ),
  )
);
beforeEach(() => values.clear());

test("conversation changes persist without replacing the legacy storage key", () => {
  const project = store.createProject("A question");
  store.addAIMessage(project.id, "An answer");
  assert.equal(store.getProject(project.id).messages.length, 2);
  store.renameProject(project.id, "Renamed");
  assert.equal(store.getProject(project.id).title, "Renamed");
  assert.ok(values.has("aethra_projects"));
  store.deleteProject(project.id);
  assert.equal(store.getProject(project.id), undefined);
});
test("unreadable conversation data is never overwritten", () => {
  values.set("aethra_projects", "invalid-json");
  assert.throws(() => store.createProject("New"));
  assert.equal(values.get("aethra_projects"), "invalid-json");
  values.set("aethra_projects", JSON.stringify({ unexpected: true }));
  assert.throws(() => persistence.writeConversations([]));
  assert.deepEqual(JSON.parse(values.get("aethra_projects")), { unexpected: true });
});
test("demo accounts validate credentials and preserve identity during editing", async () => {
  const user = await auth.registerDemo({
    firstName: "Demo",
    lastName: "Tester",
    email: "DEMO@example.test",
    password: "demo-only-123",
  });
  assert.equal((await auth.loginDemo("demo@example.test", "demo-only-123")).id, user.id);
  await assert.rejects(auth.loginDemo("demo@example.test", "wrong"));
  await assert.rejects(
    auth.registerDemo({
      firstName: "Other",
      lastName: "Tester",
      email: "demo@example.test",
      password: "demo-only-123",
    }),
  );
  const updated = await auth.updateDemo(user.id, {
    firstName: "Updated",
    lastName: "Tester",
    email: "updated@example.test",
  });
  assert.equal(updated.id, user.id);
  assert.equal(updated.firstName, "Updated");
  assert.equal(updated.passwordHash, undefined);
});
test("local response cancellation interrupts simulated output", async () => {
  const controller = new AbortController();
  let output = "";
  await assert.rejects(
    ai.streamAIReply([{ role: "user", content: "Help with code" }], {
      signal: controller.signal,
      onToken(value) {
        output = value;
        controller.abort();
      },
    }),
    { name: "AbortError" },
  );
  assert.ok(output.length > 0);
});
