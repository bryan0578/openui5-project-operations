sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"../util/PortfolioRepository"
], function (JSONModel, Log, PortfolioRepository) {
	"use strict";

	var DATA_FILES = ["customers", "people", "projects", "milestones", "deliverables", "risks", "activities"];

	function fetchJson(sUrl) {
		return fetch(sUrl).then(function (oResponse) {
			if (!oResponse.ok) {
				throw new Error("Failed to load " + sUrl + " (HTTP " + oResponse.status + ")");
			}
			return oResponse.json();
		});
	}

	return {

		/**
		 * @returns {sap.ui.model.json.JSONModel} empty view-state model used while the portfolio data loads
		 */
		createAppViewModel: function () {
			return new JSONModel({
				busy: true,
				delay: 0,
				dataLoadError: false,
				navKey: "dashboard"
			});
		},

		/**
		 * Loads the local fictional dataset and assembles the denormalized "portfolio" model.
		 * @returns {{model: sap.ui.model.json.JSONModel, dataLoaded: Promise}}
		 */
		createPortfolioModel: function () {
			var oModel = new JSONModel();
			oModel.setSizeLimit(1000);
			oModel.setDefaultBindingMode("OneWay");

			var sDataBase = sap.ui.require.toUrl("projectops/data");

			var oDataLoaded = Promise.all(
				DATA_FILES.map(function (sName) {
					return fetchJson(sDataBase + "/" + sName + ".json").then(function (oJson) {
						return { name: sName, data: oJson[sName] };
					});
				})
			).then(function (aResults) {
				var oRaw = {};
				aResults.forEach(function (oResult) {
					oRaw[oResult.name] = oResult.data;
				});

				var dToday = new Date();

				oModel.setData({
					raw: oRaw,
					customers: oRaw.customers,
					people: oRaw.people,
					projects: PortfolioRepository.expandProjects(oRaw),
					milestones: PortfolioRepository.expandMilestones(oRaw, dToday),
					risks: PortfolioRepository.expandRisks(oRaw),
					deliverables: PortfolioRepository.expandDeliverables(oRaw),
					activities: PortfolioRepository.expandActivities(oRaw),
					dashboard: PortfolioRepository.getDashboardData(oRaw, dToday)
				});
			}).catch(function (oError) {
				Log.error("Failed to load the local portfolio dataset", oError);
				throw oError;
			});

			return { model: oModel, dataLoaded: oDataLoaded };
		}
	};
});
