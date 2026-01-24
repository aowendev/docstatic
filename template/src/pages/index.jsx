/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React from "react";
import { Blocks } from "../components/Blocks";

const pageData = require("../../config/homepage/index.json");

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={pageData?.title ? pageData.title : siteConfig.title}
      description={
        pageData?.description ? pageData.description : siteConfig.tagline
      }
    >
      {pageData?.blocks ? <Blocks blocks={pageData.blocks} /> : null}
    </Layout>
  );
}