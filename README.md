# Aethra

Aethra is a browser-local demo. Responses are scripted and are not AI-generated. Demo accounts and conversations are stored in browser storage; they are not secure, are not synchronized, and can be lost when browser data is cleared. Do not use a real password.

Run `npm install` and `npm run dev`, then open http://localhost:3000. Use `npm run lint` and `npm run build` for checks. No API key is required.

Existing `aethra_projects` browser data is retained. The former server user file, if present, is not deleted or imported; retain a private backup and register a separate demo account.

## Quality checks

Use `npm run format`, `npm run format:check`, `npm run lint`, `npm test`, and `npm run build`.
Tests use isolated synthetic storage and do not access browser user data.
The sidebar width preference is saved independently of the temporary mobile drawer.
Model selectors are local preferences and never contact an AI provider.
