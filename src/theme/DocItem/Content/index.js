import React from 'react';
import DocItemContent from '@theme-original/DocItem/Content';
import FootnotesList from '@site/src/components/Footnote/FootnotesList';
import { FootnotesProvider } from '@site/src/components/Footnote/FootnotesProvider';

export default function DocItemContentWrapper(props) {
  return (
    <FootnotesProvider>
      <DocItemContent {...props} />
      <FootnotesList />
    </FootnotesProvider>
  );
}
