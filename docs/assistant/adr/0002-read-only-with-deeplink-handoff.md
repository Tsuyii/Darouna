# Assistant is read-only and hands off via deep-links; it never writes

The assistant answers questions and, when there's an obvious next step, returns a
Suggested action that routes the user to the real screen to perform it (pay a charge,
check off a task) — it never calls write endpoints on the user's behalf. We chose this
over a full action-taking agent to keep the blast radius small: a hallucinated or
misunderstood request can at most send someone to the wrong screen, never move money or
mutate a task. The destination is either returned by the tool that produced the answer
(canonical cases) or chosen by the model from a fixed Route registry, so a button can
never point at a screen that doesn't exist.

## Consequences

- Users still take the final action themselves; the assistant cannot complete a
  workflow end-to-end. Accepted as the safety trade-off.
- Tools that back a common action must also return the route + label for it.
