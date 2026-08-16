sap.ui.define([
	"./PortfolioCalculations"
], function (PortfolioCalculations) {
	"use strict";

	/**
	 * @param {Array<object>} aList
	 * @param {string} sKey
	 * @returns {Object<string, object>}
	 */
	function indexBy(aList, sKey) {
		var mIndex = {};
		(aList || []).forEach(function (oItem) {
			mIndex[oItem[sKey]] = oItem;
		});
		return mIndex;
	}

	/**
	 * Joins the normalized local datasets into view-ready, denormalized structures —
	 * analogous to what an OData V4 service would return via $expand. Keeping this join
	 * logic here (rather than in controllers or views) means the presentation layer can be
	 * pointed at a real OData service later without being rewritten.
	 */
	var PortfolioRepository = {

		/**
		 * @param {object} oData raw {customers, people, projects, milestones, deliverables, risks, activities}
		 * @returns {Array<object>} projects annotated with customerName, projectManagerName, openRisksCount
		 */
		expandProjects: function (oData) {
			var mCustomers = indexBy(oData.customers, "customerId");
			var mPeople = indexBy(oData.people, "personId");

			return (oData.projects || []).map(function (oProject) {
				var oCustomer = mCustomers[oProject.customerId];
				var oManager = mPeople[oProject.projectManagerId];
				return Object.assign({}, oProject, {
					customerName: oCustomer ? oCustomer.name : "",
					projectManagerName: oManager ? oManager.name : "",
					openRisksCount: PortfolioCalculations.countOpenRisksForProject(oData.risks, oProject.projectId)
				});
			});
		},

		/**
		 * @param {object} oData raw dataset
		 * @param {Date} dToday reference date for derived status
		 * @returns {Array<object>} milestones annotated with projectName, ownerName, derivedStatus
		 */
		expandMilestones: function (oData, dToday) {
			var mProjects = indexBy(oData.projects, "projectId");
			var mPeople = indexBy(oData.people, "personId");

			return (oData.milestones || []).map(function (oMilestone) {
				var oProject = mProjects[oMilestone.projectId];
				var oOwner = mPeople[oMilestone.ownerId];
				return Object.assign({}, oMilestone, {
					projectName: oProject ? oProject.name : "",
					ownerName: oOwner ? oOwner.name : "",
					derivedStatus: PortfolioCalculations.deriveMilestoneStatus(oMilestone, dToday)
				});
			});
		},

		/**
		 * @param {object} oData raw dataset
		 * @returns {Array<object>} risks annotated with projectName, ownerName
		 */
		expandRisks: function (oData) {
			var mProjects = indexBy(oData.projects, "projectId");
			var mPeople = indexBy(oData.people, "personId");

			return (oData.risks || []).map(function (oRisk) {
				var oProject = mProjects[oRisk.projectId];
				var oOwner = mPeople[oRisk.ownerId];
				return Object.assign({}, oRisk, {
					projectName: oProject ? oProject.name : "",
					ownerName: oOwner ? oOwner.name : ""
				});
			});
		},

		/**
		 * @param {object} oData raw dataset
		 * @returns {Array<object>} deliverables annotated with projectName, ownerName
		 */
		expandDeliverables: function (oData) {
			var mProjects = indexBy(oData.projects, "projectId");
			var mPeople = indexBy(oData.people, "personId");

			return (oData.deliverables || []).map(function (oDeliverable) {
				var oProject = mProjects[oDeliverable.projectId];
				var oOwner = mPeople[oDeliverable.ownerId];
				return Object.assign({}, oDeliverable, {
					projectName: oProject ? oProject.name : "",
					ownerName: oOwner ? oOwner.name : ""
				});
			});
		},

		/**
		 * @param {object} oData raw dataset
		 * @returns {Array<object>} activities annotated with projectName, actorName
		 */
		expandActivities: function (oData) {
			var mProjects = indexBy(oData.projects, "projectId");
			var mPeople = indexBy(oData.people, "personId");

			return (oData.activities || []).map(function (oActivity) {
				var oProject = mProjects[oActivity.projectId];
				var oActor = mPeople[oActivity.actorId];
				return Object.assign({}, oActivity, {
					projectName: oProject ? oProject.name : "",
					actorName: oActor ? oActor.name : ""
				});
			});
		},

		/**
		 * Assembles the full detail view-model for a single project.
		 * @param {object} oData raw dataset
		 * @param {string} sProjectId
		 * @param {Date} dToday reference date for derived status
		 * @returns {object|null} expanded project with team, milestones, deliverables, risks, activities
		 */
		getProjectDetail: function (oData, sProjectId, dToday) {
			var aProjects = PortfolioRepository.expandProjects(oData);
			var oProject = aProjects.filter(function (p) { return p.projectId === sProjectId; })[0];
			if (!oProject) {
				return null;
			}

			var mPeople = indexBy(oData.people, "personId");
			var aTeam = (oProject.teamMemberIds || []).map(function (sPersonId) {
				return mPeople[sPersonId];
			}).filter(Boolean);

			var byProject = function (oItem) { return oItem.projectId === sProjectId; };

			return Object.assign({}, oProject, {
				team: aTeam,
				milestones: PortfolioRepository.expandMilestones(oData, dToday).filter(byProject),
				deliverables: PortfolioRepository.expandDeliverables(oData).filter(byProject),
				risks: PortfolioRepository.expandRisks(oData).filter(byProject),
				activities: PortfolioCalculations.getRecentActivity(
					PortfolioRepository.expandActivities(oData).filter(byProject),
					20
				)
			});
		},

		/**
		 * Assembles the dashboard view-model from source data via PortfolioCalculations.
		 * @param {object} oData raw dataset
		 * @param {Date} dToday reference date for derived status
		 * @returns {object} dashboard KPIs, health summary, risk summary, upcoming milestones, recent activity
		 */
		getDashboardData: function (oData, dToday) {
			var aProjects = PortfolioRepository.expandProjects(oData);
			var aMilestones = PortfolioRepository.expandMilestones(oData, dToday);
			var aActivities = PortfolioRepository.expandActivities(oData);

			return {
				kpis: {
					activeProjects: PortfolioCalculations.countActiveProjects(oData.projects),
					projectsAtRisk: PortfolioCalculations.countProjectsAtRisk(oData.projects),
					upcomingMilestones: PortfolioCalculations.countUpcomingMilestones(oData.milestones, dToday),
					openRisks: PortfolioCalculations.countOpenRisks(oData.risks)
				},
				healthSummary: PortfolioCalculations.computeHealthSummary(oData.projects),
				riskSummary: PortfolioCalculations.computeRiskSeveritySummary(oData.risks),
				upcomingMilestones: PortfolioCalculations.getUpcomingMilestones(aMilestones, dToday, 5),
				recentActivity: PortfolioCalculations.getRecentActivity(aActivities, 6),
				projects: aProjects
			};
		}
	};

	return PortfolioRepository;
});
