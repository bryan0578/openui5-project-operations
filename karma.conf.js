process.env.CHROME_BIN = process.env.CHROME_BIN || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

module.exports = function (config) {
  config.set({
    frameworks: ["ui5"],
    ui5: {
      testpage: "webapp/test/unit/unitTests.qunit.html",
      mode: "html",
      failOnEmptyTestPage: true
    },
    browsers: ["ChromeHeadlessNoSandbox"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-gpu"]
      }
    },
    singleRun: true,
    reporters: ["progress"]
  });
};
