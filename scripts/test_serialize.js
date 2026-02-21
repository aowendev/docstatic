// Quick test for serializeRichTextToMarkdown
function serializeRichTextToMarkdown(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(serializeRichTextToMarkdown).join('');
  const type = node.type;
  switch (type) {
    case 'root':
      return (node.children || []).map(serializeRichTextToMarkdown).join('\n\n');
    case 'p':
      return (node.children || []).map(serializeRichTextToMarkdown).join('');
    case 'heading': {
      const depth = node.depth || 1;
      const prefix = '#'.repeat(Math.max(1, Math.min(6, depth)));
      const content = (node.children || []).map(serializeRichTextToMarkdown).join('');
      return `${prefix} ${content}`;
    }
    case 'code': {
      const lang = node.lang || '';
      const content = node.value || (node.children || []).map(serializeRichTextToMarkdown).join('');
      return '\n\n```' + (lang ? ' ' + lang : '') + '\n' + content + '\n```\n\n';
    }
    case 'blockquote': {
      const content = (node.children || []).map(serializeRichTextToMarkdown).join('\n');
      return content.split('\n').map(line => `> ${line}`).join('\n');
    }
    case 'text': {
      let txt = node.text || '';
      if (node.bold) txt = `**${txt}**`;
      if (node.italic) txt = `_${txt}_`;
      return txt;
    }
    case 'inlineCode':
      return `\`${node.value || node.text || ''}\``;
    case 'ol': {
      return (node.children || []).map((li, idx) => {
        const content = (li.children || []).map(serializeRichTextToMarkdown).join('');
        return `${idx + 1}. ${content}`;
      }).join('\n');
    }
    case 'ul': {
      return (node.children || []).map((li) => {
        const content = (li.children || []).map(serializeRichTextToMarkdown).join('');
        return `- ${content}`;
      }).join('\n');
    }
    case 'li':
    case 'lic':
      return (node.children || []).map(serializeRichTextToMarkdown).join('');
    case 'link': {
      const text = (node.children || []).map(serializeRichTextToMarkdown).join('') || node.title || '';
      const href = node.url || node.href || '';
      return href ? `[${text}](${href})` : text;
    }
    case 'image': {
      const alt = node.alt || node.title || '';
      const src = node.url || node.src || '';
      return `![${alt}](${src})`;
    }
    case 'jsx':
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement': {
      if (node.value) return node.value;
      if (node.name) {
        const name = node.name;
        const props = node.attributes ? node.attributes.map(attr => {
          if (attr.value === true || attr.value === undefined) return attr.name;
          return `${attr.name}=${JSON.stringify(attr.value)}`;
        }).join(' ') : '';
        const open = props ? `<${name} ${props}>` : `<${name}>`;
        const children = (node.children || []).map(serializeRichTextToMarkdown).join('');
        return `${open}${children}</${name}>`;
      }
      return '';
    }
    default:
      return (node.children || []).map(serializeRichTextToMarkdown).join('');
  }
}

const sample = {
  type: 'root',
  children: [
    { type: 'heading', depth: 2, children: [{ type: 'text', text: 'Overview' }] },
    { type: 'p', children: [{ type: 'text', text: 'This is an ' }, { type: 'text', text: 'example', bold: true }, { type: 'text', text: ' with a ' }, { type: 'link', url: 'https://example.com', children: [{ type: 'text', text: 'link' }] }, { type: 'text', text: '.' }] },
    { type: 'code', lang: 'js', value: "console.log('hello');" },
    { type: 'ul', children: [ { type: 'li', children: [{ type: 'text', text: 'First item' }] }, { type: 'li', children: [{ type: 'text', text: 'Second item with ' }, { type: 'inlineCode', value: 'inline()' }] } ] },
    { type: 'p', children: [ { type: 'text', text: 'Here is a component: ' }, { type: 'mdxJsxTextElement', name: 'MyComponent', attributes: [{ name: 'prop', value: 'value' }], children: [] } ] },
    { type: 'image', url: '/img/logo.png', alt: 'Logo' }
  ]
};

console.log(serializeRichTextToMarkdown(sample));
