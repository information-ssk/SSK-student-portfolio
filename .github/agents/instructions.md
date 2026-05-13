Agent Instructions

1. Run preprocess-agent to parse docs/ and produce task list.
2. Run copilot-agent with tasks from preprocess output.
3. For each generated patch, run tests locally (open index.html) and verify token persistence.
4. Commit patches to a feature branch and open PR.
5. After PR merge, deploy frontend to Vercel and backend via clasp.

Use these commands locally:
- git checkout -b feature/agent-patches
- apply patches (from Copilot)
- git add . && git commit -m "agent: apply patches"
- git push origin feature/agent-patches
