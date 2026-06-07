#!/usr/bin/env python3
"""Convert _tmp_NN.json files in a week directory into NN-<slug>.md files."""
import json, re, sys
from pathlib import Path

def main(week_dir):
    d = Path(week_dir)
    items = json.loads((d / '_items.json').read_text())
    for item in items:
        n = item['slug'].split('-', 1)[0]
        tmp = d / f'_tmp_{n}.json'
        if not tmp.exists():
            print(f'skip {item["slug"]} (no tmp)'); continue
        data = json.loads(tmp.read_text())
        title = data.get('title', '')
        text = data.get('text', '')
        # add sentence breaks for reading body (no breaks for transcript = already line-broken)
        if item['type'] == 'supplement':
            text = re.sub(r'(\.) ([A-Z])', r'\1\n\n\2', text)
        out = d / f'{item["slug"]}.md'
        ttype = 'Reading' if item['type'] == 'supplement' else 'Video transcript'
        with out.open('w') as f:
            f.write(f"# {title}\n\nSource: {item['url']}\nType: {ttype}\n\n---\n\n{text.strip()}\n")
        print(f'saved {out.name} ({len(text)} chars)')

if __name__ == '__main__':
    main(sys.argv[1])
