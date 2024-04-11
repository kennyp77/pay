const { propertyOrdering } = require("stylelint-semantic-groups");

module.exports = {
  defaultSeverity: "warning",
  plugins: [ "stylelint-scss", "stylelint-order" ],
  extends: [ "stylelint-config-standard-scss" ],
  rules: {
    "scss/at-function-pattern": "^([a-zA-Z][a-zA-Z0-9]*)([-_][a-zA-Z0-9_]+)*$",
    "scss/at-import-partial-extension": null,
    "selector-class-pattern": "^([a-zA-Z][a-zA-Z0-9]*)([-_][a-zA-Z0-9_]+)*$",
    "function-name-case": null,
    "color-function-notation": "legacy",
    "alpha-value-notation": "number",
    "at-rule-empty-line-before": null,
    "selector-pseudo-element-colon-notation": "single",
    "color-hex-length": "long",
    "length-zero-no-unit": [
      true,
      {
        "ignore": ["custom-properties"]
      }
    ],
    "property-no-vendor-prefix": null,
    "string-quotes": "single",
    "custom-property-pattern": "^([a-zA-Z][a-zA-Z0-9]*)([-_][a-zA-Z0-9_]+)*$",
    "order/order": [
      "custom-properties",
      "dollar-variables",
      "at-rules",
      "declarations",
      "rules",
    ],
    "order/properties-order": propertyOrdering,
  }
}
