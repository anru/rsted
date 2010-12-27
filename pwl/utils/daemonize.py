
import os
import sys
import signal

def become_daemon(our_home_dir='.', out_log='/dev/null', err_log='/dev/null', umask=022):
    '''Robustly turn into a UNIX daemon, running in our_home_dir.'''

    #  On some systems, the fork() system call resets some of the
    #  signal handler, so save them here.
    #  Esp. linux uses SIGUSR1 in the pthread library.
    usr1 = signal.signal(signal.SIGUSR1, signal.SIG_IGN)

    # First fork
    try:
        if os.fork() > 0:
            sys.exit(0)  # kill off parent
    except OSError, e:
        sys.stderr.write('fork #1 failed: (%d) %s\n' % (e.errno, e.strerror))
        sys.exit(1)
    os.setsid()
    os.chdir(our_home_dir)
    os.umask(umask)

    # Second fork
    try:
        if os.fork() > 0:
            os._exit(0)
    except OSError, e:
        sys.stderr.write('fork #2 failed: (%d) %s\n' % (e.errno, e.strerror))
        os._exit(1)

    signal.signal(signal.SIGUSR1, usr1)
    si = open('/dev/null', 'r')
    so = open(out_log, 'a+', 0)
    se = open(err_log, 'a+', 0)
    os.dup2(si.fileno(), sys.stdin.fileno())
    os.dup2(so.fileno(), sys.stdout.fileno())
    os.dup2(se.fileno(), sys.stderr.fileno())
    # Set custom file descriptors so that they get proper buffering.
    sys.stdout, sys.stderr = so, se
