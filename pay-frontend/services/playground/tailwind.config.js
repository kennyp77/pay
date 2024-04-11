module.exports = {
    content: ['./template/**/*.html', './src/**/*.tsx'],
    darkMode: 'media',
    theme: {
        extend: {
            spacing: {
                '4.5': '1.125rem;',
                '10.5': '2.625rem;',
                min: 'min-content',
                max: 'max-content',
            },
            colors: {
                'blue-gray-1900': '#262633',
                'blue-gray-1800': '#333342',
                'blue-gray-1100': '#9397AD',
                'blue-gray-200': '#E6E9F0',
                'blue-gray-100': '#F1F2F5',
                'yellow-700': '#FFDB4D',
                'yellow-900': '#FFCC00',
                'red-700': '#FF4D4D',
                'red-1100': '#E1000F',
                'green-700': '#3BC46D',
                'green-1100': '#009E39',
                'blue-700': '#4DA0FF',
                'blue-900': '#0077FF',
                'blue-1100': '#0066DB',
            },
            fontFamily: {
                sans: ['"YS Text"', 'sans-serif'],
            },
            fontSize: {
                'headline-xl': ['56px', '60px'],
                'headline-l': ['48px', '52px'],
                'headline-m': ['40px', '44px'],
                'headline-s': ['34px', '40px'],
                'headline-xs': ['28px', '32px'],
                //
                'subheader-xl': ['28px', '32px'],
                'subheader-l': ['24px', '28px'],
                'subheader-m': ['20px', '24px'],
                'subheader-s': ['18px', '22px'],
                //
                'body-short-xl': ['18px', '22px'],
                'body-short-l': ['16px', '20px'],
                'body-short-m': ['14px', '18px'],
                'body-short-s': ['13px', '16px'],
                //
                'body-long-xl': ['18px', '24px'],
                'body-long-l': ['16px', '22px'],
                'body-long-m': ['14px', '20px'],
                'body-long-s': ['13px', '18px'],
                //
                'caption-xl': ['13px', '16px'],
                'caption-l': ['12px', '14px'],
                'caption-m': ['11px', '14px'],
            },
            textColor: {
                primary: '#262633',
                secondary: '#9397AD',
                control: '#9397AD',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
