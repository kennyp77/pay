#!/usr/bin/env python3
# encoding: utf-8

import os
import shutil
import datetime


CONFIG_DIR = "/etc/nginx/sites-available"

SERVICE_ENV = os.environ.get('WEB_SERVICE_ENV')

def find_env_configs():
    configs = []

    for env_name in os.listdir(CONFIG_DIR):
        env_suffix = '.' + SERVICE_ENV + '.include'

        if env_name.endswith(env_suffix):
            base_name = env_name.replace(env_suffix, '.include')
            configs.append([
                os.path.join(CONFIG_DIR, base_name),
                os.path.join(CONFIG_DIR, env_name),
            ])

    return configs

def create_back_configs(configs):
    try:
        for base_config, _ in configs:
            back_config = base_config + '.back'
            shutil.copyfile(base_config, back_config)
            print('[INFO] Create backup for ' + base_config)

    except shutil.Error as e:
        print('[ERROR] Something went wrong:')
        print(e)
        exit(1)


def restore_configs(configs):
    try:
        for base_config, _ in configs:
            back_config = base_config + '.back'

            if os.path.isfile(back_config):
                shutil.copyfile(back_config, base_config)
                print('[INFO] Restore backup config ' + back_config)

    except shutil.Error as e:
        print('[ERROR] Something went wrong:')
        print(e)
        exit(1)

def create_env_configs(configs):
    try:
        for base_config, env_config in configs:
            shutil.copyfile(env_config, base_config)
            print('[INFO] Copy env config ' + env_config + ' to ' + base_config)

    except shutil.Error as e:
        print('[ERROR] Something went wrong:')
        print(e)
        exit(1)


if __name__ == '__main__':
    print('[INFO] Started')

    configs = find_env_configs()

    restore_configs(configs)
    create_back_configs(configs)
    create_env_configs(configs)

    print('[INFO] All done')
