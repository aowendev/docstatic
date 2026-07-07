/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

export default function NotFound() {
  const {i18n} = useDocusaurusContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tryFallback = async () => {
      const {pathname, search, hash} = window.location;
      const parts = pathname.split('/').filter(Boolean);
      if (!parts.length) return;

      const first = parts[0];
      if (!i18n || !i18n.locales || !i18n.locales.includes(first)) return;
      if (first === i18n.defaultLocale) return;

      // Remove locale prefix to build default-locale path
      parts.shift();
      let fallbackPath = '/' + parts.join('/');
      if (fallbackPath === '/') fallbackPath = '/';

      const tryUrls = [fallbackPath, `${fallbackPath}.html`, `${fallbackPath}/index.html`];

      for (const url of tryUrls) {
        try {
          const res = await fetch(url, {method: 'GET', credentials: 'same-origin'});
          if (res && res.status === 200) {
            // Redirect to the URL that exists (preserve search + hash)
            window.location.replace(url + search + hash);
            return;
          }
        } catch (e) {
          // ignore network errors
        }
      }
    };

    tryFallback();
  }, [i18n]);

  return (
    <Layout title="Page not found">
      <main style={{padding: 'var(--ifm-leading)', textAlign: 'center'}}>
        <h1>404 — Page not found</h1>
        <p>The page you requested does not exist in this language. Trying the default language...</p>
      </main>
    </Layout>
  );
}
