
import os
import sys
from os.path import join as J
#import codecs

from docutils.core import publish_string

#utf8codec = codecs.lookup('utf-8')

# see http://docutils.sourceforge.net/docs/user/config.html
default_rst_opts = {
    'no_generator': True,
    'no_source_link': True,
    'tab_width': 4,
    'file_insertion_enabled': False,
    'raw_enabled': False,
    'stylesheet_path': None,
    'traceback': True,
    'halt_level': 5,
}

def rst2html(rst, theme=None, opts=None):
    rst_opts = default_rst_opts.copy()
    if opts:
        rst_opts.update(opts)
    rst_opts['template'] = 'var/themes/template.txt'

    stylesheets = ['basic.css']
    if theme:
        stylesheets.append('%s/%s.css' % (theme, theme))
    rst_opts['stylesheet'] = ','.join([J('var/themes/', p) for p in stylesheets ])

    out = publish_string(rst, writer_name='html', settings_overrides=rst_opts)

    return out

