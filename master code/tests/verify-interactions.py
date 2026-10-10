from pathlib import Path
from html.parser import HTMLParser
from zipfile import ZipFile
from urllib.parse import urlsplit
from collections import Counter
import subprocess,json,hashlib
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.paths=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  for key in ('src','href'):
   if key in a and not urlsplit(a[key]).scheme and not a[key].startswith(('#','//')):self.paths.append(a[key])
missing=[];duplicates=[];syntax=[];pages=[]
for portal in ['visitor','user','org','admin']:
 for p in (root/portal/'html').glob('*.html'):
  parsed=Page(p.read_text());pages.append(p)
  duplicates.extend((str(p.relative_to(root)),k,n) for k,n in Counter(parsed.ids).items() if n>1)
  for link in parsed.paths:
   name=urlsplit(link).path
   target=root/name.lstrip('/') if name.startswith('/') else p.parent/name
   if name and not target.exists():missing.append((str(p.relative_to(root)),link))
for p in root.rglob('*.js'):
 if '.git' in p.parts:continue
 r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 if r.returncode:syntax.append((str(p.relative_to(root)),r.stderr))
result={'pages':len(pages),'missingLocalReferences':missing,'duplicateIds':duplicates,'javascriptSyntaxErrors':syntax}
(root/'docs'/'interaction-structural-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'pages':len(pages),'missingLocalReferences':len(missing),'duplicateIds':len(duplicates),'javascriptSyntaxErrors':len(syntax)}))
