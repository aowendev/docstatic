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

async function tryTinaCloudIdentity() {
  try {
    if (typeof window === "undefined") return null;
    const ls = window.localStorage;
    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (!key) continue;
      const val = ls.getItem(key);
      if (!val) continue;
      if (val.includes(".")) {
        const parts = val.split(".");
        if (parts.length === 3) {
          const payload = decodeJwtPayload(val);
          const name = payload?.name || payload?.preferred_username;
          const email = payload?.email;
          if (name || email) {
            return name ? `${name}${email ? ` <${email}>` : ""}` : email;
          }
        }
      }
    }
  } catch (_) {
    // ignore
  }
  return null;
}

async function tryLocalGitIdentity() {
  try {
    if (typeof window === "undefined") return null;
    const res = await fetch("/git-identity.json", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const name = data?.name || data?.user?.name;
    const email = data?.email || data?.user?.email;
    if (name || email) {
      return name ? `${name}${email ? ` <${email}>` : ""}` : email;
    }
  } catch (_) {
    // ignore
  }
  return null;
}

export async function getEditorIdentity() {
  // 1) Tina Cloud (when authenticated)
  const cloud = await tryTinaCloudIdentity();
  if (cloud) return cloud;

  // 2) Local Git identity exposed as static JSON
  const gitLocal = await tryLocalGitIdentity();
  if (gitLocal) return gitLocal;

  // 3) Env-provided local user
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_LOCAL_USER) {
    return process.env.NEXT_PUBLIC_LOCAL_USER;
  }

  // 4) Fallback
  return "unknown";
}
