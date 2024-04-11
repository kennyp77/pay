import yapayPayBlackRed from '../assets/yapay-pay-black-red.svg';
import yapayPayWhiteRed from '../assets/yapay-pay-white-red.svg';
import yapaySimpleBlackRed from '../assets/yapay-simple-black-red.svg';
import yapaySimpleWhiteRed from '../assets/yapay-simple-white-red.svg';

interface StyleOptions {
    baseClass: string;
    assetsUrl: string;
}

const prepareCss = (css: string): string =>
    css
        .replace(/[\r\n\t]+/gm, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/ ?([{:;,!}]) ?/g, '$1')
        .trim();

// последний стиль в baseClass - fix дёрганья на safari

export const getMainStyle = ({ assetsUrl, baseClass }: StyleOptions): string =>
    prepareCss(`
  .${baseClass} {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    height: 54px;
    min-width: 282px;
    padding: 14px 28px;
    overflow: hidden;
    background-origin: content-box;
    background-position: center center;
    background-repeat: no-repeat;
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
    border-radius: 8px;
    user-select: none;
    cursor: pointer;
    transition: opacity 150ms linear, filter 150ms linear, background-color 150ms linear;

    transform: translate3d(0, 0, 0);
  }

  .${baseClass}:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 3px rgb(255 56 21 / 50%);
  }

  .${baseClass}_theme_white,
  .${baseClass}_theme_white-outlined {
    background-color: #ffffff;
  }

  .${baseClass}_theme_white-outlined {
    border-color: #000000;
  }

  .${baseClass}_theme_white:hover,
  .${baseClass}_theme_white:active,
  .${baseClass}_theme_white-outlined:hover,
  .${baseClass}_theme_white-outlined:active {
    filter: brightness(0.95);
  }

  .${baseClass}_theme_black {
    background-color: #000000;
  }

  .${baseClass}_theme_black:hover,
  .${baseClass}_theme_black:active {
    opacity: 0.8;
  }

  .${baseClass}_theme_yellow {
    background-color: #ffd633;
  }

  .${baseClass}_theme_yellow:hover,
  .${baseClass}_theme_yellow:active {
    filter: brightness(0.95);
  }

  .${baseClass}_theme_white,
  .${baseClass}_theme_white-outlined {
    background-image: url('${assetsUrl + yapaySimpleBlackRed}');
  }

  .${baseClass}_theme_black {
    background-image: url('${assetsUrl + yapaySimpleWhiteRed}');
  }

  .${baseClass}_theme_yellow {
    background-image: url('${assetsUrl + yapaySimpleBlackRed}');
  }

  .${baseClass}_theme_white.${baseClass}_type_pay,
  .${baseClass}_theme_white-outlined.${baseClass}_type_pay {
    background-image: url('${assetsUrl + yapayPayBlackRed}');
  }

  .${baseClass}_theme_black.${baseClass}_type_pay {
    background-image: url('${assetsUrl + yapayPayWhiteRed}');
  }

  .${baseClass}_theme_yellow.${baseClass}_type_pay {
    background-image: url('${assetsUrl + yapayPayBlackRed}');
  }

  .${baseClass}_personalised {
    position: relative;
    min-height: 40px;
  }

  .${baseClass}_personalised iframe,
  .${baseClass}::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border: 0;
  }

  .${baseClass}_personalised iframe {
    pointer-events: none;
    z-index: 0;
  }

  .${baseClass}_width_max {
    width: 100%;
  }

  .${baseClass}::before {
    content: '';
    z-index: 1;
  }
`);
