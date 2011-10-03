from functools import wraps
from types import GeneratorType

from flask import render_template


def render_html(template):
    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            result = func(*args, **kwargs)

            if isinstance(result, GeneratorType):
                variables = {}
                for i in result:
                    name, value = i
                    variables[name] = value
            else:
                variables = result

            return render_template(template, **variables)
        return wrapped
    return decorator