/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';

const StatusBar = () => {
  const [status, setStatus] = useState({
    connection: { type: 'loading', message: 'Checking connection...' },
    environment: { type: 'unknown', message: 'Detecting environment...' },
    settings: { type: 'loading', message: 'Validating settings...' }
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Check GraphQL connection
    let connectionStatus = { type: 'error', message: 'No connection' };
    let environmentStatus = { type: 'unknown', message: 'Unknown' };
    
    try {
      // Test localhost GraphQL first
      const localhostResponse = await fetch('http://localhost:4001/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
      });
      
      if (localhostResponse.ok) {
        connectionStatus = { type: 'success', message: 'Connected' };
        environmentStatus = { type: 'localhost', message: 'localhost:4001' };
      }
    } catch (err) {
      // If localhost fails, check for TinaCloud configuration
      const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
      const token = process.env.NEXT_PUBLIC_TINA_TOKEN;
      
      if (clientId) {
        // Try to import and check TinaCMS client for TinaCloud
        try {
          const { client } = await import('../../../tina/__generated__/client');
          // If we have a client and clientId, assume TinaCloud is configured
          connectionStatus = { type: 'success', message: 'TinaCloud configured' };
          environmentStatus = { type: 'tinacloud', message: `TinaCloud (${clientId.substring(0, 8)}...)` };
        } catch (clientErr) {
          connectionStatus = { type: 'error', message: 'Configuration error' };
          environmentStatus = { type: 'error', message: 'Client not found' };
        }
      } else {
        connectionStatus = { type: 'error', message: 'Not configured' };
        environmentStatus = { type: 'error', message: 'No environment set' };
      }
    }

    // Check required settings
    let settingsStatus = { type: 'success', message: 'All settings OK' };
    const missingSettings = [];

    // Check for essential environment variables
    const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
    const token = process.env.NEXT_PUBLIC_TINA_TOKEN;
    
    // NEXT_PUBLIC_TINA_TOKEN is not required for TinaCloud environments
    // Only check for token if using local development with specific requirements
    // if (environmentStatus.type === 'tinacloud' && !token) {
    //   missingSettings.push('NEXT_PUBLIC_TINA_TOKEN');
    // }
    
    // Check for essential config files
    try {
      const { default: docusaurusConfig } = await import('../../../config/docusaurus/index.json');
      if (!docusaurusConfig || Object.keys(docusaurusConfig).length === 0) {
        missingSettings.push('Docusaurus config');
      }
    } catch (err) {
      missingSettings.push('Docusaurus config');
    }

    // Check if TinaCMS client is properly generated
    try {
      await import('../../../tina/__generated__/client');
    } catch (err) {
      missingSettings.push('TinaCMS client (run: yarn tina-build)');
    }

    if (missingSettings.length > 0) {
      settingsStatus = {
        type: 'warning',
        message: `Missing: ${missingSettings.join(', ')}`
      };
    }

    setStatus({
      connection: connectionStatus,
      environment: environmentStatus,
      settings: settingsStatus
    });
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'success': return '#059669'; // green
      case 'warning': return '#f59e0b'; // yellow
      case 'error': return '#dc2626'; // red
      case 'localhost': return '#3b82f6'; // blue
      case 'tinacloud': return '#8b5cf6'; // purple
      case 'loading': return '#6b7280'; // gray
      default: return '#6b7280'; // gray
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      case 'localhost': return '🏠';
      case 'tinacloud': return '☁';
      case 'loading': return '⟳';
      default: return '?';
    }
  };

  // Inject status into existing element if it exists
  useEffect(() => {
    const targetElement = document.querySelector('.relative.flex-none.w-full.h-16.px-6.bg-white.border-t.border-gray-100.flex.items-center.justify-end');
    if (targetElement) {
      const statusContainer = targetElement.querySelector('.status-bar-injected');
      if (!statusContainer) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-bar-injected flex items-center gap-4 mr-auto';
        statusDiv.style.fontSize = '0.75rem';
        statusDiv.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: ${getStatusColor(status.connection.type)}">${getStatusIcon(status.connection.type)}</span>
            <span style="font-weight: 500; color: #374151">GraphQL:</span>
            <span style="color: ${getStatusColor(status.connection.type)}">${status.connection.message}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: ${getStatusColor(status.environment.type)}">${getStatusIcon(status.environment.type)}</span>
            <span style="font-weight: 500; color: #374151">Environment:</span>
            <span style="color: ${getStatusColor(status.environment.type)}">${status.environment.message}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: ${getStatusColor(status.settings.type)}">${getStatusIcon(status.settings.type)}</span>
            <span style="font-weight: 500; color: #374151">Settings:</span>
            <span style="color: ${getStatusColor(status.settings.type)}">${status.settings.message}</span>
          </div>
        `;
        targetElement.insertBefore(statusDiv, targetElement.firstChild);
      } else {
        // Update existing status
        statusContainer.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: ${getStatusColor(status.connection.type)}">${getStatusIcon(status.connection.type)}</span>
            <span style="font-weight: 500; color: #374151">GraphQL:</span>
            <span style="color: ${getStatusColor(status.connection.type)}">${status.connection.message}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: ${getStatusColor(status.environment.type)}">${getStatusIcon(status.environment.type)}</span>
            <span style="font-weight: 500; color: #374151">Environment:</span>
            <span style="color: ${getStatusColor(status.environment.type)}">${status.environment.message}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: ${getStatusColor(status.settings.type)}">${getStatusIcon(status.settings.type)}</span>
            <span style="font-weight: 500; color: #374151">Settings:</span>
            <span style="color: ${getStatusColor(status.settings.type)}">${status.settings.message}</span>
          </div>
        `;
      }
    }
  }, [status]);

  return null; // Only inject into existing element, don't render standalone
};

export default StatusBar;
