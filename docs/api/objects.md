---
id: objects
title: Objects
slug: objects
sidebar_position: 3
---

## Collection



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
slug<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
path<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
format<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
matches<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
templates<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fields<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
documents<br />
<a href="/docs/api/objects#documentconnection"><code>DocumentConnection!</code></a>
</td>
<td>


<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
before<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
after<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
first<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
last<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sort<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filter<br />
<a href="/docs/api/inputObjects#documentfilter"><code>DocumentFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
folder<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

</td>
</tr>
</tbody>
</table>

## Conditions



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
categories<br />
<a href="/docs/api/objects#conditionscategories"><code>[ConditionsCategories]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsCategories



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/objects#conditionscategoriesconditions"><code>[ConditionsCategoriesConditions]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsCategoriesConditions



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
condition<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
active<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#conditionsconnectionedges"><code>[ConditionsConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#conditions"><code>Conditions</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Doc



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
draft<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
review<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
translate<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
approved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
published<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unlisted<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#docconnectionedges"><code>[DocConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#doc"><code>Doc</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocumentConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#documentconnectionedges"><code>[DocumentConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocumentConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/unions#documentnode"><code>DocumentNode</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Folder



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
path<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTerms



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
glossaryTerms<br />
<a href="/docs/api/unions#glossarytermsglossaryterms"><code>[GlossaryTermsGlossaryTerms]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#glossarytermsconnectionedges"><code>[GlossaryTermsConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#glossaryterms"><code>GlossaryTerms</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTerm



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
key<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/unions#glossarytermsglossarytermsglossarytermlanguages"><code>[GlossaryTermsGlossaryTermsGlossaryTermLanguages]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguage



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
lang<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
translations<br />
<a href="/docs/api/unions#glossarytermsglossarytermsglossarytermlanguageslanguagetranslations"><code>[GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslations]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsTranslation



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
term<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
definition<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Homepage



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_warning<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
blocks<br />
<a href="/docs/api/unions#homepageblocks"><code>[HomepageBlocks]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksFeatures



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
items<br />
<a href="/docs/api/objects#homepageblocksfeaturesitems"><code>[HomepageBlocksFeaturesItems]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksFeaturesItems



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksHero



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subtitle<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
document<br />
<a href="/docs/api/unions#homepageblocksherodocument"><code>HomepageBlocksHeroDocument</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
documentLabel<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksYouTubeEmbed



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
caption<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#homepageconnectionedges"><code>[HomepageConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#homepage"><code>Homepage</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18n



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#i18nconnectionedges"><code>[I18nConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#i18n"><code>I18n</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PageInfo



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
hasPreviousPage<br />
<a href="/docs/api/scalars#boolean"><code>Boolean!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasNextPage<br />
<a href="/docs/api/scalars#boolean"><code>Boolean!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startCursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endCursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Pages



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#pagesconnectionedges"><code>[PagesConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#pages"><code>Pages</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Post



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
authors<br />
<a href="/docs/api/objects#postauthors"><code>[PostAuthors]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
date<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostAuthors



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image_url<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#postconnectionedges"><code>[PostConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#post"><code>Post</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Settings



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_warning<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logo<br />
<a href="/docs/api/objects#settingslogo"><code>SettingsLogo</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagline<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
footer<br />
<a href="/docs/api/objects#settingsfooter"><code>SettingsFooter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#settingsconnectionedges"><code>[SettingsConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#settings"><code>Settings</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooter



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
style<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/objects#settingsfooterlinks"><code>[SettingsFooterLinks]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
copyright<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinks



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/unions#settingsfooterlinksitems"><code>[SettingsFooterLinksItems]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsBlog



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsExternal



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsInternal



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/docs/api/unions#settingsfooterlinksitemsinternalto"><code>SettingsFooterLinksItemsInternalTo</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsLogo



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
alt<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
src<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Sidebar



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_warning<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/unions#sidebaritems"><code>[SidebarItems]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#sidebarconnectionedges"><code>[SidebarConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#sidebar"><code>Sidebar</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategory



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/unions#sidebaritemscategorydoclink"><code>SidebarItemsCategoryDocLink</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/unions#sidebaritemscategoryitems"><code>[SidebarItemsCategoryItems]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategory



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/unions#sidebaritemscategoryitemscategorydoclink"><code>SidebarItemsCategoryItemsCategoryDocLink</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/unions#sidebaritemscategoryitemscategoryitems"><code>[SidebarItemsCategoryItemsCategoryItems]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategory



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/unions#sidebaritemscategoryitemscategoryitemscategorydoclink"><code>SidebarItemsCategoryItemsCategoryItemsCategoryDocLink</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/unions#sidebaritemscategoryitemscategoryitemscategoryitems"><code>[SidebarItemsCategoryItemsCategoryItemsCategoryItems]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsDoc



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/unions#sidebaritemscategoryitemscategoryitemscategoryitemsdocdocument"><code>SidebarItemsCategoryItemsCategoryItemsCategoryItemsDocDocument!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsLink



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsDoc



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/unions#sidebaritemscategoryitemscategoryitemsdocdocument"><code>SidebarItemsCategoryItemsCategoryItemsDocDocument!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsLink



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsDoc



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/unions#sidebaritemscategoryitemsdocdocument"><code>SidebarItemsCategoryItemsDocDocument!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsLink



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsDoc



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/unions#sidebaritemsdocdocument"><code>SidebarItemsDocDocument!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsLink



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Snippets



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#snippetsconnectionedges"><code>[SnippetsConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#snippets"><code>Snippets</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SystemInfo



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filename<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
basename<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasReferences<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
breadcrumbs<br />
<a href="/docs/api/scalars#string"><code>[String!]!</code></a>
</td>
<td>


