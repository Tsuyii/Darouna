# DeepSeek as the LLM provider, behind a provider adapter

We use the DeepSeek API for the assistant and accept that residents' personal and
financial data (names, balances, complaints) leaves to a China-hosted API. This is a
deliberate MVP/school-project trade-off: DeepSeek is cheap with solid reasoning and
tool-calling, and the immediate audience is the MENA demo. It is recorded because it is
surprising in context — the product also targets France, where sending this PII to a
non-EU provider is a real GDPR exposure. To keep "DeepSeek now" from becoming "trapped
on DeepSeek," the vendor sits behind a single Provider adapter module so it can be
swapped for an EU-hosted model (or Claude) before any France launch without touching
tool or orchestration code.

## Consequences

- Not fit for a France/GDPR production launch as-is; swapping the provider is a
  prerequisite for that.
- The DeepSeek API key lives only in `residence-app-backend` env, never in the frontend.
