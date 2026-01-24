import React from 'react';
import DashboardField from './index';
import Dashboard1 from './Dashboard1';
import Dashboard2 from './Dashboard2';
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
			url="https://docstatic.com/docs/guides/markdown-features/conditional-text"
			{...props}
		  />
		),
	  },
	},
//	{
//	  type: "boolean",
//	  name: "dashboard1",
//	  label: "Dashboard 1",
//	  required: false,
//	  ui: {
//		component: (props) => (
//		  <Dashboard1/>
//		),
//	  },
//	},
//	{
//	  type: "boolean",
//	  name: "dashboard2",
//	  label: "Dashboard 2",
//	  required: false,
//	  ui: {
//		component: (props) => (
//		  <Dashboard2/>
//		),
//	  },
//	},
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

export { Dashboard1, Dashboard2, Dashboard3, DashboardField };
