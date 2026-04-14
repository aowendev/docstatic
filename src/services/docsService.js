// Documentation service that loads and indexes MDX files for AI context

class DocsService {
  constructor() {
    this.docsIndex = new Map();
    this.initialized = false;
    this.loadingPromise = null;
  }
  
  async initialize() {
    if (this.initialized || this.loadingPromise) {
      return this.loadingPromise;
    }
    
    console.log('📚 Loading documentation for AI context...');
    
    this.loadingPromise = this.loadAllDocs();
    await this.loadingPromise;
    this.initialized = true;
    
    console.log('📚 Documentation index ready:', this.docsIndex.size, 'files loaded');
    return this.loadingPromise;
  }
  
  async loadAllDocs() {
    // List of key documentation files to load
    const docFiles = [
      'introduction.mdx',
      'installation.mdx', 
      'configuration.mdx',
      'deployment.mdx',
      'cli.mdx',
      'using-plugins.mdx',
      'styling-layout.mdx',
      'static-assets.mdx',
      'browser-support.mdx',
      'seo.mdx',
      'search.mdx',
      'blog.mdx',
      'docusaurus-core.mdx'
    ];
    
    const loadPromises = docFiles.map(async (filename) => {
      try {
        const response = await fetch(`/docs-raw/${filename}`);
        if (response.ok) {
          const content = await response.text();
          const parsed = this.parseMDXContent(content, filename);
          this.docsIndex.set(filename, parsed);
          return parsed;
        } else {
          console.warn(`📚 Could not load ${filename}:`, response.status);
          return null;
        }
      } catch (error) {
        console.warn(`📚 Error loading ${filename}:`, error);
        return null;
      }
    });
    
    await Promise.all(loadPromises);
    
    // Fallback: Create basic knowledge from what we know about docStatic
    if (this.docsIndex.size === 0) {
      this.createFallbackIndex();
    }
  }
  
