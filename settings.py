
# configuration
DEBUG = True

RUN_PATH = 'var/run'
PID_FILE = 'fastcgi.pid'
SOCKET_FILE = 'rsted.sock'
FCGI_UMASK = '000' # you can override this in settings_local.py if you wish

try:
    from settings_local import *
except ImportError:
    pass
