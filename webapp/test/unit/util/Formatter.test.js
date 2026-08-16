sap.ui.define([
	"projectops/util/Formatter"
], function (Formatter) {
	"use strict";

	QUnit.module("Formatter");

	QUnit.test("healthState maps health values to the correct ValueState", function (assert) {
		assert.strictEqual(Formatter.healthState("Healthy"), "Success");
		assert.strictEqual(Formatter.healthState("Attention"), "Warning");
		assert.strictEqual(Formatter.healthState("At Risk"), "Error");
		assert.strictEqual(Formatter.healthState("Unknown"), "None");
	});

	QUnit.test("projectStatusState maps project status values to the correct ValueState", function (assert) {
		assert.strictEqual(Formatter.projectStatusState("Active"), "Success");
		assert.strictEqual(Formatter.projectStatusState("On Hold"), "Warning");
		assert.strictEqual(Formatter.projectStatusState("Completed"), "Information");
		assert.strictEqual(Formatter.projectStatusState("Cancelled"), "Error");
	});

	QUnit.test("riskSeverityState maps severity values to the correct ValueState", function (assert) {
		assert.strictEqual(Formatter.riskSeverityState("Low"), "Success");
		assert.strictEqual(Formatter.riskSeverityState("Medium"), "Warning");
		assert.strictEqual(Formatter.riskSeverityState("High"), "Error");
		assert.strictEqual(Formatter.riskSeverityState("Critical"), "Error");
	});

	QUnit.test("riskStatusState maps risk status values to the correct ValueState", function (assert) {
		assert.strictEqual(Formatter.riskStatusState("Open"), "Error");
		assert.strictEqual(Formatter.riskStatusState("Mitigating"), "Warning");
		assert.strictEqual(Formatter.riskStatusState("Monitoring"), "Information");
		assert.strictEqual(Formatter.riskStatusState("Closed"), "Success");
	});

	QUnit.test("milestoneStatusState maps derived milestone status to the correct ValueState", function (assert) {
		assert.strictEqual(Formatter.milestoneStatusState("Completed"), "Success");
		assert.strictEqual(Formatter.milestoneStatusState("Upcoming"), "Information");
		assert.strictEqual(Formatter.milestoneStatusState("AtRisk"), "Warning");
		assert.strictEqual(Formatter.milestoneStatusState("Overdue"), "Error");
	});

	QUnit.test("formatPercent appends a percent sign and handles empty input", function (assert) {
		assert.strictEqual(Formatter.formatPercent(42), "42%");
		assert.strictEqual(Formatter.formatPercent(0), "0%");
		assert.strictEqual(Formatter.formatPercent(undefined), "");
		assert.strictEqual(Formatter.formatPercent(null), "");
	});

	QUnit.test("formatDate returns an empty string for missing input", function (assert) {
		assert.strictEqual(Formatter.formatDate(""), "");
		assert.strictEqual(Formatter.formatDate(null), "");
	});

	QUnit.test("formatDate formats a valid ISO date string", function (assert) {
		var sResult = Formatter.formatDate("2026-03-15");
		assert.ok(sResult.length > 0, "a formatted date string is returned");
		assert.ok(sResult.indexOf("2026") !== -1, "the formatted date contains the year");
	});
});
