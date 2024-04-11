__version__ = 'undefined'

try:
    with open('/version.txt', 'r') as f:
        __version__ = f.read()
except Exception:
    pass
