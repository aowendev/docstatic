---
id: mutations
title: Mutations
slug: mutations
sidebar_position: 2
---

## addPendingDocument

**Type:** [DocumentNode!](/docs/api/unions#documentnode)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
collection<br />
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
template<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createConditions

**Type:** [Conditions!](/docs/api/objects#conditions)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#conditionsmutation"><code>ConditionsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createDoc

**Type:** [Doc!](/docs/api/objects#doc)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#docmutation"><code>DocMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createDocument

**Type:** [DocumentNode!](/docs/api/unions#documentnode)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
collection<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
params<br />
<a href="/docs/api/inputObjects#documentmutation"><code>DocumentMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createFolder

**Type:** [DocumentNode!](/docs/api/unions#documentnode)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
collection<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
</tbody>
</table>

## createGlossaryTerms

**Type:** [GlossaryTerms!](/docs/api/objects#glossaryterms)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#glossarytermsmutation"><code>GlossaryTermsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createHomepage

**Type:** [Homepage!](/docs/api/objects#homepage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#homepagemutation"><code>HomepageMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createI18n

**Type:** [I18n!](/docs/api/objects#i18n)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#i18nmutation"><code>I18nMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createPages

**Type:** [Pages!](/docs/api/objects#pages)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#pagesmutation"><code>PagesMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createPost

**Type:** [Post!](/docs/api/objects#post)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#postmutation"><code>PostMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createSettings

**Type:** [Settings!](/docs/api/objects#settings)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#settingsmutation"><code>SettingsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createSidebar

**Type:** [Sidebar!](/docs/api/objects#sidebar)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#sidebarmutation"><code>SidebarMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createSnippets

**Type:** [Snippets!](/docs/api/objects#snippets)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#snippetsmutation"><code>SnippetsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createTaxonomy

**Type:** [Taxonomy!](/docs/api/objects#taxonomy)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#taxonomymutation"><code>TaxonomyMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createVariableSets

**Type:** [VariableSets!](/docs/api/objects#variablesets)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#variablesetsmutation"><code>VariableSetsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createWiki

**Type:** [Wiki!](/docs/api/objects#wiki)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#wikimutation"><code>WikiMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## deleteDocument

**Type:** [DocumentNode!](/docs/api/unions#documentnode)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
collection<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
</tbody>
</table>

## updateConditions

**Type:** [Conditions!](/docs/api/objects#conditions)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#conditionsmutation"><code>ConditionsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateDoc

**Type:** [Doc!](/docs/api/objects#doc)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#docmutation"><code>DocMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateDocument

**Type:** [DocumentNode!](/docs/api/unions#documentnode)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
collection<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
params<br />
<a href="/docs/api/inputObjects#documentupdatemutation"><code>DocumentUpdateMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateGlossaryTerms

**Type:** [GlossaryTerms!](/docs/api/objects#glossaryterms)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#glossarytermsmutation"><code>GlossaryTermsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateHomepage

**Type:** [Homepage!](/docs/api/objects#homepage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#homepagemutation"><code>HomepageMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateI18n

**Type:** [I18n!](/docs/api/objects#i18n)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#i18nmutation"><code>I18nMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updatePages

**Type:** [Pages!](/docs/api/objects#pages)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#pagesmutation"><code>PagesMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updatePost

**Type:** [Post!](/docs/api/objects#post)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#postmutation"><code>PostMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateSettings

**Type:** [Settings!](/docs/api/objects#settings)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#settingsmutation"><code>SettingsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateSidebar

**Type:** [Sidebar!](/docs/api/objects#sidebar)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#sidebarmutation"><code>SidebarMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateSnippets

**Type:** [Snippets!](/docs/api/objects#snippets)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#snippetsmutation"><code>SnippetsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateTaxonomy

**Type:** [Taxonomy!](/docs/api/objects#taxonomy)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#taxonomymutation"><code>TaxonomyMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateVariableSets

**Type:** [VariableSets!](/docs/api/objects#variablesets)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#variablesetsmutation"><code>VariableSetsMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateWiki

**Type:** [Wiki!](/docs/api/objects#wiki)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
params<br />
<a href="/docs/api/inputObjects#wikimutation"><code>WikiMutation!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

