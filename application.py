#!/usr/bin/env python
# all the imports

import os
import sys
from flask import Flask, request, render_template, url_for
from rsted.html import rst2html as _rst2html

from flaskext.helpers import render_html

# handle relative path references by changing to project directory
run_from = os.path.dirname(os.path.abspath(sys.argv[0]))
if run_from != os.path.curdir:
    os.chdir(run_from)

app = Flask(__name__)
app.config.from_pyfile(os.environ.get('RSTED_CONF', 'settings.py'))


def view_is_active(view_name):
    if request.path == url_for(view_name):
        return 'active'
    return ''


@app.context_processor
def ctx_pro():
    return {
        'MEDIA_URL': '/static/',
        'is_active': view_is_active
    }


@app.route("/")
@render_html('index.html')
def index():
    yield 'js_params', {'theme': request.args.get('theme', '')}


@app.route('/about/')
def about():
    return render_template('about.html')


@app.route('/srv/rst2html/', methods=['POST', 'GET'])
def rst2html():
    rst = request.form.get('rst', '')
    theme = request.form.get('theme')
    if theme == 'basic':
        theme = None
    html = _rst2html(rst, theme=theme)
    return html


if __name__ == '__main__':
    app.run(host=app.config.get('HOST', '0.0.0.0'),
            port=app.config.get('PORT', 5000))
