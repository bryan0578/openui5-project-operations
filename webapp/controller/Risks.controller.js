sap.ui.define([
	"./BaseController",
	"sap/ui/core/Item",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (BaseController, Item, Filter, FilterOperator, Sorter) {
	"use strict";

	var SEARCH_FIELDS = ["title", "projectName"];
	var NON_CLOSED_STATUSES = ["Open", "Mitigating", "Monitoring"];

	return BaseController.extend("projectops.controller.Risks", {

		onInit: function () {
			this._bOpenOnly = false;
			this.getRouter().getRoute("risks").attachPatternMatched(this._onRouteMatched, this);
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
			this.setActiveNavKey("risks");

			var oQuery = (oEvent.getParameter("arguments") || {})["?query"] || {};
			this._bOpenOnly = oQuery.status === "OpenAll";
			this.byId("riskStatusFilter").setSelectedKey(this._bOpenOnly ? "" : (oQuery.status || ""));
			this.byId("severityFilter").setSelectedKey(oQuery.severity || "");
			this.byId("projectFilter").setSelectedKey(oQuery.project || "");
			this.byId("searchField").setValue(oQuery.search || "");

			this._applyFilters();
		},

		onFilterChange: function () {
			this._applyFilters();
		},

		onStatusFilterChange: function () {
			this._bOpenOnly = false;
			this._applyFilters();
		},

		onClearFilters: function () {
			this._bOpenOnly = false;
			this.byId("severityFilter").setSelectedKey("");
			this.byId("riskStatusFilter").setSelectedKey("");
			this.byId("projectFilter").setSelectedKey("");
			this.byId("searchField").setValue("");
			this._applyFilters();
		},

		onSortPress: function () {
			this.loadFragment({
				name: "projectops.view.fragment.RisksSortDialog"
			}).then(function (oDialog) {
				oDialog.open();
			});
		},

		onSortConfirm: function (oEvent) {
			var oSortItem = oEvent.getParameter("sortItem");
			var bDescending = oEvent.getParameter("sortDescending");
			var oBinding = this.byId("risksTable").getBinding("items");

			oBinding.sort(oSortItem ? new Sorter(oSortItem.getKey(), bDescending) : null);
		},

		onRiskPress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("portfolio");
			this.getRouter().navTo("projectDetail", { projectId: oContext.getProperty("projectId") });
		},

		_applyFilters: function () {
			var sSearch = this.byId("searchField").getValue().trim();
			var sSeverity = this.byId("severityFilter").getSelectedKey();
			var sStatus = this.byId("riskStatusFilter").getSelectedKey();
			var sProject = this.byId("projectFilter").getSelectedKey();

			var aFilters = [];

			if (sSearch) {
				var aFieldFilters = SEARCH_FIELDS.map(function (sField) {
					return new Filter({ path: sField, operator: FilterOperator.Contains, value1: sSearch, caseSensitive: false });
				});
				aFilters.push(new Filter({ filters: aFieldFilters, and: false }));
			}
			if (sSeverity) {
				aFilters.push(new Filter({ path: "severity", operator: FilterOperator.EQ, value1: sSeverity }));
			}
			if (sStatus) {
				aFilters.push(new Filter({ path: "status", operator: FilterOperator.EQ, value1: sStatus }));
			} else if (this._bOpenOnly) {
				var aOpenFilters = NON_CLOSED_STATUSES.map(function (sValue) {
					return new Filter({ path: "status", operator: FilterOperator.EQ, value1: sValue });
				});
				aFilters.push(new Filter({ filters: aOpenFilters, and: false }));
			}
			if (sProject) {
				aFilters.push(new Filter({ path: "projectId", operator: FilterOperator.EQ, value1: sProject }));
			}

			var oTable = this.byId("risksTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(new Filter({ filters: aFilters, and: true }));

			var bEmpty = oBinding.getLength() === 0;
			this.byId("risksEmptyState").setVisible(bEmpty);
			oTable.setVisible(!bEmpty);

			this.byId("risksCountTitle").setText(
				this.getResourceBundle().getText("risksCount", [oBinding.getLength()])
			);
		}
	});
});
