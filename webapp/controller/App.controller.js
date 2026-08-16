sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox"
], function (BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("projectops.controller.App", {

		onInit: function () {
			// The App control's busy state (bound in the view) covers the initial portfolio
			// data load. If loading fails, surface it rather than leaving a blank screen.
			this.getOwnerComponent().getModel("appView")
				.bindProperty("/dataLoadError")
				.attachChange(this._onDataLoadErrorChange, this);
		},

		_onDataLoadErrorChange: function (oEvent) {
			if (oEvent.getSource().getValue()) {
				MessageBox.error(this.getResourceBundle().getText("dataLoadErrorDescription"), {
					title: this.getResourceBundle().getText("dataLoadErrorTitle")
				});
			}
		}
	});
});
