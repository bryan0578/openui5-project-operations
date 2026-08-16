sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"./model/models"
], function (UIComponent, Device, JSONModel, models) {
	"use strict";

	return UIComponent.extend("projectops.Component", {

		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},

		/**
		 * Initializes the component, wires up the app-state and portfolio models, and starts routing.
		 */
		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			var oAppViewModel = models.createAppViewModel();
			this.setModel(oAppViewModel, "appView");

			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			var oPortfolio = models.createPortfolioModel();
			this.setModel(oPortfolio.model, "portfolio");
			this._oDataLoadedPromise = oPortfolio.dataLoaded;

			oPortfolio.dataLoaded
				.then(function () {
					oAppViewModel.setProperty("/busy", false);
				})
				.catch(function () {
					oAppViewModel.setProperty("/busy", false);
					oAppViewModel.setProperty("/dataLoadError", true);
				});

			this.getRouter().initialize();
		},

		/**
		 * @returns {Promise} resolves once the local portfolio dataset has been fetched and expanded
		 */
		getDataLoadedPromise: function () {
			return this._oDataLoadedPromise;
		}
	});
});
