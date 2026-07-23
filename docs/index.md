---
layout: home

hero:
  name: "Actaro"
  text: "Verifiable AI Agent Actions"
  tagline: Verify that AI agent actions actually produced their intended real-world effects. Don't just trust the LLM.
  image:
    src: /logo.png
    alt: Actaro Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: 🛡️ True Verification
    details: Doesn't blindly trust a tool's success message. Reads real state through a separate verify function and generates verifiable receipts.
  - title: 🧩 Idempotency
    details: Built-in safe concurrent promise deduplication and persisted receipt retrieval prevents accidental double-executions.
  - title: 🤖 Agent-Ready
    details: Adapts safely to MCP tools and seamlessly formats tool results back for LLM consumption via built-in result parsers.
  - title: 🔒 Secure & Redacted
    details: Deep object cloning and recursive key redaction ensure your JSON-serializable receipts never expose sensitive secrets.
---
