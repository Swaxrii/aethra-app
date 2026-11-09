import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import pg from "pg";

loadEnvConfig(process.cwd());
const databaseUrl = process.env.DATABASE_URL;
const baseUrl = process.env.AETHRA_TEST_BASE_URL || "http://localhost:3000";

async function request(path, method = "GET", payload, cookie) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(method !== "GET" ? { Origin: baseUrl } : {}),
      ...(payload ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}

test("PostgreSQL accounts, sessions, preferences, and conversations", async () => {
  assert.ok(databaseUrl, "Set DATABASE_URL in .env.local before running integration tests");
  const pool = new pg.Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
  const suffix = randomUUID().slice(0, 12);
  const firstEmail = `aethra-test-${suffix}@example.invalid`;
  const secondEmail = `aethra-test-other-${suffix}@example.invalid`;
  const updatedEmail = `aethra-test-updated-${suffix}@example.invalid`;
  const password = `Test-Password-${randomUUID()}`;
  const newPassword = `New-Password-${randomUUID()}`;
  try {
    assert.equal((await request("/api/conversations")).status, 401);
    const first = await request("/api/auth/register", "POST", {
      firstName: "Test",
      lastName: "One",
      email: firstEmail,
      password,
    });
    assert.equal(first.status, 201);
    assert.ok(first.cookie?.startsWith("aethra_session="));
    const [savedUser] = (
      await pool.query("SELECT id, password_hash, last_login_at FROM users WHERE email = $1", [
        firstEmail,
      ])
    ).rows;
    assert.ok(savedUser.password_hash.startsWith("$argon2id$"));
    assert.equal(savedUser.last_login_at, null);
    const token = first.cookie.split("=")[1];
    const tokenHash = createHash("sha256").update(token).digest("hex");
    assert.equal(
      (
        await pool.query(
          "SELECT COUNT(*)::int AS count FROM sessions WHERE user_id = $1 AND token_hash = $2",
          [savedUser.id, tokenHash],
        )
      ).rows[0].count,
      1,
    );
    assert.equal((await request("/api/auth/session", "GET", undefined, first.cookie)).status, 200);
    assert.equal(
      (
        await request("/api/auth/register", "POST", {
          firstName: "Duplicate",
          lastName: "User",
          email: firstEmail.toUpperCase(),
          password,
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await request("/api/auth/login", "POST", {
          email: firstEmail,
          password: "incorrect-password",
        })
      ).status,
      401,
    );
    const login = await request("/api/auth/login", "POST", { email: firstEmail, password });
    assert.equal(login.status, 200);
    assert.ok(login.cookie);
    assert.ok(
      (await pool.query("SELECT last_login_at FROM users WHERE id = $1", [savedUser.id])).rows[0]
        .last_login_at,
    );
    const second = await request("/api/auth/register", "POST", {
      firstName: "Test",
      lastName: "Two",
      email: secondEmail,
      password,
    });
    assert.equal(second.status, 201);
    assert.equal(
      (
        await request(
          "/api/preferences",
          "PUT",
          { model: "Aethra 1.1", temperature: 1.2, responseLength: "Detailed" },
          login.cookie,
        )
      ).status,
      200,
    );
    const preferences = await request("/api/preferences", "GET", undefined, login.cookie);
    assert.equal(preferences.data.preferences.model, "Aethra 1.1");
    assert.ok(Math.abs(preferences.data.preferences.temperature - 1.2) < 0.00001);
    assert.equal(
      (
        await request(
          "/api/profile",
          "PATCH",
          { firstName: "Changed", lastName: "One", email: updatedEmail },
          login.cookie,
        )
      ).status,
      403,
    );
    const profile = await request(
      "/api/profile",
      "PATCH",
      {
        firstName: "Changed",
        lastName: "One",
        email: updatedEmail,
        currentPassword: password,
        password: newPassword,
      },
      login.cookie,
    );
    assert.equal(profile.status, 200);
    assert.equal(profile.data.user.email, updatedEmail);
    assert.equal((await request("/api/auth/session", "GET", undefined, first.cookie)).status, 401);
    assert.equal(
      (await request("/api/auth/login", "POST", { email: updatedEmail, password })).status,
      401,
    );
    assert.equal(
      (await request("/api/auth/login", "POST", { email: updatedEmail, password: newPassword }))
        .status,
      200,
    );
    const created = await request(
      "/api/conversations",
      "POST",
      { prompt: "Unique project idea", model: "Aethra 1.1" },
      login.cookie,
    );
    assert.equal(created.status, 201);
    const id = created.data.conversation.id;
    assert.equal(
      (await request(`/api/conversations/${id}`, "GET", undefined, second.cookie)).status,
      404,
    );
    assert.equal(
      (await request(`/api/conversations/${id}`, "PATCH", { title: "Other title" }, second.cookie))
        .status,
      404,
    );
    assert.equal(
      (await request(`/api/conversations/${id}`, "DELETE", undefined, second.cookie)).status,
      404,
    );
    assert.equal(
      (
        await request(
          `/api/conversations/${id}/messages`,
          "POST",
          { text: "Other message", role: "user" },
          second.cookie,
        )
      ).status,
      404,
    );
    assert.equal(
      (await request(`/api/conversations/${id}/reply`, "POST", {}, second.cookie)).status,
      404,
    );
    const reply = await request(`/api/conversations/${id}/reply`, "POST", {}, login.cookie);
    assert.equal(reply.status, 200);
    assert.deepEqual(
      reply.data.conversation.messages.map((message) => message.role),
      ["user", "ai"],
    );
    assert.equal(
      (
        await request(
          `/api/conversations/${id}/messages`,
          "POST",
          { text: "Follow-up", role: "user" },
          login.cookie,
        )
      ).status,
      201,
    );
    assert.equal(
      (await request(`/api/conversations/${id}/reply`, "POST", {}, login.cookie)).status,
      200,
    );
    const search = await request("/api/conversations?q=Follow-up", "GET", undefined, login.cookie);
    assert.deepEqual(
      search.data.conversations.map((item) => item.id),
      [id],
    );
    assert.deepEqual(
      (await request("/api/conversations?q=Follow-up", "GET", undefined, second.cookie)).data
        .conversations,
      [],
    );
    assert.equal(
      (await request(`/api/conversations/${id}`, "PATCH", { title: "Renamed" }, login.cookie)).data
        .conversation.title,
      "Renamed",
    );
    const legacy = {
      id: "p-test-1",
      title: "Old conversation",
      messages: [
        { role: "user", text: "First" },
        { role: "ai", text: "Second" },
      ],
    };
    assert.equal(
      (
        await request(
          "/api/conversations/import",
          "POST",
          { conversations: [legacy] },
          login.cookie,
        )
      ).data.imported,
      1,
    );
    assert.equal(
      (
        await request(
          "/api/conversations/import",
          "POST",
          { conversations: [legacy] },
          login.cookie,
        )
      ).data.skipped,
      1,
    );
    const imported = (
      await request("/api/conversations?q=Old conversation", "GET", undefined, login.cookie)
    ).data.conversations[0];
    assert.equal(imported.messageCount, 2);
    const importedDetail = await request(
      `/api/conversations/${imported.id}`,
      "GET",
      undefined,
      login.cookie,
    );
    assert.deepEqual(
      importedDetail.data.conversation.messages.map((message) => message.text),
      ["First", "Second"],
    );
    assert.equal(
      (await request(`/api/conversations/${id}`, "DELETE", undefined, login.cookie)).status,
      200,
    );
    assert.equal(
      (await request(`/api/conversations/${id}`, "GET", undefined, login.cookie)).status,
      404,
    );
    assert.equal((await request("/api/auth/logout", "POST", undefined, second.cookie)).status, 200);
    assert.equal((await request("/api/auth/session", "GET", undefined, second.cookie)).status, 401);
    const loginTokenHash = createHash("sha256").update(login.cookie.split("=")[1]).digest("hex");
    await pool.query(
      "UPDATE sessions SET expires_at = now() - interval '1 second' WHERE token_hash = $1",
      [loginTokenHash],
    );
    assert.equal((await request("/api/auth/session", "GET", undefined, login.cookie)).status, 401);
  } finally {
    await pool
      .query("DELETE FROM users WHERE email = ANY($1::text[])", [
        [firstEmail, secondEmail, updatedEmail],
      ])
      .catch(() => {});
    await pool.end();
  }
});
