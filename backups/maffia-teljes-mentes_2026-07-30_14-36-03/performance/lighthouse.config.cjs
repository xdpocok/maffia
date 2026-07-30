module.exports = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["performance", "accessibility", "best-practices"],
    formFactor: "desktop",
    screenEmulation: { mobile: false, width: 1680, height: 1000, deviceScaleFactor: 1, disabled: false },
    throttlingMethod: "simulate",
  },
};
