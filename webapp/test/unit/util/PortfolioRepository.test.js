sap.ui.define([
	"projectops/util/PortfolioRepository"
], function (PortfolioRepository) {
	"use strict";

	QUnit.module("PortfolioRepository", {
		beforeEach: function () {
			this.oData = {
				customers: [{ customerId: "C1", name: "Acme Co" }],
				people: [
					{ personId: "P1", name: "Jane Doe", role: "Project Manager" },
					{ personId: "P2", name: "John Roe", role: "Business Analyst" }
				],
				projects: [{
					projectId: "PRJ1",
					name: "Test Project",
					customerId: "C1",
					projectManagerId: "P1",
					status: "Active",
					health: "Healthy",
					teamMemberIds: ["P1", "P2"]
				}],
				milestones: [{
					milestoneId: "M1", projectId: "PRJ1", name: "Kickoff", ownerId: "P1",
					dueDate: "2026-01-01", status: "Completed", completionPercent: 100
				}],
				deliverables: [{
					deliverableId: "D1", projectId: "PRJ1", name: "Spec", ownerId: "P2",
					status: "Draft", dueDate: "2026-02-01"
				}],
				risks: [{
					riskId: "R1", projectId: "PRJ1", title: "Risk 1", severity: "High",
					status: "Open", ownerId: "P1"
				}],
				activities: [{
					activityId: "A1", projectId: "PRJ1", description: "Did something",
					timestamp: "2026-01-05T09:00:00", actorId: "P2"
				}]
			};
		}
	});

	QUnit.test("expandProjects joins customer name, manager name, and open risk count", function (assert) {
		var aProjects = PortfolioRepository.expandProjects(this.oData);
		assert.strictEqual(aProjects[0].customerName, "Acme Co");
		assert.strictEqual(aProjects[0].projectManagerName, "Jane Doe");
		assert.strictEqual(aProjects[0].openRisksCount, 1);
	});

	QUnit.test("expandMilestones joins project/owner names and derives status", function (assert) {
		var aMilestones = PortfolioRepository.expandMilestones(this.oData, new Date(2026, 0, 10));
		assert.strictEqual(aMilestones[0].projectName, "Test Project");
		assert.strictEqual(aMilestones[0].ownerName, "Jane Doe");
		assert.strictEqual(aMilestones[0].derivedStatus, "Completed");
	});

	QUnit.test("getProjectDetail assembles team, milestones, deliverables, risks, and activities", function (assert) {
		var oDetail = PortfolioRepository.getProjectDetail(this.oData, "PRJ1", new Date(2026, 0, 10));
		assert.strictEqual(oDetail.team.length, 2);
		assert.strictEqual(oDetail.milestones.length, 1);
		assert.strictEqual(oDetail.milestones[0].derivedStatus, "Completed");
		assert.strictEqual(oDetail.deliverables.length, 1);
		assert.strictEqual(oDetail.risks.length, 1);
		assert.strictEqual(oDetail.activities.length, 1);
	});

	QUnit.test("getProjectDetail returns null for an unknown project id", function (assert) {
		assert.strictEqual(PortfolioRepository.getProjectDetail(this.oData, "UNKNOWN", new Date()), null);
	});

	QUnit.test("getDashboardData computes KPIs from source data", function (assert) {
		var oDashboard = PortfolioRepository.getDashboardData(this.oData, new Date(2026, 0, 10));
		assert.strictEqual(oDashboard.kpis.activeProjects, 1);
		assert.strictEqual(oDashboard.kpis.openRisks, 1);
	});
});
