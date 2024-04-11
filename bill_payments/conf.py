import os

from sendr_settings import Config

overwrite_file = os.environ.get('BILL_PAYMENTS_EXTRA_CONFIG_FILE', '/config/local/settings.py')
settings = Config.load_from_env('resfs/file/settings', overwrite_file=overwrite_file)
