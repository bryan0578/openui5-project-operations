/**
 * Writes a minimal resources/sap-ui-version.json into the build output.
 *
 * UI5 Tooling's "self-contained" build bundles the framework runtime but does not generate
 * this version-info file (it is normally served by the SAP CDN). Its absence is harmless but
 * produces a 404 and a console error on every page load, so a static stand-in is provided here.
 */
const fs = require("fs");
const path = require("path");

const UI5_VERSION = "1.151.0";
const LIBRARIES = [
	"sap.ui.core",
	"sap.m",
	"sap.f",
	"sap.ui.layout",
	"sap.uxap",
	"sap.ui.unified",
	"themelib_sap_horizon"
];

const sBuildTimestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);

const oVersionInfo = {
	name: "sap.ui.core",
	version: UI5_VERSION,
	buildTimestamp: sBuildTimestamp,
	scmRevision: "",
	gav: `org.openui5:sap.ui.core:${UI5_VERSION}`,
	libraries: LIBRARIES.map((sName) => ({
		name: sName,
		version: UI5_VERSION,
		buildTimestamp: sBuildTimestamp,
		scmRevision: ""
	}))
};

const sDestDir = path.join(__dirname, "..", "dist", "resources");
const sDestFile = path.join(sDestDir, "sap-ui-version.json");

if (!fs.existsSync(sDestDir)) {
	console.warn("postbuild: dist/resources not found, skipping sap-ui-version.json generation");
	process.exit(0);
}

fs.writeFileSync(sDestFile, JSON.stringify(oVersionInfo, null, 2));
console.log("postbuild: wrote " + sDestFile);
