/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Dashboard1 from './Dashboard1';
import MediaDashboard from './MediaDashboard';
import TranslationDashboard from './TranslationDashboard';
import BrokenLinksDashboard from './BrokenLinksDashboard';
// import ContentReuseDashboard from './ContentReuseDashboard';
import StatusBar from './StatusBar';
import HelpButton from '../HelpButton';
//. import DocumentMutationDashboard from './DocumentMutationDashboard';

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
//		{
//		  type: "boolean",
//		  name: "contentReuseDashboard",
//		  label: "Content Reuse Overview",
//		  required: false,
//		  ui: {
//			component: (props) => (
//			  <ContentReuseDashboard />
//			),
//		  },
//		},
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
	  name: "brokenLinksDashboard",
	  label: "Broken Links",
	  required: false,
	  ui: {
		component: (props) => (
		  <BrokenLinksDashboard/>
		),
	  },
	},

		// {
		// 	type: "boolean",
		// 	name: "documentMutationDashboard",
		// 	label: "Document Mutations",
		// 	required: false,
		// 	ui: {
		// 		component: (props) => (
		// 			<DocumentMutationDashboard />
		// 		),
		// 	},
		// },
	],
};

export { Dashboard1, MediaDashboard, TranslationDashboard, BrokenLinksDashboard, StatusBar };
