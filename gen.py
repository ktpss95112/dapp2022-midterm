import sys
from jinja2 import Template

if len(sys.argv) == 1:
  print(f'usage: python3 {__file__} text_file [text_file ...]')
  exit(1)

for filename in sys.argv[1:]:
  lines = open(filename, 'r').read().strip().split('\n')
  imgs = [(url, img) for url, img in zip(lines[0::2], lines[1::2])]

  t = Template('''
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>{{filename}}</title>
    </head>
    <body>
      <div style="display: flex; flex-wrap: wrap">
        {% for url, img in imgs %}
          <div style="border: solid; padding: 5px">
            <a href="{{url}}" target="_blank">{{url}}</a></br>
            <img src="{{img}}" style="width: 20vw">
          </div>
        {% endfor %}
      </div>
    </body>
  </html>
  ''')

  open(f'{filename}.html', 'w').write(t.render(imgs=imgs, filename=filename))
