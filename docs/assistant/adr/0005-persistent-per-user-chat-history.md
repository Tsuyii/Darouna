# Persistent per-user assistant history (reversing the ephemeral default)

The assistant stores conversation history per user, surviving across sessions, reusing
the Phase 4 chat-storage pattern. We initially leaned ephemeral (in-session only) to
minimize PII at rest, but reversed it: this is a school project where persistent history
demos noticeably better and lets graders see prior conversations. The accepted cost is
that the user's questions — which can reference their financial/personal data — now sit
in the database; acceptable for the project's threat model, and one more reason a
production France launch would need a retention/erasure story.
