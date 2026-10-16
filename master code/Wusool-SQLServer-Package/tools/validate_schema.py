from pathlib import Path
import json,re,xml.etree.ElementTree as ET
r=Path(__file__).resolve().parents[1];s=json.loads((r/'docs/schema.json').read_text());sql=(r/'sql/01_Create_WusoolDb.sql').read_text();ctx=(r/'src/Wusool.Data/WusoolDbContext.cs').read_text();checks=0
for name,t in s.items():
 cols={c['name']:c for c in t['columns']};assert len(cols)==len(t['columns']);checks+=1
 assert f'CREATE TABLE [dbo].[{name}]' in sql;checks+=1
 assert f'e.ToTable("{name}", "dbo"' in ctx;checks+=1
 for key in [t['key']]+t['alternateKeys']:assert all(k in cols for k in key);checks+=1
 for i,f in enumerate(t['foreignKeys']):
  p=s[f['parent']];pc={c['name']:c for c in p['columns']}
  assert f['parentColumns']==p['key'] or f['parentColumns'] in p['alternateKeys']
  assert len(f['columns'])==len(f['parentColumns'])
  for c,cp in zip(f['columns'],f['parentColumns']):
   assert c in cols and cp in pc
   assert cols[c]['type'].split('(')[0]==pc[cp]['type'].split('(')[0]
   assert cols[c].get('collation')==pc[cp].get('collation')
   checks+=3
  assert f'CONSTRAINT [FK_{name}_{i}]' in sql and f'HasConstraintName("FK_{name}_{i}")' in ctx;checks+=1
 for ix in t['indexes']:assert all(k in cols for k in ix['columns']);checks+=1
 for c in t['columns']:
  if c['name'].endswith('Json'):assert any('ISJSON(['+c['name']+'])' in x for x in t['checks']);checks+=1
 if name.startswith('AspNet') and name!='AspNetUsers':continue
 code=(r/f'src/Wusool.Data/Entities/{t["entity"]}.cs').read_text()
 properties=re.findall(r'public\s+[^\n]+?\s+(\w+)\s*\{\s*get;',code)
 assert len(properties)==len(set(properties)),(name,'duplicate C# properties');checks+=1
ET.parse(r/'src/Wusool.Data/Wusool.Data.csproj');checks+=1
assert 'ON DELETE CASCADE' not in sql;checks+=1
assert 'DROP TABLE' not in sql and 'DROP DATABASE' not in sql;checks+=1
assert 'byte[] RowVersion' in (r/'src/Wusool.Data/Entities/Booking.cs').read_text();checks+=1
assert '.ThenInclude(' in (r/'src/Wusool.Data/WusoolQueries.cs').read_text();checks+=1
report={'tables':len(s),'foreignKeys':sum(len(t['foreignKeys']) for t in s.values()),'staticAssertionsPassed':checks,'sqlServerExecution':'not run: SQL Server unavailable','dotnetBuild':'not run: .NET SDK unavailable','frontendModified':False}
(r/'docs/VALIDATION.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
