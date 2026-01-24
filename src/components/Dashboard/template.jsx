import React from 'react';
import DashboardField from './index';
import Dashboard3 from './Dashboard3';
import HelpButton from '../HelpButton';

export const DashboardsCollection = {
  name: "dashboards",
  label: "Dashboards",
  path: "static/dashboards",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
	{
	  type: "boolean",
	  name: "help",
	  label: "Help",
	  required: false,
	  ui: {
		component: (props) => (
		  <HelpButton
			url="https://docstatic.com/docs/guides/dashboards"
			{...props}
		  />
		),
	  },
	},
	{
	  type: "boolean",
	  name: "dashboard3",
	  label: "GraphQL Test",
	  required: false,
	  ui: {
		component: (props) => (
		  <Dashboard3/>
		),
	  },
	},
  ],
};

export { Dashboard3, DashboardField };
