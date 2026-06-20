# Darouna Assistant

An in-app AI assistant that lets each role (Syndic, Resident, Gardien) ask
natural-language questions about the data they are already authorized to see in
their part of the app, and hands them off to the right screen to act on it.

## Language

**Assistant**:
The AI feature as a whole — the floating mascot launcher, the chat sheet, and the
backend orchestration behind it. Always lowercase "assistant" in prose; capitalized
"Assistant" only when naming the product surface.
_Avoid_: bot, chatbot, AI (ambiguous)

**Tool**:
A single backend capability the assistant may invoke to fetch data, each one wrapping
an existing authorized `/api/v1` endpoint and called with the asking user's JWT.
_Avoid_: function, plugin, skill, action

**Tool-call**:
One invocation of a Tool during a turn. The model decides which tools to call; the
backend executes them under the user's identity so role guards apply unchanged.

**Suggested action**:
The optional deep-link a turn can return — a real app route plus a button label — that
moves the user to the screen where they actually do the thing (e.g. the pay-charge
checkout, the gardien's task page). The assistant never performs the write itself.
_Avoid_: command, deep-link (use "suggested action" for the concept, "route" for the value)

**Route registry**:
The fixed, allow-listed set of app screens the assistant may target with a Suggested
action. The model may only choose from this list; it cannot invent a destination.

**Role-scoped data access**:
The principle that the assistant can only ever reach data the user could already reach
in the UI, because every Tool goes through the same authenticated endpoints and role
guards. The security boundary is the existing API, not the prompt.

**Number safety**:
The rule that the assistant may only state figures that came back from a Tool-call. No
tool data on a topic ⇒ it says it doesn't have that information, never a guessed value.

**Knowledge scope**:
What the assistant is allowed to answer: the user's own authorized app data, plus how
to use the app itself. Everything else (general/legal/advice) is refused with a fixed
deflection line.

**Provider adapter**:
The single backend module that isolates the LLM vendor (DeepSeek today) behind one
interface, so the vendor can be swapped without touching tool or orchestration code.

**Mascot**:
The animated emerald-brand character in the bottom-right corner that launches the
assistant. Purely the visual/launcher identity, distinct from the Phase 4 human Chat tab.
