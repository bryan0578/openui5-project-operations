sap.ui.define([
	"./BaseController",
	"sap/ui/core/Item",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (BaseController, Item, Filter, FilterOperator, Sorter) {
	"use strict";

	var SEARCH_FIELDS = ["name", "projectName"];

	return BaseController.extend("projectops.controller.Milestones", {

		onInit: function () {
			this.getRouter().getRoute("milestones").attachPatternMatched(this._onRouteMatched, this);
			this.getOwnerComponent().getDataLoadedPromise().then(this._populateProjectFilter.bind(this));
		},

		_populateProjectFilter: function () {
			var oSelect = this.byId("projectFilter");
			var aProjects = this.getOwnerComponent().getModel("portfolio").getProperty("/projects") || [];
			aProjects.forEach(function (oProject) {
				oSelect.addItem(new Item({ key: oProject.projectId, text: oProject.name }));
			});
		},

		_onRouteMatched: function (oEvent) {
			this.setActiveNavKey("milestones");

			var oQuery = (oEvent.getParameter("arguments") || {})["?query"] || {};
			this.byId("milestoneStatusFilter").setSelectedKey(oQuery.status || "");
			this.byId("projectFilter").setSelectedKey(oQuery.project || "");
			this.byId("searchField").setValue(oQuery.search || "");

			this._applyFilters();
		},

		onFilterChange: function () {
			this._applyFilters();
		},

		onClearFilters: function () {
			this.byId("milestoneStatusFilter").setSelectedKey("");
			this.byId("projectFilter").setSelectedKey("");
			this.byId("searchField").setValue("");
			this._applyFilters();
		},

		onSortPress: function () {
			this.loadFragment({
				name: "projectops.view.fragment.MilestonesSortDialog"
			}).then(function (oDialog) {
				oDialog.open();
			});
		},

		onSortConfirm: function (oEvent) {
			var oSortItem = oEvent.getParameter("sortItem");
			var bDescending = oEvent.getParameter("sortDescending");
			var oBinding = this.byId("milestonesTable").getBinding("items");

			oBinding.sort(oSortItem ? new Sorter(oSortItem.getKey(), bDescending) : null);
		},

		onMilestonePress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("portfolio");
			this.getRouter().navTo("projectDetail", { projectId: oContext.getProperty("projectId") });
		},

		_applyFilters: function () {
			var sSearch = this.byId("searchField").getValue().trim();
			var sStatus = this.byId("milestoneStatusFilter").getSelectedKey();
			var sProject = this.byId("projectFilter").getSelectedKey();

			var aFilters = [];

			if (sSearch) {
				var aFieldFilters = SEARCH_FIELDS.map(function (sField) {
					return new Filter({ path: sField, operator: FilterOperator.Contains, value1: sSearch, caseSensitive: false });
				});
				aFilters.push(new Filter({ filters: aFieldFilters, and: false }));
			}
			if (sStatus) {
				aFilters.push(new Filter({ path: "derivedStatus", operator: FilterOperator.EQ, value1: sStatus }));
			}
			if (sProject) {
				aFilters.push(new Filter({ path: "projectId", operator: FilterOperator.EQ, value1: sProject }));
			}

			var oTable = this.byId("milestonesTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(new Filter({ filters: aFilters, and: true }));

			var bEmpty = oBinding.getLength() === 0;
			this.byId("milestonesEmptyState").setVisible(bEmpty);
			oTable.setVisible(!bEmpty);

			this.byId("milestonesCountTitle").setText(
				this.getResourceBundle().getText("milestonesCount", [oBinding.getLength()])
			);
		}
	});
});
