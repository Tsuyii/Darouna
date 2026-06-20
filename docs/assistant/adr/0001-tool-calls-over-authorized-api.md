# Data access via tool-calls over the existing authorized API

The assistant reaches data only by calling the same `/api/v1` endpoints the UI uses,
with the asking user's JWT, so the existing role guards enforce access automatically.
We deliberately rejected text-to-Mongo/SQL and a RAG vector store: both would move the
authorization boundary out of the proven API and into prompt/query logic we'd have to
re-secure, where a cleverly phrased question could leak another unit's data. With this
choice the security boundary is the API itself — a resident literally cannot phrase a
question that returns data the API would 403 for them.

## Consequences

- The assistant can only answer questions the existing endpoints can serve; new
  question types may require new (still-authorized) endpoints.
- Latency stacks: model turn + one or more HTTP tool-calls (note Render free-tier cold
  starts, ~8s).
