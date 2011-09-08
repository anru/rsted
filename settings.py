
# configuration
DEBUG = True
RST2HRML_CMD = 'rst2html.py'

try:
    from settings_local import *
except ImportError:
    pass