  parseMDXContent(content, filename) {
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let frontmatter = {};
    let bodyContent = content;
    
    if (frontmatterMatch) {
      bodyContent = content.slice(frontmatterMatch[0].length);
      try {
        // Simple YAML-like parsing for key fields
        const fm = frontmatterMatch[1];
        const titleMatch = fm.match(/title:\s*(.+)$/m);
        const descMatch = fm.match(/description:\s*(.+)$/m);
        
        if (titleMatch) frontmatter.title = titleMatch[1].replace(/['"]/g, '');
        if (descMatch) frontmatter.description = descMatch[1].replace(/['"]/g, '');
      } catch (e) {
        console.warn('Error parsing frontmatter for', filename);
      }
    }
    
    // Clean up MDX content - remove JSX components but keep text
    const cleanContent = bodyContent
      .replace(/import\s+.*$/gm, '') // Remove imports
      .replace(/<[^>]*>/g, '') // Remove JSX tags
      .replace(/```[\s\S]*?```/g, '[code block]') // Simplify code blocks
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
      
    // Extract key topics and keywords
    const keywords = this.extractKeywords(cleanContent);
    
    return {
      filename,
      title: frontmatter.title || filename.replace('.mdx', ''),
      description: frontmatter.description || '',
      content: cleanContent,
      keywords,
      length: cleanContent.length
    };
  }
  
  extractKeywords(content) {
    const text = content.toLowerCase();
    const keywords = new Set();
    
    // docStatic-specific terms
    const docStaticTerms = [
      'docstatic', 'tinacms', 'docusaurus', 'mdx', 'markdown',
      'component', 'template', 'cms', 'git', 'github', 'deploy', 
      'install', 'configuration', 'plugin', 'theme', 'blog',
      'documentation', 'content', 'editing', 'workflow'
    ];
    
    docStaticTerms.forEach(term => {
      if (text.includes(term)) {
        keywords.add(term);
      }
    });
    
    // Extract other significant words (simple approach)
    const words = text.match(/\b[a-z]{4,}\b/g) || [];
    const wordCount = {};
    
    words.forEach(word => {
      if (word.length > 3 && !['with', 'that', 'this', 'from', 'will', 'have', 'been'].includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Add frequent meaningful words
    Object.entries(wordCount)
      .filter(([word, count]) => count > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([word]) => keywords.add(word));
      
    return Array.from(keywords);
  }
  
  createFallbackIndex() {
    // Comprehensive built-in knowledge base for docStatic
    const fallbackDocs = {
      'introduction.mdx': {
        title: 'Introduction to docStatic',
        description: 'Modern documentation platform combining Docusaurus and TinaCMS',
        content: 'DocStatic is a modern documentation platform that bridges the gap between writers and developers to help you create online documentation your users will love. It simultaneously provides the best features of component content management systems and docs-as-code solutions for online documentation. It enables anyone on your team to create and edit your docs without sacrificing your developer workflow. DocStatic combines Docusaurus (React-based static site generator) with TinaCMS (headless content management system) to provide Git-backed documentation workflows, editing interface for Markdown, MDX, JSON, and YAML content, integration with existing Git and CI/CD workflows, embedded MDX components, media manager with support for third-party media providers, and editing in the cloud with no local setup required.',
        keywords: ['docstatic', 'docusaurus', 'tinacms', 'documentation', 'mdx', 'react', 'git', 'cms', 'introduction']
      },
      'installation.mdx': {
        title: 'Installation Guide', 
        description: 'How to install and set up docStatic',
        content: 'Install docStatic using yarn or npm package managers. Run yarn install to install all dependencies, then use yarn start to launch the development server. The platform requires Node.js and supports modern browsers. TinaCMS admin interface is available at the /admin route for content editing. The repository structure is similar to Docusaurus defaults but includes changes required for TinaCMS integration.',
        keywords: ['install', 'installation', 'yarn', 'npm', 'setup', 'development', 'admin', 'tinacms', 'nodejs', 'dependencies']
      },
      'configuration.mdx': {
        title: 'Configuration',
        description: 'Configure docStatic for your needs',
        content: 'DocStatic configuration combines Docusaurus and TinaCMS settings. Configure site metadata, themes, plugins, and content collections. The CMS uses GraphQL schema to describe content shape as collections. Default collections include conditional text, glossary terms, snippets, taxonomies, and variable sets. Configure embedded components available in the rich text editor including code blocks, comments, collapsible details, figures, footnotes, and tabs.',
        keywords: ['configuration', 'config', 'settings', 'graphql', 'schema', 'collections', 'components', 'plugins', 'themes']
      },
      'deployment.mdx': {
        title: 'Deployment',
        description: 'Deploy your docStatic site',
        content: 'DocStatic deployment uses GitHub Actions for CI/CD workflows. Source control, automation, and publishing are managed through GitHub. When editing files with the rich-text editor, TinaCMS commits on save or saves directly to the file if working locally. Git remains the source of truth for the whole team. Deploy to static hosting providers like Netlify, Vercel, or GitHub Pages.',
        keywords: ['deployment', 'deploy', 'github', 'actions', 'cicd', 'git', 'netlify', 'vercel', 'hosting', 'publishing']
      },
      'using-plugins.mdx': {
        title: 'Using Plugins',
        description: 'Work with docStatic plugins',
        content: 'DocStatic includes preconfigured plugins for enhanced functionality. Plugins extend Docusaurus capabilities for advanced features like search, analytics, and content processing. Configure plugins in the Docusaurus configuration file to customize behavior and add new capabilities to your documentation site.',
        keywords: ['plugins', 'extensions', 'features', 'search', 'analytics', 'processing', 'configuration']
      },
      'styling-layout.mdx': {
        title: 'Styling and Layout',
        description: 'Customize the appearance of your site',
        content: 'Customize docStatic appearance using CSS, themes, and React components. Modify layouts, colors, fonts, and spacing. Docusaurus provides extensive theming capabilities with CSS custom properties and component swizzling for advanced customization. Create custom MDX components and templates for consistent content presentation.',
        keywords: ['styling', 'layout', 'css', 'themes', 'components', 'customization', 'appearance', 'design']
      },
      'cli.mdx': {
        title: 'Command Line Interface',
        description: 'Use docStatic CLI commands',
        content: 'DocStatic provides command line tools for development and deployment. Common commands include yarn start for development server, yarn build for production build, yarn serve for local preview of build. Additional commands support content generation, plugin management, and deployment workflows.',
        keywords: ['cli', 'command', 'line', 'terminal', 'yarn', 'build', 'serve', 'start', 'development']
      },
      'blog.mdx': {
        title: 'Blog Features',
        description: 'Create and manage blog content',
        content: 'DocStatic supports blog functionality with Markdown and MDX posts. Create blog posts with frontmatter metadata, tags, and categories. Support for RSS feeds, pagination, and social sharing. Blog posts can include embedded components and rich media through TinaCMS integration.',
        keywords: ['blog', 'posts', 'content', 'markdown', 'mdx', 'frontmatter', 'tags', 'rss', 'social']
      },
      'search.mdx': {
        title: 'Search Functionality',
        description: 'Implement search in your documentation',
        content: 'Add search capabilities to docStatic using various search providers. Support for Algolia DocSearch, local search plugins, and custom search implementations. Configure search indexing, results display, and search behavior to help users find content quickly.',
        keywords: ['search', 'algolia', 'docsearch', 'indexing', 'results', 'find', 'discovery']
      },
      'seo.mdx': {
        title: 'SEO Optimization',
        description: 'Optimize your site for search engines',
        content: 'DocStatic provides SEO optimization features including meta tags, structured data, sitemap generation, and social media integration. Configure Open Graph and Twitter Card metadata. Optimize page titles, descriptions, and URL structure for better search engine visibility.',
        keywords: ['seo', 'optimization', 'meta', 'tags', 'sitemap', 'social', 'opengraph', 'twitter', 'search', 'engines']
      }
    };
    
    Object.entries(fallbackDocs).forEach(([filename, doc]) => {
      this.docsIndex.set(filename, { filename, ...doc });
    });
    
    console.log('📚 Using comprehensive docStatic knowledge base:', this.docsIndex.size, 'documents loaded');
  }
  
  searchRelevantDocs(query, maxResults = 3) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.match(/\b[a-z]{3,}\b/g) || [];
    
    const results = [];
    
    for (const [filename, doc] of this.docsIndex) {
      let relevanceScore = 0;
      
      // Title match (high value)
      if (doc.title.toLowerCase().includes(queryLower)) relevanceScore += 10;
      
      // Description match (medium value)
      if (doc.description.toLowerCase().includes(queryLower)) relevanceScore += 5;
      
      // Content match (low value)
      if (doc.content.toLowerCase().includes(queryLower)) relevanceScore += 2;
      
      // Keyword matches
      queryWords.forEach(word => {
        if (doc.keywords.includes(word)) relevanceScore += 3;
      });
      
      // Specific topic detection with enhanced matching
      const topicMappings = {
        'install': ['installation', 'setup', 'getting started'],
        'config': ['configuration', 'settings', 'setup'],
        'deploy': ['deployment', 'publish', 'hosting', 'github actions'],
        'style': ['styling', 'theme', 'css', 'appearance', 'layout'],
        'plugin': ['plugins', 'extensions', 'features'],
        'blog': ['blog', 'posts', 'content'],
        'search': ['search', 'find', 'discovery', 'algolia'],
        'seo': ['seo', 'optimization', 'meta', 'social']
      };
      
      Object.entries(topicMappings).forEach(([key, aliases]) => {
        const matchFound = aliases.some(alias => queryLower.includes(alias));
        if (matchFound) {
          if (key === 'install' && filename.includes('installation')) relevanceScore += 15;
          if (key === 'config' && filename.includes('configuration')) relevanceScore += 15;
          if (key === 'deploy' && filename.includes('deployment')) relevanceScore += 15;
          if (key === 'style' && filename.includes('styling')) relevanceScore += 15;
          if (key === 'plugin' && filename.includes('plugins')) relevanceScore += 15;
          if (key === 'blog' && filename.includes('blog')) relevanceScore += 15;
          if (key === 'search' && filename.includes('search')) relevanceScore += 15;
          if (key === 'seo' && filename.includes('seo')) relevanceScore += 15;
        }
      });
      
      // Legacy specific topic detection
      if (queryLower.includes('install') && filename.includes('installation')) relevanceScore += 15;
      if (queryLower.includes('config') && filename.includes('configuration')) relevanceScore += 15;
      if (queryLower.includes('deploy') && filename.includes('deployment')) relevanceScore += 15;
      if (queryLower.includes('cms') || queryLower.includes('edit')) relevanceScore += doc.keywords.includes('tinacms') ? 10 : 0;
      if (queryLower.includes('component') || queryLower.includes('mdx')) relevanceScore += doc.keywords.includes('mdx') ? 8 : 0;
      
      if (relevanceScore > 0) {
        results.push({ doc, score: relevanceScore });
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(r => r.doc);
  }
  
  getContextForQuery(query) {
    if (!this.initialized) {
      return null;
    }
    
    const relevantDocs = this.searchRelevantDocs(query, 2);
    
    if (relevantDocs.length === 0) {
      return null;
    }
    
    // Create context string from relevant docs
    const contextParts = relevantDocs.map(doc => {
      const excerpt = doc.content.length > 200 
        ? doc.content.substring(0, 200) + '...'
        : doc.content;
        
      return `**${doc.title}**: ${excerpt}`;
    });
    
    return {
      context: contextParts.join('\n\n'),
      sources: relevantDocs.map(doc => doc.title)
    };
  }
}

// Create singleton instance
const docsService = new DocsService();

export default docsService;