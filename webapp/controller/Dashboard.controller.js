sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("projectops.controller.Dashboard", {

		onInit: function () {
			this.getRouter().getRoute("dashboard").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function () {
			this.setActiveNavKey("dashboard");
		},

		onActiveProjectsPress: function () {
			this.getRouter().navTo("projects", { query: { status: "Active" } });
		},

		onProjectsAtRiskPress: function () {
			this.getRouter().navTo("projects", { query: { health: "At Risk" } });
		},

		onUpcomingMilestonesPress: function () {
			this.getRouter().navTo("milestones", { query: { status: "Upcoming" } });
		},

		onOpenRisksPress: function () {
			this.getRouter().navTo("risks", { query: { status: "OpenAll" } });
		},

		onHealthyPress: function () {
			this.getRouter().navTo("projects", { query: { health: "Healthy" } });
		},

		onAttentionPress: function () {
			this.getRouter().navTo("projects", { query: { health: "Attention" } });
		},

		onAtRiskPress: function () {
			this.getRouter().navTo("projects", { query: { health: "At Risk" } });
		},

		onRiskLowPress: function () {
			this.getRouter().navTo("risks", { query: { severity: "Low" } });
		},

		onRiskMediumPress: function () {
			this.getRouter().navTo("risks", { query: { severity: "Medium" } });
		},

		onRiskHighPress: function () {
			this.getRouter().navTo("risks", { query: { severity: "High" } });
		},

		onRiskCriticalPress: function () {
			this.getRouter().navTo("risks", { query: { severity: "Critical" } });
		},

		onViewAllProjectsPress: function () {
			this.getRouter().navTo("projects", { query: {} });
		},

		onViewAllMilestonesPress: function () {
			this.getRouter().navTo("milestones", { query: {} });
		},

		onViewAllRisksPress: function () {
			this.getRouter().navTo("risks", { query: {} });
		},

		onMilestoneItemPress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("portfolio");
			var sProjectId = oContext.getProperty("projectId");
			this.getRouter().navTo("projectDetail", { projectId: sProjectId });
		},

		onActivityItemPress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("portfolio");
			var sProjectId = oContext.getProperty("projectId");
			if (sProjectId) {
				this.getRouter().navTo("projectDetail", { projectId: sProjectId });
			}
		}
	});
});
