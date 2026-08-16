sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../util/PortfolioRepository"
], function (BaseController, JSONModel, PortfolioRepository) {
	"use strict";

	return BaseController.extend("projectops.controller.ProjectDetail", {

		onInit: function () {
			this.setModel(new JSONModel({ notFound: false, notFoundDescription: "" }), "ui");
			this.setModel(new JSONModel({}), "detail");
			this.getRouter().getRoute("projectDetail").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function (oEvent) {
			var sProjectId = oEvent.getParameter("arguments").projectId;
			this.getOwnerComponent().getDataLoadedPromise().then(function () {
				this._loadProject(sProjectId);
			}.bind(this));
		},

		_loadProject: function (sProjectId) {
			var oRaw = this.getOwnerComponent().getModel("portfolio").getProperty("/raw");
			var oDetail = PortfolioRepository.getProjectDetail(oRaw, sProjectId, new Date());

			if (!oDetail) {
				this.getModel("ui").setData({
					notFound: true,
					notFoundDescription: this.getResourceBundle().getText("projectNotFoundDescription", [sProjectId])
				});
				return;
			}

			this.getModel("ui").setData({ notFound: false, notFoundDescription: "" });
			this.getModel("detail").setData(oDetail);
		},

		onDashboardLinkPress: function () {
			this.getRouter().navTo("dashboard");
		},

		onBackPress: function () {
			this.getRouter().navTo("projects");
		}
	});
});
