import os
import sys
import argparse
import datetime
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    import docx
except ImportError:
    docx = None

try:
    from odf import text, teletype
    from odf.opendocument import load
except ImportError:
    text = None

try:
    import pandas as pd
except ImportError:
    pd = None

KNOWLEDGE_DIR = Path(".agent/knowledge")
EXTRACTED_DIR = KNOWLEDGE_DIR / "extracted"
INDEX_FILE = KNOWLEDGE_DIR / "index.md"

def extract_pdf(file_path):
    if not PdfReader:
        return "Error: pypdf not installed."
    reader = PdfReader(file_path)
    content = f"# {file_path.name}\n\n"
    for i, page in enumerate(reader.pages):
        content += f"## Page {i+1}\n\n"
        text_content = page.extract_text()
        if text_content:
            content += text_content + "\n\n"
    return content

def extract_docx(file_path):
    if not docx:
        return "Error: python-docx not installed."
    doc = docx.Document(file_path)
    content = f"# {file_path.name}\n\n"
    for para in doc.paragraphs:
        if para.text.strip():
            content += para.text + "\n\n"
    return content

def extract_odt(file_path):
    if not text:
        return "Error: odfpy not installed."
    doc = load(file_path)
    content = f"# {file_path.name}\n\n"
    paragraphs = doc.getElementsByType(text.P)
    for p in paragraphs:
        txt = teletype.extractText(p)
        if txt.strip():
            content += txt + "\n\n"
    return content

def extract_spreadsheet(file_path):
    if pd is None:
        return "Error: pandas not installed."
    
    content = f"# {file_path.name}\n\n"
    try:
        # Load all sheets
        sheets = pd.read_excel(file_path, sheet_name=None)
        for sheet_name, df in sheets.items():
            content += f"## Sheet: {sheet_name}\n\n"
            # Limit to Markdown for better readability, or CSV if huge
            if df.empty:
                content += "*Empty Sheet*\n\n"
            else:
                content += df.to_markdown(index=False) + "\n\n"
    except Exception as e:
        return f"Error extracting spreadsheet: {str(e)}"
    
    return content

def update_index(filename, summary, tags=""):
    date = datetime.date.today().isoformat()
    rel_path = f"extracted/{filename}.md"
    entry = f"| [{filename}]({rel_path}) | {summary} | {date} | {tags} |\n"
    
    if not INDEX_FILE.exists():
        INDEX_FILE.write_text("# Knowledge Index\n\n| File | Summary | Date | Tags |\n| :--- | :--- | :--- | :--- |\n")
    
    # Check if file already in index
    content = INDEX_FILE.read_text()
    if f"[{filename}]({rel_path})" in content:
        # Simple replacement
        lines = content.splitlines()
        new_lines = []
        for line in lines:
            if f"[{filename}]({rel_path})" in line:
                new_lines.append(entry.strip())
            else:
                new_lines.append(line)
        INDEX_FILE.write_text("\n".join(new_lines) + "\n")
    else:
        with open(INDEX_FILE, "a") as f:
            f.write(entry)

def main():
    parser = argparse.ArgumentParser(description="Knowledge Base Manager")
    subparsers = parser.add_subparsers(dest="command")
    
    extract_parser = subparsers.add_parser("extract", help="Extract content to Markdown")
    extract_parser.add_argument("input", help="Input file path")
    
    index_parser = subparsers.add_parser("index", help="Update the index")
    index_parser.add_argument("filename", help="Original filename")
    index_parser.add_argument("summary", help="Summary of the content")
    index_parser.add_argument("--tags", default="", help="Comma-separated tags")
    
    args = parser.parse_args()
    
    if args.command == "extract":
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"Error: {input_path} not found")
            sys.exit(1)
            
        ext = input_path.suffix.lower()
        if ext == ".pdf":
            content = extract_pdf(input_path)
        elif ext == ".docx":
            content = extract_docx(input_path)
        elif ext == ".odt":
            content = extract_odt(input_path)
        elif ext in [".xlsx", ".xls", ".ods"]:
            content = extract_spreadsheet(input_path)
        elif ext in [".txt", ".md"]:
            content = input_path.read_text()
        elif ext == ".csv":
            if pd is not None:
                df = pd.read_csv(input_path)
                content = f"# {input_path.name}\n\n" + df.to_markdown(index=False)
            else:
                content = input_path.read_text()
        else:
            print(f"Error: Unsupported format {ext}")
            sys.exit(1)
            
        EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
        out_name = input_path.name + ".md"
        out_path = EXTRACTED_DIR / out_name
        out_path.write_text(content)
        print(f"SUCCESS: Extracted to {out_path}")

        
    elif args.command == "index":
        update_index(args.filename, args.summary, args.tags)
        print(f"SUCCESS: Updated index for {args.filename}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
