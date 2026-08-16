sap.ui.define([
	"./BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (BaseController, Filter, FilterOperator, Sorter) {
	"use strict";

	var SEARCH_FIELDS = ["name", "customerName", "projectManagerName", "projectId"];

	return BaseController.extend("projectops.controller.Projects", {

		onInit: function () {
			this.getRouter().getRoute("projects").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function (oEvent) {
			this.setActiveNavKey("projects");

			var oQuery = (oEvent.getParameter("arguments") || {})["?query"] || {};
			this.byId("statusFilter").setSelectedKey(oQuery.status || "");
			this.byId("healthFilter").setSelectedKey(oQuery.health || "");
			this.byId("searchField").setValue(oQuery.search || "");

			this._applyFilters();
		},

		onFilterChange: function () {
			this._applyFilters();
		},

		onClearFilters: function () {
			this.byId("statusFilter").setSelectedKey("");
			this.byId("healthFilter").setSelectedKey("");
			this.byId("searchField").setValue("");
			this._applyFilters();
		},

		onSortPress: function () {
			this.loadFragment({
				name: "projectops.view.fragment.ProjectsSortDialog"
			}).then(function (oDialog) {
				oDialog.open();
			});
		},

		onSortConfirm: function (oEvent) {
			var oSortItem = oEvent.getParameter("sortItem");
			var bDescending = oEvent.getParameter("sortDescending");
			var oBinding = this.byId("projectsTable").getBinding("items");

			if (oSortItem) {
				oBinding.sort(new Sorter(oSortItem.getKey(), bDescending));
			} else {
				oBinding.sort(null);
			}
		},

		onProjectPress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("portfolio");
			this.getRouter().navTo("projectDetail", { projectId: oContext.getProperty("projectId") });
		},

		_applyFilters: function () {
			var sSearch = this.byId("searchField").getValue().trim();
			var sStatus = this.byId("statusFilter").getSelectedKey();
			var sHealth = this.byId("healthFilter").getSelectedKey();

			var aFilters = [];

			if (sSearch) {
				var aFieldFilters = SEARCH_FIELDS.map(function (sField) {
					return new Filter({ path: sField, operator: FilterOperator.Contains, value1: sSearch, caseSensitive: false });
				});
				aFilters.push(new Filter({ filters: aFieldFilters, and: false }));
			}
			if (sStatus) {
				aFilters.push(new Filter({ path: "status", operator: FilterOperator.EQ, value1: sStatus }));
			}
			if (sHealth) {
				aFilters.push(new Filter({ path: "health", operator: FilterOperator.EQ, value1: sHealth }));
			}

			var oTable = this.byId("projectsTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(new Filter({ filters: aFilters, and: true }));

			var bEmpty = oBinding.getLength() === 0;
			this.byId("projectsEmptyState").setVisible(bEmpty);
			oTable.setVisible(!bEmpty);

			this.byId("projectsCountTitle").setText(
				this.getResourceBundle().getText("projectsCount", [oBinding.getLength()])
			);
		}
	});
});
