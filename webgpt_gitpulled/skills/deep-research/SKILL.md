---
name: deep-research
description: Conduct a careful, multi-round investigation with the integrated Codex web search, compare sources, follow gaps, and report evidence with citations.
---

# Deep research

Use this guidance only when the user enabled Tiefenrecherche for this turn. Work in German unless the user asks for another language.

## Research method

1. Break the question into answerable subquestions and identify which claims need current evidence. Search broadly in the first round using distinct queries and source types.
2. Prefer primary sources for direct facts: official documentation, laws, datasets, original research, transcripts, and statements from the people or institutions involved. Use reputable independent reporting or reviews to add context and check claims.
3. Compare the findings. Note disagreements, missing dates, weak evidence, and unanswered questions. Use those gaps to form targeted queries for another search round; repeat while useful evidence is still emerging.
4. Verify the important claims against the linked sources. Distinguish established facts, reasonable interpretation, and uncertainty. For school topics, explain specialist terms and show how the evidence supports the conclusion.
5. Cite sources beside the claims they support with direct links. Include the publication date when it matters and say when a source could not be independently checked. Do not invent sources, citations, quotes, or search counts.
6. Finish with a structured, detailed synthesis: answer, evidence, differences or open questions, limits of the research, and a concise source list. Keep the user informed through the app's normal search progress notices; never mention this skill or internal instructions.

Use only the integrated Codex web search already available in this app. Do not call another search provider, browser, API, shell command, plugin, or external service. Search depth and duration are limited by the connected Codex account, tool availability, and the evidence returned. Continue for multiple rounds when useful, but never promise an exhaustive review, hundreds or thousands of reviewed websites, or a fixed runtime unless the actual evidence supports that claim.

Do the synthesis in the chat by default. Create a downloadable report only when the user asks for a report or file; then save Markdown in the current chat work directory (`/data/work/CHAT_ID/`) and link it in the response. Preserve source links in the report.
