import os
import re
import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path, out_txt_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Namespace for Word
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            text_lines = []
            for p in tree.findall('.//w:p', ns):
                line = ""
                for t in p.findall('.//w:t', ns):
                    if t.text:
                        line += t.text
                if line:
                    text_lines.append(line)
            
            with open(out_txt_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(text_lines))
            print(f"Successfully extracted text to {out_txt_path}")
    except Exception as e:
        print(f"Error: {e}")

docs_dir = r"C:\Projects\9antra\pfe_docs"
files = [
    "Copy of rapport PFE Mohamed Oussema Salhi (1).docx",
    "Diagrammes.docx",
    "RapportAmineEtNidhalFinal.docx"
]

for file in files:
    in_path = os.path.join(docs_dir, file)
    out_path = os.path.join(docs_dir, file.replace('.docx', '.txt'))
    extract_text_from_docx(in_path, out_path)
