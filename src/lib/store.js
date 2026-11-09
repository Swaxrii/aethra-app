export function projectToHTML(project, userName) {
  const rows = (project.messages || [])
    .map((m) => {
      const role = m.role === "user" ? userName || "You" : "Aethra AI";
      const classRole = m.role === "user" ? "user" : "ai";
      return `<div class="msg ${classRole}">
        <div class="meta">${escapeHTML(role)}</div>
        <p>${escapeHTML(m.text)}</p>
      </div>`;
    })
    .join("\n      ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHTML(project.title)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 56px 24px;
        background: #0b0c0f;
        color: #e9e9ee;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
      }
      .wrap { max-width: 720px; margin: 0 auto; }
      .brand { color: #d7d8df; font-size: 11px; font-weight: 700; letter-spacing: .22em; }
      header { padding: 28px 0; margin-bottom: 28px; border-bottom: 1px solid #ffffff1a; }
      h1 { font-size: clamp(24px, 4vw, 34px); line-height: 1.2; margin: 0 0 10px; font-weight: 600; overflow-wrap: anywhere; }
      .model { color: #a2a5b0; font-size: 13px; }
      .msg { margin: 0 0 26px; }
      .msg.user p { background: #191a20; border: 1px solid #ffffff14; border-radius: 10px; padding: 14px 16px; }
      .meta { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #a2a5b0; margin-bottom: 9px; }
      .msg p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 15px; line-height: 1.75; }
      @media (max-width: 480px) { body { padding: 28px 18px; } header { padding: 22px 0; } }
      @media print { body { background: #fff; color: #111; padding: 0; } header { border-color: #ccc; } .brand, .model, .meta { color: #555; } .msg.user p { background: #f5f5f5; border-color: #ddd; } .msg { break-inside: avoid; } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="brand">AETHRA</div>
      <header>
        <h1>${escapeHTML(project.title)}</h1>
        <div class="model">Conversation · ${escapeHTML(project.model || "Aethra AI")}</div>
      </header>
      ${rows}
    </div>
  </body>
</html>`;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
