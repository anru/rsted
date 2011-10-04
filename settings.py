
# configuration
DEBUG = True
RST2HTML_CMD = 'rst2html.py'
RST2PDF_CMD = 'rst2pdf'

try:
    from settings_local import *
except ImportError:
    pass
