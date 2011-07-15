# -*- coding: utf-8 -*-

#Taken from Python 2.7 with permission from/by the original author.
import sys
import os


def _resolve_name(name, package, level):
    """Return the absolute name of the module to be imported."""

    if not hasattr(package, 'rindex'):
        raise ValueError("'package' not set to a string")
    dot = len(package)
    for x in xrange(level, 1, -1):
        try:
            dot = package.rindex('.', 0, dot)
        except ValueError:
            raise ValueError('attempted relative import beyond top-level package')
    return '%s.%s' % (package[:dot], name)


def import_module(name, package=None):
    """Import a module.

    The 'package' argument is required when performing a relative import. It
    specifies the package to use as the anchor point from which to resolve the
    relative import to an absolute import.

    """

    if name.startswith('.'):
        if not package:
            raise TypeError("relative imports require the 'package' argument")
        level = 0
        for character in name:
            if character != '.':
                break
            level += 1
        name = _resolve_name(name[level:], package, level)
    __import__(name)
    return sys.modules[name]

def import_package_modules(package):
    pkg = import_module(package)
    path = pkg.__path__[0]

    names = [name[:-3] for name in os.listdir(path) if name.endswith('.py') and not name.startswith('_')]
    modules = []

    for name in names:
        module = import_module('.'.join([package, name]))
        modules.append(module)
    return modules


def import_attribute(name):
    """
    Import attribute using string reference.
    Example:
    import_attribute('a.b.c.foo')
    Throws ImportError or AttributeError if module or attribute do not exist.
    """
    i = name.rfind('.')

    module, attr = name[:i], name[i+1:]
    mod = __import__(module, globals(), locals(), [attr])

    return getattr(mod, attr)

