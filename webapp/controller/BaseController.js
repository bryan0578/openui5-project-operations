sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";

	return Controller.extend("projectops.controller.BaseController", {

		/**
		 * @returns {sap.ui.core.routing.Router}
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * @param {string} [sName]
		 * @returns {sap.ui.model.Model}
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * @param {sap.ui.model.Model} oModel
		 * @param {string} [sName]
		 * @returns {sap.ui.core.mvc.View}
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * @returns {sap.base.i18n.ResourceBundle}
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Highlights the correct section tab and marks that this view is the active navigation target.
		 * @param {string} sKey one of dashboard | projects | risks | milestones
		 */
		setActiveNavKey: function (sKey) {
			this.getOwnerComponent().getModel("appView").setProperty("/navKey", sKey);
		},

		/**
		 * Shared handler for the section IconTabHeader used on all primary views.
		 * @param {sap.ui.base.Event} oEvent
		 */
		onNavTabSelect: function (oEvent) {
			var sKey = oEvent.getParameter("key");
			if (sKey) {
				this.getRouter().navTo(sKey);
			}
		},

		/**
		 * Translates a derived milestone status code into its display text.
		 * @param {string} sDerivedStatus Completed | Upcoming | AtRisk | Overdue
		 * @returns {string}
		 */
		formatMilestoneStatusText: function (sDerivedStatus) {
			var oBundle = this.getResourceBundle();
			switch (sDerivedStatus) {
				case "Completed": return oBundle.getText("milestoneStatusCompleted");
				case "Upcoming": return oBundle.getText("milestoneStatusUpcoming");
				case "AtRisk": return oBundle.getText("milestoneStatusAtRisk");
				case "Overdue": return oBundle.getText("milestoneStatusOverdue");
				default: return sDerivedStatus;
			}
		},

		/**
		 * Translates a deliverable status code into its display text.
		 * @param {string} sStatus Draft | In Review | Accepted
		 * @returns {string}
		 */
		formatDeliverableStatusText: function (sStatus) {
			var oBundle = this.getResourceBundle();
			switch (sStatus) {
				case "Draft": return oBundle.getText("deliverableStatusDraft");
				case "In Review": return oBundle.getText("deliverableStatusInReview");
				case "Accepted": return oBundle.getText("deliverableStatusAccepted");
				default: return sStatus;
			}
		}
	});
});