<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
excludeExtension<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

</td>
</tr>
<tr>
<td>
path<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relativePath<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
extension<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
template<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
collection<br />
<a href="/docs/api/objects#collection"><code>Collection!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Taxonomy



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
taxonomy<br />
<a href="/docs/api/objects#taxonomytaxonomy"><code>[TaxonomyTaxonomy]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#taxonomyconnectionedges"><code>[TaxonomyConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#taxonomy"><code>Taxonomy</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomy



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/objects#taxonomytaxonomychildren"><code>[TaxonomyTaxonomyChildren]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomyChildren



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/objects#taxonomytaxonomychildrenchildren"><code>[TaxonomyTaxonomyChildrenChildren]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomyChildrenChildren



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSets



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
variableSets<br />
<a href="/docs/api/objects#variablesetsvariablesets"><code>[VariableSetsVariableSets]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#variablesetsconnectionedges"><code>[VariableSetsConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#variablesets"><code>VariableSets</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSets



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variables<br />
<a href="/docs/api/objects#variablesetsvariablesetsvariables"><code>[VariableSetsVariableSetsVariables]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSetsVariables



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
key<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
translations<br />
<a href="/docs/api/objects#variablesetsvariablesetsvariablestranslations"><code>[VariableSetsVariableSetsVariablesTranslations]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSetsVariablesTranslations



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
lang<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Wiki



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Node](/docs/api/interfaces#node)
- [Document](/docs/api/interfaces#document)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/docs/api/scalars#id"><code>ID!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_sys<br />
<a href="/docs/api/objects#systeminfo"><code>SystemInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
_values<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiConnection



<p style={{ marginBottom: "0.4em" }}><strong>Implements</strong></p>

- [Connection](/docs/api/interfaces#connection)

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pageInfo<br />
<a href="/docs/api/objects#pageinfo"><code>PageInfo!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
edges<br />
<a href="/docs/api/objects#wikiconnectionedges"><code>[WikiConnectionEdges]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiConnectionEdges



<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
cursor<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
node<br />
<a href="/docs/api/objects#wiki"><code>Wiki</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

