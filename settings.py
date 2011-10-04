
# configuration
DEBUG = True

try:
    from settings_local import *
except ImportError:
    pass
