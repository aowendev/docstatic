---
id: inputObjects
title: Input objects
slug: inputObjects
sidebar_position: 7
---

## BooleanFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
eq<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
exists<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsCategoriesConditionsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
condition<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
active<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsCategoriesConditionsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
condition<br />
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
active<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsCategoriesFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#conditionscategoriesconditionsfilter"><code>ConditionsCategoriesConditionsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsCategoriesMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
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
conditions<br />
<a href="/docs/api/inputObjects#conditionscategoriesconditionsmutation"><code>[ConditionsCategoriesConditionsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
categories<br />
<a href="/docs/api/inputObjects#conditionscategoriesfilter"><code>ConditionsCategoriesFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConditionsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
categories<br />
<a href="/docs/api/inputObjects#conditionscategoriesmutation"><code>[ConditionsCategoriesMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyAdmonitionFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyAFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
id<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyCodeSnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
language<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyConditionalTextFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
text<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageLogic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireBothConditions<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fallback<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
debug<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyDetailsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyDocCardListFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyFigureFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
img<br />
<a href="/docs/api/inputObjects#imagefilter"><code>ImageFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
caption<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
Admonition<br />
<a href="/docs/api/inputObjects#docbodyadmonitionfilter"><code>DocBodyAdmonitionFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
CodeSnippet<br />
<a href="/docs/api/inputObjects#docbodycodesnippetfilter"><code>DocBodyCodeSnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hidden<br />
<a href="/docs/api/inputObjects#docbodyhiddenfilter"><code>DocBodyHiddenFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ConditionalText<br />
<a href="/docs/api/inputObjects#docbodyconditionaltextfilter"><code>DocBodyConditionalTextFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
a<br />
<a href="/docs/api/inputObjects#docbodyafilter"><code>DocBodyAFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Details<br />
<a href="/docs/api/inputObjects#docbodydetailsfilter"><code>DocBodyDetailsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
DocCardList<br />
<a href="/docs/api/inputObjects#docbodydoccardlistfilter"><code>DocBodyDocCardListFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Figure<br />
<a href="/docs/api/inputObjects#docbodyfigurefilter"><code>DocBodyFigureFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Footnote<br />
<a href="/docs/api/inputObjects#docbodyfootnotefilter"><code>DocBodyFootnoteFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
GlossaryTerm<br />
<a href="/docs/api/inputObjects#docbodyglossarytermfilter"><code>DocBodyGlossaryTermFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Snippet<br />
<a href="/docs/api/inputObjects#docbodysnippetfilter"><code>DocBodySnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Passthrough<br />
<a href="/docs/api/inputObjects#docbodypassthroughfilter"><code>DocBodyPassthroughFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Tabs<br />
<a href="/docs/api/inputObjects#docbodytabsfilter"><code>DocBodyTabsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
truncate<br />
<a href="/docs/api/inputObjects#docbodytruncatefilter"><code>DocBodyTruncateFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
VariableSet<br />
<a href="/docs/api/inputObjects#docbodyvariablesetfilter"><code>DocBodyVariableSetFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyFootnoteFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyGlossaryTermFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
termKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyHiddenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
comment<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyPassthroughFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
string<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodySnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyTabsChildrenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
TabItem<br />
<a href="/docs/api/inputObjects#docbodytabschildrentabitemfilter"><code>DocBodyTabsChildrenTabItemFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyTabsChildrenTabItemFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
value<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
default<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyTabsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#docbodytabschildrenfilter"><code>DocBodyTabsChildrenFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyTruncateFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
deactivate<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocBodyVariableSetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
setKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
draft<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
review<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
translate<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
approved<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
published<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unlisted<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/inputObjects#docbodyfilter"><code>DocBodyFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## DocumentFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#conditionsfilter"><code>ConditionsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
post<br />
<a href="/docs/api/inputObjects#postfilter"><code>PostFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
glossaryTerms<br />
<a href="/docs/api/inputObjects#glossarytermsfilter"><code>GlossaryTermsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
homepage<br />
<a href="/docs/api/inputObjects#homepagefilter"><code>HomepageFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pages<br />
<a href="/docs/api/inputObjects#pagesfilter"><code>PagesFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
settings<br />
<a href="/docs/api/inputObjects#settingsfilter"><code>SettingsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
snippets<br />
<a href="/docs/api/inputObjects#snippetsfilter"><code>SnippetsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sidebar<br />
<a href="/docs/api/inputObjects#sidebarfilter"><code>SidebarFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taxonomy<br />
<a href="/docs/api/inputObjects#taxonomyfilter"><code>TaxonomyFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
i18n<br />
<a href="/docs/api/inputObjects#i18nfilter"><code>I18nFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableSets<br />
<a href="/docs/api/inputObjects#variablesetsfilter"><code>VariableSetsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
wiki<br />
<a href="/docs/api/inputObjects#wikifilter"><code>WikiFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocumentMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#conditionsmutation"><code>ConditionsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
post<br />
<a href="/docs/api/inputObjects#postmutation"><code>PostMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
glossaryTerms<br />
<a href="/docs/api/inputObjects#glossarytermsmutation"><code>GlossaryTermsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
homepage<br />
<a href="/docs/api/inputObjects#homepagemutation"><code>HomepageMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pages<br />
<a href="/docs/api/inputObjects#pagesmutation"><code>PagesMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
settings<br />
<a href="/docs/api/inputObjects#settingsmutation"><code>SettingsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
snippets<br />
<a href="/docs/api/inputObjects#snippetsmutation"><code>SnippetsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sidebar<br />
<a href="/docs/api/inputObjects#sidebarmutation"><code>SidebarMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taxonomy<br />
<a href="/docs/api/inputObjects#taxonomymutation"><code>TaxonomyMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docmutation"><code>DocMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
i18n<br />
<a href="/docs/api/inputObjects#i18nmutation"><code>I18nMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableSets<br />
<a href="/docs/api/inputObjects#variablesetsmutation"><code>VariableSetsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
wiki<br />
<a href="/docs/api/inputObjects#wikimutation"><code>WikiMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DocumentUpdateMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#conditionsmutation"><code>ConditionsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
post<br />
<a href="/docs/api/inputObjects#postmutation"><code>PostMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
glossaryTerms<br />
<a href="/docs/api/inputObjects#glossarytermsmutation"><code>GlossaryTermsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
homepage<br />
<a href="/docs/api/inputObjects#homepagemutation"><code>HomepageMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pages<br />
<a href="/docs/api/inputObjects#pagesmutation"><code>PagesMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
settings<br />
<a href="/docs/api/inputObjects#settingsmutation"><code>SettingsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
snippets<br />
<a href="/docs/api/inputObjects#snippetsmutation"><code>SnippetsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sidebar<br />
<a href="/docs/api/inputObjects#sidebarmutation"><code>SidebarMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taxonomy<br />
<a href="/docs/api/inputObjects#taxonomymutation"><code>TaxonomyMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docmutation"><code>DocMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
i18n<br />
<a href="/docs/api/inputObjects#i18nmutation"><code>I18nMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableSets<br />
<a href="/docs/api/inputObjects#variablesetsmutation"><code>VariableSetsMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
wiki<br />
<a href="/docs/api/inputObjects#wikimutation"><code>WikiMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relativePath<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
glossaryTerms<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsfilter"><code>GlossaryTermsGlossaryTermsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
glossaryTerm<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermfilter"><code>GlossaryTermsGlossaryTermsGlossaryTermFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
key<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermlanguagesfilter"><code>GlossaryTermsGlossaryTermsGlossaryTermLanguagesFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
language<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermlanguageslanguagefilter"><code>GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
lang<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
translations<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermlanguageslanguagetranslationsfilter"><code>GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
lang<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
translations<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermlanguageslanguagetranslationsmutation"><code>[GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
translation<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermlanguageslanguagetranslationstranslationfilter"><code>GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsTranslationFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
translation<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermlanguageslanguagetranslationstranslationmutation"><code>GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsTranslationMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsTranslationFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
term<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
definition<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageTranslationsTranslationMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
term<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
definition<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermLanguagesMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
language<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermlanguageslanguagemutation"><code>GlossaryTermsGlossaryTermsGlossaryTermLanguagesLanguageMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsGlossaryTermMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
key<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermlanguagesmutation"><code>[GlossaryTermsGlossaryTermsGlossaryTermLanguagesMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsGlossaryTermsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
glossaryTerm<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsglossarytermmutation"><code>GlossaryTermsGlossaryTermsGlossaryTermMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GlossaryTermsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
glossaryTerms<br />
<a href="/docs/api/inputObjects#glossarytermsglossarytermsmutation"><code>[GlossaryTermsGlossaryTermsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksFeaturesFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#homepageblocksfeaturesitemsfilter"><code>HomepageBlocksFeaturesItemsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksFeaturesItemsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/docs/api/inputObjects#imagefilter"><code>ImageFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksFeaturesItemsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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

## HomepageBlocksFeaturesMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#homepageblocksfeaturesitemsmutation"><code>[HomepageBlocksFeaturesItemsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
hero<br />
<a href="/docs/api/inputObjects#homepageblocksherofilter"><code>HomepageBlocksHeroFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
features<br />
<a href="/docs/api/inputObjects#homepageblocksfeaturesfilter"><code>HomepageBlocksFeaturesFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
youTubeEmbed<br />
<a href="/docs/api/inputObjects#homepageblocksyoutubeembedfilter"><code>HomepageBlocksYouTubeEmbedFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksHeroDocumentFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksHeroFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subtitle<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
document<br />
<a href="/docs/api/inputObjects#homepageblocksherodocumentfilter"><code>HomepageBlocksHeroDocumentFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
documentLabel<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksHeroMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
<a href="/docs/api/scalars#string"><code>String</code></a>
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

## HomepageBlocksMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
hero<br />
<a href="/docs/api/inputObjects#homepageblocksheromutation"><code>HomepageBlocksHeroMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
features<br />
<a href="/docs/api/inputObjects#homepageblocksfeaturesmutation"><code>HomepageBlocksFeaturesMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
youTubeEmbed<br />
<a href="/docs/api/inputObjects#homepageblocksyoutubeembedmutation"><code>HomepageBlocksYouTubeEmbedMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksYouTubeEmbedFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
caption<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageBlocksYouTubeEmbedMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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

## HomepageFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_warning<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
blocks<br />
<a href="/docs/api/inputObjects#homepageblocksfilter"><code>HomepageBlocksFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## HomepageMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
<a href="/docs/api/scalars#string"><code>String</code></a>
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
<a href="/docs/api/inputObjects#homepageblocksmutation"><code>[HomepageBlocksMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyAdmonitionFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyAFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
id<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyCodeSnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
language<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyConditionalTextFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
text<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageLogic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireBothConditions<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fallback<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
debug<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyDetailsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyDocCardListFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyFigureFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
img<br />
<a href="/docs/api/inputObjects#imagefilter"><code>ImageFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
caption<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
Admonition<br />
<a href="/docs/api/inputObjects#i18nbodyadmonitionfilter"><code>I18nBodyAdmonitionFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
CodeSnippet<br />
<a href="/docs/api/inputObjects#i18nbodycodesnippetfilter"><code>I18nBodyCodeSnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hidden<br />
<a href="/docs/api/inputObjects#i18nbodyhiddenfilter"><code>I18nBodyHiddenFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ConditionalText<br />
<a href="/docs/api/inputObjects#i18nbodyconditionaltextfilter"><code>I18nBodyConditionalTextFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
a<br />
<a href="/docs/api/inputObjects#i18nbodyafilter"><code>I18nBodyAFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Details<br />
<a href="/docs/api/inputObjects#i18nbodydetailsfilter"><code>I18nBodyDetailsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
DocCardList<br />
<a href="/docs/api/inputObjects#i18nbodydoccardlistfilter"><code>I18nBodyDocCardListFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Figure<br />
<a href="/docs/api/inputObjects#i18nbodyfigurefilter"><code>I18nBodyFigureFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Footnote<br />
<a href="/docs/api/inputObjects#i18nbodyfootnotefilter"><code>I18nBodyFootnoteFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
GlossaryTerm<br />
<a href="/docs/api/inputObjects#i18nbodyglossarytermfilter"><code>I18nBodyGlossaryTermFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Snippet<br />
<a href="/docs/api/inputObjects#i18nbodysnippetfilter"><code>I18nBodySnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Passthrough<br />
<a href="/docs/api/inputObjects#i18nbodypassthroughfilter"><code>I18nBodyPassthroughFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Tabs<br />
<a href="/docs/api/inputObjects#i18nbodytabsfilter"><code>I18nBodyTabsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
truncate<br />
<a href="/docs/api/inputObjects#i18nbodytruncatefilter"><code>I18nBodyTruncateFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
VariableSet<br />
<a href="/docs/api/inputObjects#i18nbodyvariablesetfilter"><code>I18nBodyVariableSetFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyFootnoteFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyGlossaryTermFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
termKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyHiddenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
comment<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyPassthroughFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
string<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodySnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyTabsChildrenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
TabItem<br />
<a href="/docs/api/inputObjects#i18nbodytabschildrentabitemfilter"><code>I18nBodyTabsChildrenTabItemFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyTabsChildrenTabItemFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
value<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
default<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyTabsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#i18nbodytabschildrenfilter"><code>I18nBodyTabsChildrenFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyTruncateFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
deactivate<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nBodyVariableSetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
setKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/inputObjects#i18nbodyfilter"><code>I18nBodyFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## I18nMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## ImageFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
startsWith<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
eq<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
exists<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
in<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyAdmonitionFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyAFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
id<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyCodeSnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
language<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyConditionalTextFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
text<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageLogic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireBothConditions<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fallback<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
debug<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyDetailsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyDocCardListFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyFigureFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
img<br />
<a href="/docs/api/inputObjects#imagefilter"><code>ImageFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
caption<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
Admonition<br />
<a href="/docs/api/inputObjects#pagesbodyadmonitionfilter"><code>PagesBodyAdmonitionFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
CodeSnippet<br />
<a href="/docs/api/inputObjects#pagesbodycodesnippetfilter"><code>PagesBodyCodeSnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hidden<br />
<a href="/docs/api/inputObjects#pagesbodyhiddenfilter"><code>PagesBodyHiddenFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ConditionalText<br />
<a href="/docs/api/inputObjects#pagesbodyconditionaltextfilter"><code>PagesBodyConditionalTextFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
a<br />
<a href="/docs/api/inputObjects#pagesbodyafilter"><code>PagesBodyAFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Details<br />
<a href="/docs/api/inputObjects#pagesbodydetailsfilter"><code>PagesBodyDetailsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
DocCardList<br />
<a href="/docs/api/inputObjects#pagesbodydoccardlistfilter"><code>PagesBodyDocCardListFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Figure<br />
<a href="/docs/api/inputObjects#pagesbodyfigurefilter"><code>PagesBodyFigureFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Footnote<br />
<a href="/docs/api/inputObjects#pagesbodyfootnotefilter"><code>PagesBodyFootnoteFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
GlossaryTerm<br />
<a href="/docs/api/inputObjects#pagesbodyglossarytermfilter"><code>PagesBodyGlossaryTermFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Snippet<br />
<a href="/docs/api/inputObjects#pagesbodysnippetfilter"><code>PagesBodySnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Passthrough<br />
<a href="/docs/api/inputObjects#pagesbodypassthroughfilter"><code>PagesBodyPassthroughFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Tabs<br />
<a href="/docs/api/inputObjects#pagesbodytabsfilter"><code>PagesBodyTabsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
truncate<br />
<a href="/docs/api/inputObjects#pagesbodytruncatefilter"><code>PagesBodyTruncateFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
VariableSet<br />
<a href="/docs/api/inputObjects#pagesbodyvariablesetfilter"><code>PagesBodyVariableSetFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyFootnoteFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyGlossaryTermFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
termKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyHiddenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
comment<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyPassthroughFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
string<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodySnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyTabsChildrenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
TabItem<br />
<a href="/docs/api/inputObjects#pagesbodytabschildrentabitemfilter"><code>PagesBodyTabsChildrenTabItemFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyTabsChildrenTabItemFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
value<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
default<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyTabsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#pagesbodytabschildrenfilter"><code>PagesBodyTabsChildrenFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyTruncateFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
deactivate<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesBodyVariableSetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
setKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/inputObjects#pagesbodyfilter"><code>PagesBodyFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PagesMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## PostAuthorsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image_url<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostAuthorsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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

## PostBodyAdmonitionFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyAFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
id<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyCodeSnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
language<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyConditionalTextFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
text<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageLogic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireBothConditions<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fallback<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
debug<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyDetailsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyDocCardListFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyFigureFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
img<br />
<a href="/docs/api/inputObjects#imagefilter"><code>ImageFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
caption<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
Admonition<br />
<a href="/docs/api/inputObjects#postbodyadmonitionfilter"><code>PostBodyAdmonitionFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
CodeSnippet<br />
<a href="/docs/api/inputObjects#postbodycodesnippetfilter"><code>PostBodyCodeSnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hidden<br />
<a href="/docs/api/inputObjects#postbodyhiddenfilter"><code>PostBodyHiddenFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ConditionalText<br />
<a href="/docs/api/inputObjects#postbodyconditionaltextfilter"><code>PostBodyConditionalTextFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
a<br />
<a href="/docs/api/inputObjects#postbodyafilter"><code>PostBodyAFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Details<br />
<a href="/docs/api/inputObjects#postbodydetailsfilter"><code>PostBodyDetailsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
DocCardList<br />
<a href="/docs/api/inputObjects#postbodydoccardlistfilter"><code>PostBodyDocCardListFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Figure<br />
<a href="/docs/api/inputObjects#postbodyfigurefilter"><code>PostBodyFigureFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Footnote<br />
<a href="/docs/api/inputObjects#postbodyfootnotefilter"><code>PostBodyFootnoteFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
GlossaryTerm<br />
<a href="/docs/api/inputObjects#postbodyglossarytermfilter"><code>PostBodyGlossaryTermFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Snippet<br />
<a href="/docs/api/inputObjects#postbodysnippetfilter"><code>PostBodySnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Passthrough<br />
<a href="/docs/api/inputObjects#postbodypassthroughfilter"><code>PostBodyPassthroughFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Tabs<br />
<a href="/docs/api/inputObjects#postbodytabsfilter"><code>PostBodyTabsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
truncate<br />
<a href="/docs/api/inputObjects#postbodytruncatefilter"><code>PostBodyTruncateFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
VariableSet<br />
<a href="/docs/api/inputObjects#postbodyvariablesetfilter"><code>PostBodyVariableSetFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyFootnoteFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyGlossaryTermFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
termKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyHiddenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
comment<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyPassthroughFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
string<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodySnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyTabsChildrenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
TabItem<br />
<a href="/docs/api/inputObjects#postbodytabschildrentabitemfilter"><code>PostBodyTabsChildrenTabItemFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyTabsChildrenTabItemFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
value<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
default<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyTabsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#postbodytabschildrenfilter"><code>PostBodyTabsChildrenFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyTruncateFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
deactivate<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostBodyVariableSetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
setKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
authors<br />
<a href="/docs/api/inputObjects#postauthorsfilter"><code>PostAuthorsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
date<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/inputObjects#postbodyfilter"><code>PostBodyFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PostMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
authors<br />
<a href="/docs/api/inputObjects#postauthorsmutation"><code>[PostAuthorsMutation]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
date<br />
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
body<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## RichTextFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
startsWith<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
eq<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
exists<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_warning<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logo<br />
<a href="/docs/api/inputObjects#settingslogofilter"><code>SettingsLogoFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagline<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
footer<br />
<a href="/docs/api/inputObjects#settingsfooterfilter"><code>SettingsFooterFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
style<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/inputObjects#settingsfooterlinksfilter"><code>SettingsFooterLinksFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
copyright<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#settingsfooterlinksitemsfilter"><code>SettingsFooterLinksItemsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsBlogFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsBlogMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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

## SettingsFooterLinksItemsExternalFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsExternalMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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

## SettingsFooterLinksItemsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
internal<br />
<a href="/docs/api/inputObjects#settingsfooterlinksitemsinternalfilter"><code>SettingsFooterLinksItemsInternalFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
blog<br />
<a href="/docs/api/inputObjects#settingsfooterlinksitemsblogfilter"><code>SettingsFooterLinksItemsBlogFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
external<br />
<a href="/docs/api/inputObjects#settingsfooterlinksitemsexternalfilter"><code>SettingsFooterLinksItemsExternalFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsInternalFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/docs/api/inputObjects#settingsfooterlinksitemsinternaltofilter"><code>SettingsFooterLinksItemsInternalToFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsInternalMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsInternalToFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
post<br />
<a href="/docs/api/inputObjects#postfilter"><code>PostFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pages<br />
<a href="/docs/api/inputObjects#pagesfilter"><code>PagesFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksItemsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
internal<br />
<a href="/docs/api/inputObjects#settingsfooterlinksitemsinternalmutation"><code>SettingsFooterLinksItemsInternalMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
blog<br />
<a href="/docs/api/inputObjects#settingsfooterlinksitemsblogmutation"><code>SettingsFooterLinksItemsBlogMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
external<br />
<a href="/docs/api/inputObjects#settingsfooterlinksitemsexternalmutation"><code>SettingsFooterLinksItemsExternalMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterLinksMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
<a href="/docs/api/inputObjects#settingsfooterlinksitemsmutation"><code>[SettingsFooterLinksItemsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsFooterMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
<a href="/docs/api/inputObjects#settingsfooterlinksmutation"><code>[SettingsFooterLinksMutation]</code></a>
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

## SettingsLogoFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
alt<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
src<br />
<a href="/docs/api/inputObjects#imagefilter"><code>ImageFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SettingsLogoMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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

## SettingsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logo<br />
<a href="/docs/api/inputObjects#settingslogomutation"><code>SettingsLogoMutation</code></a>
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
tagline<br />
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
footer<br />
<a href="/docs/api/inputObjects#settingsfootermutation"><code>SettingsFooterMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_warning<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#sidebaritemsfilter"><code>SidebarItemsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryDocLinkFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/inputObjects#sidebaritemscategorydoclinkfilter"><code>SidebarItemsCategoryDocLinkFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemsfilter"><code>SidebarItemsCategoryItemsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryDocLinkFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategorydoclinkfilter"><code>SidebarItemsCategoryItemsCategoryDocLinkFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemsfilter"><code>SidebarItemsCategoryItemsCategoryItemsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryDocLinkFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategorydoclinkfilter"><code>SidebarItemsCategoryItemsCategoryItemsCategoryDocLinkFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategoryitemsfilter"><code>SidebarItemsCategoryItemsCategoryItemsCategoryItemsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsDocDocumentFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsDocFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategoryitemsdocdocumentfilter"><code>SidebarItemsCategoryItemsCategoryItemsCategoryItemsDocDocumentFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsDocMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategoryitemsdocfilter"><code>SidebarItemsCategoryItemsCategoryItemsCategoryItemsDocFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategoryitemslinkfilter"><code>SidebarItemsCategoryItemsCategoryItemsCategoryItemsLinkFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsLinkFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsLinkMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
href<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryItemsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategoryitemsdocmutation"><code>SidebarItemsCategoryItemsCategoryItemsCategoryItemsDocMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategoryitemslinkmutation"><code>SidebarItemsCategoryItemsCategoryItemsCategoryItemsLinkMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsCategoryMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
link<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategoryitemsmutation"><code>[SidebarItemsCategoryItemsCategoryItemsCategoryItemsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsDocDocumentFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsDocFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemsdocdocumentfilter"><code>SidebarItemsCategoryItemsCategoryItemsDocDocumentFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsDocMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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

## SidebarItemsCategoryItemsCategoryItemsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
category<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategoryfilter"><code>SidebarItemsCategoryItemsCategoryItemsCategoryFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemsdocfilter"><code>SidebarItemsCategoryItemsCategoryItemsDocFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemslinkfilter"><code>SidebarItemsCategoryItemsCategoryItemsLinkFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsLinkFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsLinkMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
href<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryItemsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
category<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemscategorymutation"><code>SidebarItemsCategoryItemsCategoryItemsCategoryMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemsdocmutation"><code>SidebarItemsCategoryItemsCategoryItemsDocMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemslinkmutation"><code>SidebarItemsCategoryItemsCategoryItemsLinkMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsCategoryMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
link<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryitemsmutation"><code>[SidebarItemsCategoryItemsCategoryItemsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsDocDocumentFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsDocFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemsdocdocumentfilter"><code>SidebarItemsCategoryItemsDocDocumentFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsDocMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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

## SidebarItemsCategoryItemsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
category<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategoryfilter"><code>SidebarItemsCategoryItemsCategoryFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemsdocfilter"><code>SidebarItemsCategoryItemsDocFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemslinkfilter"><code>SidebarItemsCategoryItemsLinkFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsLinkFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsLinkMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
href<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryItemsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
category<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemscategorymutation"><code>SidebarItemsCategoryItemsCategoryMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemsdocmutation"><code>SidebarItemsCategoryItemsDocMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemslinkmutation"><code>SidebarItemsCategoryItemsLinkMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsCategoryMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
link<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
docLink<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryitemsmutation"><code>[SidebarItemsCategoryItemsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsDocDocumentFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#docfilter"><code>DocFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsDocFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/inputObjects#sidebaritemsdocdocumentfilter"><code>SidebarItemsDocDocumentFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsDocMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
document<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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

## SidebarItemsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
category<br />
<a href="/docs/api/inputObjects#sidebaritemscategoryfilter"><code>SidebarItemsCategoryFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#sidebaritemsdocfilter"><code>SidebarItemsDocFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#sidebaritemslinkfilter"><code>SidebarItemsLinkFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsLinkFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
href<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsLinkMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
href<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarItemsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
category<br />
<a href="/docs/api/inputObjects#sidebaritemscategorymutation"><code>SidebarItemsCategoryMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#sidebaritemsdocmutation"><code>SidebarItemsDocMutation</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/docs/api/inputObjects#sidebaritemslinkmutation"><code>SidebarItemsLinkMutation</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SidebarMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#sidebaritemsmutation"><code>[SidebarItemsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyAdmonitionFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyAFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
id<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyCodeSnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
language<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyConditionalTextFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
text<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageLogic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireBothConditions<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fallback<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
debug<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyDetailsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyDocCardListFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyFigureFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
img<br />
<a href="/docs/api/inputObjects#imagefilter"><code>ImageFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
caption<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
Admonition<br />
<a href="/docs/api/inputObjects#snippetsbodyadmonitionfilter"><code>SnippetsBodyAdmonitionFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
CodeSnippet<br />
<a href="/docs/api/inputObjects#snippetsbodycodesnippetfilter"><code>SnippetsBodyCodeSnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hidden<br />
<a href="/docs/api/inputObjects#snippetsbodyhiddenfilter"><code>SnippetsBodyHiddenFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ConditionalText<br />
<a href="/docs/api/inputObjects#snippetsbodyconditionaltextfilter"><code>SnippetsBodyConditionalTextFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
a<br />
<a href="/docs/api/inputObjects#snippetsbodyafilter"><code>SnippetsBodyAFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Details<br />
<a href="/docs/api/inputObjects#snippetsbodydetailsfilter"><code>SnippetsBodyDetailsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
DocCardList<br />
<a href="/docs/api/inputObjects#snippetsbodydoccardlistfilter"><code>SnippetsBodyDocCardListFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Figure<br />
<a href="/docs/api/inputObjects#snippetsbodyfigurefilter"><code>SnippetsBodyFigureFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Footnote<br />
<a href="/docs/api/inputObjects#snippetsbodyfootnotefilter"><code>SnippetsBodyFootnoteFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
GlossaryTerm<br />
<a href="/docs/api/inputObjects#snippetsbodyglossarytermfilter"><code>SnippetsBodyGlossaryTermFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Snippet<br />
<a href="/docs/api/inputObjects#snippetsbodysnippetfilter"><code>SnippetsBodySnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Passthrough<br />
<a href="/docs/api/inputObjects#snippetsbodypassthroughfilter"><code>SnippetsBodyPassthroughFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Tabs<br />
<a href="/docs/api/inputObjects#snippetsbodytabsfilter"><code>SnippetsBodyTabsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
truncate<br />
<a href="/docs/api/inputObjects#snippetsbodytruncatefilter"><code>SnippetsBodyTruncateFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
VariableSet<br />
<a href="/docs/api/inputObjects#snippetsbodyvariablesetfilter"><code>SnippetsBodyVariableSetFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyFootnoteFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyGlossaryTermFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
termKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyHiddenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
comment<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyPassthroughFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
string<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodySnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyTabsChildrenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
TabItem<br />
<a href="/docs/api/inputObjects#snippetsbodytabschildrentabitemfilter"><code>SnippetsBodyTabsChildrenTabItemFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyTabsChildrenTabItemFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
value<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
default<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyTabsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#snippetsbodytabschildrenfilter"><code>SnippetsBodyTabsChildrenFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyTruncateFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
deactivate<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsBodyVariableSetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
setKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/inputObjects#snippetsbodyfilter"><code>SnippetsBodyFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SnippetsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## StringFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
startsWith<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
eq<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
exists<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
in<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
taxonomy<br />
<a href="/docs/api/inputObjects#taxonomytaxonomyfilter"><code>TaxonomyTaxonomyFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
taxonomy<br />
<a href="/docs/api/inputObjects#taxonomytaxonomymutation"><code>[TaxonomyTaxonomyMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomyChildrenChildrenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomyChildrenChildrenMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomyChildrenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#taxonomytaxonomychildrenchildrenfilter"><code>TaxonomyTaxonomyChildrenChildrenFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomyChildrenMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#taxonomytaxonomychildrenchildrenmutation"><code>[TaxonomyTaxonomyChildrenChildrenMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomyFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#taxonomytaxonomychildrenfilter"><code>TaxonomyTaxonomyChildrenFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaxonomyTaxonomyMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tag<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#taxonomytaxonomychildrenmutation"><code>[TaxonomyTaxonomyChildrenMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
variableSets<br />
<a href="/docs/api/inputObjects#variablesetsvariablesetsfilter"><code>VariableSetsVariableSetsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
variableSets<br />
<a href="/docs/api/inputObjects#variablesetsvariablesetsmutation"><code>[VariableSetsVariableSetsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSetsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variables<br />
<a href="/docs/api/inputObjects#variablesetsvariablesetsvariablesfilter"><code>VariableSetsVariableSetsVariablesFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSetsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variables<br />
<a href="/docs/api/inputObjects#variablesetsvariablesetsvariablesmutation"><code>[VariableSetsVariableSetsVariablesMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSetsVariablesFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
key<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
translations<br />
<a href="/docs/api/inputObjects#variablesetsvariablesetsvariablestranslationsfilter"><code>VariableSetsVariableSetsVariablesTranslationsFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSetsVariablesMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
key<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
translations<br />
<a href="/docs/api/inputObjects#variablesetsvariablesetsvariablestranslationsmutation"><code>[VariableSetsVariableSetsVariablesTranslationsMutation]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSetsVariablesTranslationsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
lang<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VariableSetsVariableSetsVariablesTranslationsMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
lang<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyAdmonitionFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyAFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
id<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyCodeSnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
language<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyConditionalTextFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
text<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languages<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageLogic<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireBothConditions<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fallback<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
debug<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyDetailsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyDocCardListFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyFigureFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
img<br />
<a href="/docs/api/inputObjects#imagefilter"><code>ImageFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
caption<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
Admonition<br />
<a href="/docs/api/inputObjects#wikibodyadmonitionfilter"><code>WikiBodyAdmonitionFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
CodeSnippet<br />
<a href="/docs/api/inputObjects#wikibodycodesnippetfilter"><code>WikiBodyCodeSnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hidden<br />
<a href="/docs/api/inputObjects#wikibodyhiddenfilter"><code>WikiBodyHiddenFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ConditionalText<br />
<a href="/docs/api/inputObjects#wikibodyconditionaltextfilter"><code>WikiBodyConditionalTextFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
a<br />
<a href="/docs/api/inputObjects#wikibodyafilter"><code>WikiBodyAFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Details<br />
<a href="/docs/api/inputObjects#wikibodydetailsfilter"><code>WikiBodyDetailsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
DocCardList<br />
<a href="/docs/api/inputObjects#wikibodydoccardlistfilter"><code>WikiBodyDocCardListFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Figure<br />
<a href="/docs/api/inputObjects#wikibodyfigurefilter"><code>WikiBodyFigureFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Footnote<br />
<a href="/docs/api/inputObjects#wikibodyfootnotefilter"><code>WikiBodyFootnoteFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
GlossaryTerm<br />
<a href="/docs/api/inputObjects#wikibodyglossarytermfilter"><code>WikiBodyGlossaryTermFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Snippet<br />
<a href="/docs/api/inputObjects#wikibodysnippetfilter"><code>WikiBodySnippetFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Passthrough<br />
<a href="/docs/api/inputObjects#wikibodypassthroughfilter"><code>WikiBodyPassthroughFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
Tabs<br />
<a href="/docs/api/inputObjects#wikibodytabsfilter"><code>WikiBodyTabsFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
truncate<br />
<a href="/docs/api/inputObjects#wikibodytruncatefilter"><code>WikiBodyTruncateFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
VariableSet<br />
<a href="/docs/api/inputObjects#wikibodyvariablesetfilter"><code>WikiBodyVariableSetFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyFootnoteFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyGlossaryTermFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
termKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyHiddenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
comment<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyPassthroughFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
summary<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
string<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodySnippetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filepath<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyTabsChildrenFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
TabItem<br />
<a href="/docs/api/inputObjects#wikibodytabschildrentabitemfilter"><code>WikiBodyTabsChildrenTabItemFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyTabsChildrenTabItemFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
value<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
default<br />
<a href="/docs/api/inputObjects#booleanfilter"><code>BooleanFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#richtextfilter"><code>RichTextFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyTabsFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
children<br />
<a href="/docs/api/inputObjects#wikibodytabschildrenfilter"><code>WikiBodyTabsChildrenFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyTruncateFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
deactivate<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiBodyVariableSetFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
setKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
variableKey<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiFilter



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
title<br />
<a href="/docs/api/inputObjects#stringfilter"><code>StringFilter</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/inputObjects#wikibodyfilter"><code>WikiBodyFilter</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WikiMutation



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
body<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

