---
name: managing-knowledge
description: Extracts content from various document formats (PDF, DOCX, ODT, XLSX, CSV) to Markdown and maintains a searchable index with summaries. Use when the user uploads or mentions processing documents for later reference.
---

# Managing Knowledge

## When to use this skill

- When a user uploads a document (PDF, DOCX, ODT, etc.) or spreadsheet (XLSX, ODS, CSV).
- When you need to summarize and "index" documents for future retrieval.
- When you want to extract text content to Markdown to make it more accessible to the agent.

## Workflow

1. **Extract Content**: Run the extraction script on the uploaded file.

    ```bash
    python3 .agent/skills/managing-knowledge/scripts/kb_manager.py extract <path_to_file>
    ```

2. **Generate Summary**: Read the generated Markdown file in `.agent/knowledge/extracted/`.
    - Summarize the key points, purpose, and findings.
3. **Update Index**: Use the script to add the file to the index.

    ```bash
    python3 .agent/skills/managing-knowledge/scripts/kb_manager.py index "<original_filename>" "<summary>" --tags "<tag1,tag2>"
    ```

4. **Verify**: Check `.agent/knowledge/index.md` to ensure the entry is correct.

## Instructions

- **Supported Formats**: PDF, DOCX, ODT, XLSX, XLS, ODS, CSV, TXT, MD.
- **Spreadsheets**: Extracted to Markdown tables for easy readability. Large spreadsheets are converted sheet-by-sheet.
- **Location**: All extracted content lives in `.agent/knowledge/extracted/`.
- **Indexing**: Always provide a meaningful summary (1-2 sentences) and relevant tags.
- **Multi-file Processing**: If multiple files are uploaded, process them sequentially and update the index for each.

## Resources

- [kb_manager.py](scripts/kb_manager.py)
- [Example Index](examples/index_example.md)
