sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/format/DateFormat"
], function (coreLibrary, DateFormat) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	var oDateFormat = DateFormat.getDateInstance({ style: "medium" });
	var oDateTimeFormat = DateFormat.getDateTimeInstance({ style: "medium" });

	/**
	 * Presentation-only formatters used from XML view bindings.
	 * Business/derivation logic lives in PortfolioCalculations so it can be unit tested
	 * independently of UI5 controls.
	 */
	return {

		/**
		 * @param {string} sHealth Healthy | Attention | At Risk
		 * @returns {sap.ui.core.ValueState}
		 */
		healthState: function (sHealth) {
			switch (sHealth) {
				case "Healthy": return ValueState.Success;
				case "Attention": return ValueState.Warning;
				case "At Risk": return ValueState.Error;
				default: return ValueState.None;
			}
		},

		/**
		 * @param {string} sStatus Active | On Hold | Completed | Cancelled | Planning
		 * @returns {sap.ui.core.ValueState}
		 */
		projectStatusState: function (sStatus) {
			switch (sStatus) {
				case "Active": return ValueState.Success;
				case "On Hold": return ValueState.Warning;
				case "Completed": return ValueState.Information;
				case "Cancelled": return ValueState.Error;
				default: return ValueState.None;
			}
		},

		/**
		 * @param {string} sSeverity Low | Medium | High | Critical
		 * @returns {sap.ui.core.ValueState}
		 */
		riskSeverityState: function (sSeverity) {
			switch (sSeverity) {
				case "Low": return ValueState.Success;
				case "Medium": return ValueState.Warning;
				case "High": return ValueState.Error;
				case "Critical": return ValueState.Error;
				default: return ValueState.None;
			}
		},

		/**
		 * @param {string} sSeverity
		 * @returns {string} sap.ui.core.IconPool icon URI, kept distinct from color for non-color status cues
		 */
		riskSeverityIcon: function (sSeverity) {
			switch (sSeverity) {
				case "Critical": return "sap-icon://alert";
				case "High": return "sap-icon://error";
				case "Medium": return "sap-icon://warning";
				case "Low": return "sap-icon://message-information";
				default: return "sap-icon://question-mark";
			}
		},

		/**
		 * @param {string} sStatus Open | Mitigating | Monitoring | Closed
		 * @returns {sap.ui.core.ValueState}
		 */
		riskStatusState: function (sStatus) {
			switch (sStatus) {
				case "Open": return ValueState.Error;
				case "Mitigating": return ValueState.Warning;
				case "Monitoring": return ValueState.Information;
				case "Closed": return ValueState.Success;
				default: return ValueState.None;
			}
		},

		/**
		 * @param {string} sDerivedStatus Completed | Upcoming | AtRisk | Overdue
		 * @returns {sap.ui.core.ValueState}
		 */
		milestoneStatusState: function (sDerivedStatus) {
			switch (sDerivedStatus) {
				case "Completed": return ValueState.Success;
				case "Upcoming": return ValueState.Information;
				case "AtRisk": return ValueState.Warning;
				case "Overdue": return ValueState.Error;
				default: return ValueState.None;
			}
		},

		/**
		 * @param {string} sDerivedStatus Completed | Upcoming | AtRisk | Overdue
		 * @returns {string} icon URI
		 */
		milestoneStatusIcon: function (sDerivedStatus) {
			switch (sDerivedStatus) {
				case "Completed": return "sap-icon://accept";
				case "Upcoming": return "sap-icon://future";
				case "AtRisk": return "sap-icon://alert";
				case "Overdue": return "sap-icon://error";
				default: return "sap-icon://question-mark";
			}
		},

		/**
		 * @param {string} sStatus Draft | In Review | Accepted
		 * @returns {sap.ui.core.ValueState}
		 */
		deliverableStatusState: function (sStatus) {
			switch (sStatus) {
				case "Accepted": return ValueState.Success;
				case "In Review": return ValueState.Warning;
				case "Draft": return ValueState.None;
				default: return ValueState.None;
			}
		},

		/**
		 * @param {string} sDate ISO date string (YYYY-MM-DD)
		 * @returns {string} localized medium date, or empty string when not provided
		 */
		formatDate: function (sDate) {
			if (!sDate) {
				return "";
			}
			return oDateFormat.format(new Date(sDate));
		},

		/**
		 * @param {string} sTimestamp ISO date-time string
		 * @returns {string} localized medium date-time, or empty string when not provided
		 */
		formatDateTime: function (sTimestamp) {
			if (!sTimestamp) {
				return "";
			}
			return oDateTimeFormat.format(new Date(sTimestamp));
		},

		/**
		 * @param {number} iValue 0-100
		 * @returns {string} e.g. "42%"
		 */
		formatPercent: function (iValue) {
			if (iValue === undefined || iValue === null) {
				return "";
			}
			return iValue + "%";
		}
	};
});
