sap.ui.define([
	"projectops/util/PortfolioCalculations"
], function (PortfolioCalculations) {
	"use strict";

	QUnit.module("PortfolioCalculations");

	QUnit.test("deriveMilestoneStatus returns Completed regardless of due date once status is Completed", function (assert) {
		var oMilestone = { status: "Completed", dueDate: "2020-01-01" };
		assert.strictEqual(PortfolioCalculations.deriveMilestoneStatus(oMilestone, new Date(2026, 7, 15)), "Completed");
	});

	QUnit.test("deriveMilestoneStatus returns Overdue for a past due date that is not completed", function (assert) {
		var oMilestone = { status: "In Progress", dueDate: "2026-01-01" };
		assert.strictEqual(PortfolioCalculations.deriveMilestoneStatus(oMilestone, new Date(2026, 7, 15)), "Overdue");
	});

	QUnit.test("deriveMilestoneStatus returns AtRisk for a future due date flagged at risk", function (assert) {
		var oMilestone = { status: "Not Started", dueDate: "2026-09-01", riskFlag: true };
		assert.strictEqual(PortfolioCalculations.deriveMilestoneStatus(oMilestone, new Date(2026, 7, 15)), "AtRisk");
	});

	QUnit.test("deriveMilestoneStatus returns Upcoming for a future due date with no risk flag", function (assert) {
		var oMilestone = { status: "Not Started", dueDate: "2026-09-01" };
		assert.strictEqual(PortfolioCalculations.deriveMilestoneStatus(oMilestone, new Date(2026, 7, 15)), "Upcoming");
	});

	QUnit.test("deriveMilestoneStatus treats a milestone due today as not yet overdue", function (assert) {
		var oMilestone = { status: "In Progress", dueDate: "2026-08-15" };
		assert.strictEqual(PortfolioCalculations.deriveMilestoneStatus(oMilestone, new Date(2026, 7, 15)), "Upcoming");
	});

	QUnit.test("isMilestoneOverdue reflects the derived status", function (assert) {
		var dToday = new Date(2026, 7, 15);
		assert.strictEqual(PortfolioCalculations.isMilestoneOverdue({ status: "Not Started", dueDate: "2026-08-01" }, dToday), true);
		assert.strictEqual(PortfolioCalculations.isMilestoneOverdue({ status: "Completed", dueDate: "2026-08-01" }, dToday), false);
	});

	QUnit.test("countActiveProjects counts only projects with status Active", function (assert) {
		var aProjects = [{ status: "Active" }, { status: "On Hold" }, { status: "Active" }, { status: "Completed" }];
		assert.strictEqual(PortfolioCalculations.countActiveProjects(aProjects), 2);
	});

	QUnit.test("countProjectsAtRisk only counts At Risk health among ongoing (Active/On Hold) projects", function (assert) {
		var aProjects = [
			{ status: "Active", health: "At Risk" },
			{ status: "Completed", health: "At Risk" },
			{ status: "On Hold", health: "At Risk" },
			{ status: "Active", health: "Healthy" }
		];
		assert.strictEqual(PortfolioCalculations.countProjectsAtRisk(aProjects), 2);
	});

	QUnit.test("countOpenRisks excludes Closed risks", function (assert) {
		var aRisks = [{ status: "Open" }, { status: "Mitigating" }, { status: "Monitoring" }, { status: "Closed" }];
		assert.strictEqual(PortfolioCalculations.countOpenRisks(aRisks), 3);
	});

	QUnit.test("countUpcomingMilestones respects the day window and excludes overdue/completed items", function (assert) {
		var dToday = new Date(2026, 7, 15);
		var aMilestones = [
			{ status: "Not Started", dueDate: "2026-08-20" },
			{ status: "Not Started", dueDate: "2026-10-01" },
			{ status: "Completed", dueDate: "2026-08-16" },
			{ status: "Not Started", dueDate: "2026-08-01" }
		];
		assert.strictEqual(PortfolioCalculations.countUpcomingMilestones(aMilestones, dToday, 30), 1);
	});

	QUnit.test("computeHealthSummary only counts ongoing (Active/On Hold) projects", function (assert) {
		var aProjects = [
			{ status: "Active", health: "Healthy" },
			{ status: "On Hold", health: "Attention" },
			{ status: "Completed", health: "Healthy" },
			{ status: "Active", health: "At Risk" }
		];
		var oSummary = PortfolioCalculations.computeHealthSummary(aProjects);
		assert.strictEqual(oSummary.Healthy, 1);
		assert.strictEqual(oSummary.Attention, 1);
		assert.strictEqual(oSummary["At Risk"], 1);
		assert.strictEqual(oSummary.total, 3);
	});

	QUnit.test("computeRiskSeveritySummary excludes Closed risks", function (assert) {
		var aRisks = [
			{ severity: "High", status: "Open" },
			{ severity: "High", status: "Closed" },
			{ severity: "Critical", status: "Mitigating" }
		];
		var oSummary = PortfolioCalculations.computeRiskSeveritySummary(aRisks);
		assert.strictEqual(oSummary.High, 1);
		assert.strictEqual(oSummary.Critical, 1);
		assert.strictEqual(oSummary.total, 2);
	});

	QUnit.test("getUpcomingMilestones sorts by nearest due date and honors the limit", function (assert) {
		var dToday = new Date(2026, 7, 15);
		var aMilestones = [
			{ milestoneId: "A", status: "Not Started", dueDate: "2026-09-01" },
			{ milestoneId: "B", status: "Not Started", dueDate: "2026-08-20" },
			{ milestoneId: "C", status: "Completed", dueDate: "2026-08-16" },
			{ milestoneId: "D", status: "Not Started", dueDate: "2026-08-25" }
		];
		var aResult = PortfolioCalculations.getUpcomingMilestones(aMilestones, dToday, 2);
		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0].milestoneId, "B");
		assert.strictEqual(aResult[1].milestoneId, "D");
	});

	QUnit.test("getRecentActivity sorts newest first and honors the limit", function (assert) {
		var aActivities = [
			{ id: "1", timestamp: "2026-08-01T10:00:00" },
			{ id: "2", timestamp: "2026-08-10T10:00:00" },
			{ id: "3", timestamp: "2026-08-05T10:00:00" }
		];
		var aResult = PortfolioCalculations.getRecentActivity(aActivities, 2);
		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0].id, "2");
		assert.strictEqual(aResult[1].id, "3");
	});

	QUnit.test("countOpenRisksForProject scopes to a single project and excludes Closed", function (assert) {
		var aRisks = [
			{ projectId: "P1", status: "Open" },
			{ projectId: "P1", status: "Closed" },
			{ projectId: "P2", status: "Open" }
		];
		assert.strictEqual(PortfolioCalculations.countOpenRisksForProject(aRisks, "P1"), 1);
	});
});
