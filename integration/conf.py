import os

from sendr_settings import Config

overwrite_file = os.environ.get('PAY_INTEGRATION_CONFIG_FILE', '/config/local/settings.py')
settings = Config.load_from_env('resfs/file/pay/integration/settings', overwrite_file=overwrite_file)
