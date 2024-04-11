#!/usr/bin/env python3
# encoding: utf-8

import os
import shutil
import filecmp
import subprocess
import datetime


CONFIG_DIR = "/etc/nginx/sites-available"
COMPONENTS = ["web-service-backend"]

def create_config_files():
    for name in COMPONENTS:
        local_port = int(os.environ.get('DUFFMAN_BASEPORT'))
        local_threads = int(os.environ.get('DUFFMAN_WORKERS'))

        if local_port == None:
            print('[ERROR] No service ports defined in config')
            exit(1)

        config_file = CONFIG_DIR + '/' + name + '.include.new'

        try:
            with open(config_file, 'w') as f:
                port = local_port

                f.write('upstream ' + name + ' {\n    least_conn;\n')

                if local_threads is not None:
                    while port < local_port + local_threads:
                        f.write('    server [::1]:' + str(port) + ' max_fails=0;\n')
                        port += 1
                else:
                    f.write('    server [::1]:' + str(port) + ' max_fails=0;\n')

                f.write('}\n')

            print('[INFO] Successfully created ' + config_file)
        except Exception as e:
            print('[ERROR] Something went wrong:')
            print(e)
            exit(1)
    return


def compare_files(src_postfix, dst_postfix):
    for name in COMPONENTS:
        config_basename = CONFIG_DIR + '/' + name
        src_config = config_basename + src_postfix
        dst_config = config_basename + dst_postfix

        eq = filecmp.cmp(src_config, dst_config, shallow=False)
        if eq is False:
            return False
        else:
            continue
    return True


def copy_configs(src_postfix, dst_postfix):
    for name in COMPONENTS:
        config_basename = CONFIG_DIR + '/' + name
        src_config = config_basename + src_postfix
        dst_config = config_basename + dst_postfix

        try:
            shutil.copyfile(src_config, dst_config)
            print('[INFO] Copied ' + src_postfix + ' to ' + dst_postfix + ' for ' + str(name))
        except shutil.Error as e:
            print('[ERROR] Something went wrong:')
            print(e)
            exit(1)
    return


def check_configs():
    process = subprocess.Popen(['nginx', '-t'],
                              stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE)
    output = ' '.join(map(str, process.communicate()))

    if 'test is successful' in output:
        print('[INFO] Nginx config test successful')
    else:
        print('[ERROR] Nginx config test failed')
        copy_configs('.include.bak', '.include')
        exit(1)

if __name__ == '__main__':
    print(str(datetime.datetime.now()))
    print('[INFO] Started')

    create_config_files()
    configs_equal = compare_files('.include', '.include.new')

    if configs_equal is False:
        print('[INFO] Found changes in config files')
        copy_configs('.include', '.include.bak')
        copy_configs('.include.new', '.include')
        check_configs()
    else:
        print('[INFO] No changes in config files')

    print('[INFO] All done')
