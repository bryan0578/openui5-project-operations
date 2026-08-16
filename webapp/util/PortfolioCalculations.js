sap.ui.define([], function () {
	"use strict";

	var OPEN_RISK_STATUSES = ["Open", "Mitigating", "Monitoring"];
	var ACTIVE_PROJECT_STATUSES = ["Active", "On Hold"];
	var DEFAULT_UPCOMING_WINDOW_DAYS = 30;

	/**
	 * Strips the time portion so date-only comparisons are not affected by time-of-day.
	 * @param {Date} oDate
	 * @returns {Date}
	 */
	function startOfDay(oDate) {
		return new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
	}

	function daysBetween(dFrom, dTo) {
		var MS_PER_DAY = 24 * 60 * 60 * 1000;
		return Math.round((startOfDay(dTo) - startOfDay(dFrom)) / MS_PER_DAY);
	}

	/**
	 * Business logic and dashboard calculations, kept free of UI5 controls so it can be
	 * unit tested in isolation and reused if the data source changes (e.g. to OData).
	 */
	var PortfolioCalculations = {

		/**
		 * Derives a milestone's display status from its stored status and due date rather than
		 * storing "Overdue" as a separate, potentially contradictory, persisted value.
		 * @param {object} oMilestone must contain {status, dueDate, riskFlag}
		 * @param {Date} dToday reference date, injected for testability
		 * @returns {"Completed"|"Overdue"|"AtRisk"|"Upcoming"}
		 */
		deriveMilestoneStatus: function (oMilestone, dToday) {
			if (!oMilestone || !oMilestone.dueDate) {
				return "Upcoming";
			}
			if (oMilestone.status === "Completed") {
				return "Completed";
			}
			var bOverdue = daysBetween(dToday, new Date(oMilestone.dueDate)) < 0;
			if (bOverdue) {
				return "Overdue";
			}
			if (oMilestone.riskFlag) {
				return "AtRisk";
			}
			return "Upcoming";
		},

		/**
		 * @param {object} oMilestone
		 * @param {Date} dToday
		 * @returns {boolean}
		 */
		isMilestoneOverdue: function (oMilestone, dToday) {
			return PortfolioCalculations.deriveMilestoneStatus(oMilestone, dToday) === "Overdue";
		},

		/**
		 * @param {Array<object>} aProjects
		 * @returns {number} count of projects currently in an active engagement status
		 */
		countActiveProjects: function (aProjects) {
			return (aProjects || []).filter(function (oProject) {
				return oProject.status === "Active";
			}).length;
		},

		/**
		 * @param {Array<object>} aProjects
		 * @returns {number} count of projects flagged "At Risk" that are still ongoing
		 */
		countProjectsAtRisk: function (aProjects) {
			return (aProjects || []).filter(function (oProject) {
				return oProject.health === "At Risk" && ACTIVE_PROJECT_STATUSES.indexOf(oProject.status) !== -1;
			}).length;
		},

		/**
		 * @param {Array<object>} aRisks
		 * @returns {number} risks not yet closed
		 */
		countOpenRisks: function (aRisks) {
			return (aRisks || []).filter(function (oRisk) {
				return OPEN_RISK_STATUSES.indexOf(oRisk.status) !== -1;
			}).length;
		},

		/**
		 * @param {Array<object>} aMilestones
		 * @param {Date} dToday
		 * @param {number} [iWindowDays=30]
		 * @returns {number} milestones due within the window that are not completed or overdue
		 */
		countUpcomingMilestones: function (aMilestones, dToday, iWindowDays) {
			var iWindow = iWindowDays === undefined ? DEFAULT_UPCOMING_WINDOW_DAYS : iWindowDays;
			return (aMilestones || []).filter(function (oMilestone) {
				var sDerived = PortfolioCalculations.deriveMilestoneStatus(oMilestone, dToday);
				if (sDerived !== "Upcoming" && sDerived !== "AtRisk") {
					return false;
				}
				var iDays = daysBetween(dToday, new Date(oMilestone.dueDate));
				return iDays >= 0 && iDays <= iWindow;
			}).length;
		},

		/**
		 * @param {Array<object>} aMilestones
		 * @param {Date} dToday
		 * @param {number} [iLimit=5]
		 * @returns {Array<object>} nearest-due upcoming/at-risk milestones, each annotated with derivedStatus
		 */
		getUpcomingMilestones: function (aMilestones, dToday, iLimit) {
			var iMax = iLimit === undefined ? 5 : iLimit;
			return (aMilestones || [])
				.map(function (oMilestone) {
					return Object.assign({}, oMilestone, {
						derivedStatus: PortfolioCalculations.deriveMilestoneStatus(oMilestone, dToday)
					});
				})
				.filter(function (oMilestone) {
					return oMilestone.derivedStatus === "Upcoming" || oMilestone.derivedStatus === "AtRisk";
				})
				.sort(function (a, b) {
					return new Date(a.dueDate) - new Date(b.dueDate);
				})
				.slice(0, iMax);
		},

		/**
		 * @param {Array<object>} aActivities each with {timestamp}
		 * @param {number} [iLimit=6]
		 * @returns {Array<object>} most recent activities first
		 */
		getRecentActivity: function (aActivities, iLimit) {
			var iMax = iLimit === undefined ? 6 : iLimit;
			return (aActivities || [])
				.slice()
				.sort(function (a, b) {
					return new Date(b.timestamp) - new Date(a.timestamp);
				})
				.slice(0, iMax);
		},

		/**
		 * Summarizes portfolio health across ongoing (Active / On Hold) projects.
		 * @param {Array<object>} aProjects
		 * @returns {{Healthy: number, Attention: number, "At Risk": number, total: number}}
		 */
		computeHealthSummary: function (aProjects) {
			var oSummary = { "Healthy": 0, "Attention": 0, "At Risk": 0, total: 0 };
			(aProjects || []).forEach(function (oProject) {
				if (ACTIVE_PROJECT_STATUSES.indexOf(oProject.status) === -1) {
					return;
				}
				if (Object.prototype.hasOwnProperty.call(oSummary, oProject.health)) {
					oSummary[oProject.health]++;
					oSummary.total++;
				}
			});
			return oSummary;
		},

		/**
		 * Summarizes open (non-closed) risks by severity across the portfolio.
		 * @param {Array<object>} aRisks
		 * @returns {{Low: number, Medium: number, High: number, Critical: number, total: number}}
		 */
		computeRiskSeveritySummary: function (aRisks) {
			var oSummary = { "Low": 0, "Medium": 0, "High": 0, "Critical": 0, total: 0 };
			(aRisks || []).forEach(function (oRisk) {
				if (OPEN_RISK_STATUSES.indexOf(oRisk.status) === -1) {
					return;
				}
				if (Object.prototype.hasOwnProperty.call(oSummary, oRisk.severity)) {
					oSummary[oRisk.severity]++;
					oSummary.total++;
				}
			});
			return oSummary;
		},

		/**
		 * @param {Array<object>} aRisks
		 * @param {string} sProjectId
		 * @returns {number} open risks belonging to the given project
		 */
		countOpenRisksForProject: function (aRisks, sProjectId) {
			return (aRisks || []).filter(function (oRisk) {
				return oRisk.projectId === sProjectId && OPEN_RISK_STATUSES.indexOf(oRisk.status) !== -1;
			}).length;
		}
	};

	return PortfolioCalculations;
});
