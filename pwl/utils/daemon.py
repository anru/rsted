# -*- coding: utf-8 -*-
from __future__ import with_statement
import os
import sys
import errno
import time
import atexit
import signal
from pwl.utils.daemonize import become_daemon


class BaseDaemon(object):
    """
    A generic daemon class.
    Usage: subclass the Daemon class and override the run() method
           for run\start daemon execute start() ( not run method )

    Availability: Unix
    opts: our_home_dir, out_log, err_log, umask
    """
    NO_DAEMONIZE = False
    NO_WRITE_PID = False

    def __init__(self, pidfile, **opts):
        self.opts = opts
        self.pidfile = pidfile

    def daemonize(self):
        if self.NO_DAEMONIZE:
            return

        become_daemon(**self.opts)

        atexit.register(self.delpid)
        signal.signal(signal.SIGTERM, self.handle_sigterm)

        # write pidfile
        if not self.NO_WRITE_PID:
            pid = str(os.getpid())
            open(self.pidfile, 'w').write('%s\n' % pid)


    def handle_sigterm(self, *args):
        self.atkilled(signal.SIGTERM)
        #self.delpid() - handle by atexit

    def atkilled(self, signo):
        pass

    def delpid(self):
        if os.path.exists(self.pidfile):
            try:
                os.unlink(self.pidfile)
            except:
                pass
    
    def readpid(self):
        try:
            with open(self.pidfile, 'r') as pf:
                return int(pf.read().strip())
        except IOError:
            pass

    def start(self, *args, **kwargs):
        """
        Start the daemon
        """

        # Check for a pidfile to see if the daemon already runs
        pid = self.readpid()

        if pid:
            message = 'pidfile %s already exist. Daemon already running?\n' % self.pidfile
            sys.stderr.write(message)
            sys.exit(1)

        self.daemonize()
        self.run(*args, **kwargs)

    def stop(self):
        """
        Stop the daemon
        """

        # Get the pid from the pidfile
        pid = self.readpid()
        
        if not pid:
            message = 'pidfile %s does not exist. Daemon not running?\n' % self.pidfile
            sys.stderr.write(message)
            return   # not an error in a restart

        # Try killing the daemon process
        try:
            while 1:
                os.kill(pid, signal.SIGTERM)  # @UndefinedVariable
                time.sleep(0.1)
        except OSError, err:
            error_code = getattr(err, 'code', err.errno)
            if error_code == errno.ESRCH:  # No such process
                self.delpid()
            else:
                print >> sys.stderr, str(err)
                sys.exit(1)

    def restart(self, *args, **kwargs):
        """
        Restart the daemon
        """

        self.stop()
        self.start(*args, **kwargs)

    def run(self):
        """
        You should override this method when you subclass Daemon. It will be called after the process has been
        daemonized by start() or restart().
        """

        raise NotImplementedError

