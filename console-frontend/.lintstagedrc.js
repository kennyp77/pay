const path = require('path');

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => {
      return path.relative(process.cwd(), f)
    })
    .join(' --file ')}`;

module.exports = {
  '{src,mocked-api,public}/**/*.{js,jsx,ts,tsx,json}': 'prettier --write',
  '{src,mocked-api,public}/**/*.{js,jsx,ts,tsx}':
    [
      'bash -c tsc -p tsconfig.json --noemit',
      buildEslintCommand,
    ],
  '{src,public}/**/*.scss': 'stylelint "**/*.scss" --fix',
}
