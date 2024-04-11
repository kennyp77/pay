#!/usr/bin/python
# -*- coding: utf-8 -*-

import random

# Keep this script self-contained
#from baluhn import generate, verify


decimal_decoder = lambda s: int(s, 10)
decimal_encoder = lambda i: str(i)

class Utils(object):
    @staticmethod
    def luhn_sum_mod_base(s):
        # Adapted from http://en.wikipedia.org/wiki/Luhn_algorithm
        digits = [int(c) for c in s]
        b = 10
        return (sum(digits[::-2]) +
                sum(sum(divmod(2 * d, b)) for d in digits[-2::-2])) % b

    @staticmethod
    def verify(s):
        return Utils.luhn_sum_mod_base(s) == 0

    @staticmethod
    def generate(s):
        d = Utils.luhn_sum_mod_base(s + '0')
        if d != 0:
            d = 10 - d
        return str(d)

    @staticmethod
    def generate_pan(pan_len=16):
        prefix = '510000'  # not to mess with real world cards
        base = prefix + str(random.randint(
            10 ** (pan_len - len(prefix) - 2),
            10 ** (pan_len - len(prefix) - 1) - 1))
        pan = base + Utils.generate(base)
        assert Utils.verify(pan)
        return pan


def main():
    print(Utils.generate_pan())

if __name__ == '__main__':
    main()

# vim:ts=4:sts=4:sw=4:tw=85:et:
