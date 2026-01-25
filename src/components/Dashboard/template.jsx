import React from 'react';
import Dashboard1 from './Dashboard1';
import MediaDashboard from './MediaDashboard';
import TranslationDashboard from './TranslationDashboard';
import BrokenLinksDashboard from './BrokenLinksDashboard';
import StatusBar from './StatusBar';
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
	  name: "statusBar",
	  label: "",
	  required: false,
	  ui: {
		component: (props) => (
		  <div style={{ 
			position: 'relative',
			width: '100%',
			marginLeft: '-20px',
			marginRight: '-20px',
			marginBottom: '20px',
			zIndex: 1000
		  }}>
			<StatusBar/>
		  </div>
		),
	  },
	},
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
	  name: "dashboard1",
	  label: "Content Overview",
	  required: false,
	  ui: {
		component: (props) => (
		  <Dashboard1/>
		),
	  },
	},
	{
	  type: "boolean",
	  name: "translationDashboard",
	  label: "Translation Status",
	  required: false,
	  ui: {
		component: (props) => (
		  <TranslationDashboard/>
		),
	  },
	},
	{
	  type: "boolean",
	  name: "mediaDashboard",
	  label: "Media Library",
	  required: false,
	  ui: {
		component: (props) => (
		  <MediaDashboard/>
		),
	  },
	},
	{
	  type: "boolean",
	  name: "brokenLinksDashboard",
	  label: "Broken Links",
	  required: false,
	  ui: {
		component: (props) => (
		  <BrokenLinksDashboard/>
		),
	  },
	},
  ],
};

export { Dashboard1, MediaDashboard, TranslationDashboard, BrokenLinksDashboard, StatusBar };
