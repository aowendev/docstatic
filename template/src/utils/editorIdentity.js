/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Attempts to determine the current editor identity.
// Priority:
// 1) Tina Cloud authenticated user (decode any JWT in localStorage for name/email)
// 2) Local dev: read static Git identity from /git-identity.json (generated at dev/build)
// 3) Env-supplied local user (NEXT_PUBLIC_LOCAL_USER)
// 4) Fallback "unknown"

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    // atob works in browsers; guard against Unicode issues if needed
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

async function fetchGitIdentity() {
  try {
    const response = await fetch('/git-identity.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('No git identity file available');
  }
  return null;
}

export async function getEditorIdentity() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  try {
    // 1. Check for Tina Cloud JWT in localStorage
    const tinaToken = localStorage.getItem('tinacms.auth.token');
    if (tinaToken) {
      const payload = decodeJwtPayload(tinaToken);
      if (payload?.name || payload?.email) {
        return payload.name || payload.email;
      }
    }

    // 2. Check for static Git identity (local development)
    const gitIdentity = await fetchGitIdentity();
    if (gitIdentity?.name) {
      return gitIdentity.name;
    }

    // 3. Check environment variable
    const envUser = process.env.NEXT_PUBLIC_LOCAL_USER;
    if (envUser) {
      return envUser;
    }

  } catch (error) {
    console.warn('Error getting editor identity:', error);
  }

  // 4. Fallback
  return 'unknown';
}