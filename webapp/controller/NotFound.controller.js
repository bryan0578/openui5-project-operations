sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("projectops.controller.NotFound", {

		onGoToDashboard: function () {
			this.getRouter().navTo("dashboard", {}, true);
		}
	});
});
