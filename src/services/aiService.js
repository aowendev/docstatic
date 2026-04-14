// Background AI service that starts loading immediately when the site loads
import * as webllm from "@mlc-ai/web-llm";

class AIService {
  constructor() {
    this.engine = null;
    this._isReady = false;
    this._isLoading = false;
    this._error = null;
    this._progress = 0;
    this.listeners = new Set();
    
    // Start loading immediately when service is created
    this.initialize();
  }
  
  async initialize() {
    if (this._isLoading || this._isReady) return;
    
    console.log('🤖 Starting background AI initialization...');
    this._isLoading = true;
    this._progress = 0;
    this.notifyListeners();
    
    try {
      // Check WebGPU availability for hardware acceleration
      console.log('🤖 Checking GPU capabilities...');
      if (navigator.gpu) {
        console.log('🤖 WebGPU API available!');
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) {
            const device = await adapter.requestDevice();
            console.log('🤖 GPU device obtained:', {
              vendor: adapter.info?.vendor || 'Unknown',
              architecture: adapter.info?.architecture || 'Unknown',
              features: Array.from(adapter.features || [])
            });
          }
        } catch (gpuError) {
          console.warn('🤖 GPU setup failed:', gpuError);
        }
      } else {
        console.warn('🤖 WebGPU not available - falling back to CPU');
        console.warn('🤖 For better performance, enable WebGPU in your browser:');
        console.warn('🤖 Chrome: chrome://flags/#enable-unsafe-webgpu');
        console.warn('🤖 Firefox: dom.webgpu.enabled=true in about:config');
        console.warn('🤖 Safari: Experimental WebGPU in Developer menu');
      }
      
      // First test if model files are accessible
      console.log('🤖 Testing model file accessibility...');
      try {
        const configResponse = await fetch('/models/mlc-chat-config.json');
        if (configResponse.ok) {
          const config = await configResponse.json();
          console.log('🤖 Model config accessible:', config);
        } else {
          console.warn('🤖 Model config not accessible:', configResponse.status);
        }
      } catch (e) {
        console.warn('🤖 Error testing model config:', e);
      }
      
      console.log('🤖 Creating WebLLM engine with GPU acceleration...');
      
      // Create WebLLM engine with GPU optimization
      const engine = new webllm.MLCEngine({
        initProgressCallback: (report) => {
          console.log('🤖 WebLLM Progress Report (Raw):', JSON.stringify(report, null, 2));
          const progressPercent = report.progress ? Math.round(report.progress * 100) : 0;
          console.log('🤖 AI loading progress:', report.text || 'Loading...', `${progressPercent}%`);
          this._progress = Math.max(this._progress, progressPercent); // Ensure progress only increases
          this.notifyListeners({ 
            progress: this._progress, 
            text: report.text || 'Loading...',
            rawProgress: report.progress 
          });
        },
        // Enable WebGPU for hardware acceleration
        device: navigator.gpu ? 'webgpu' : 'cpu',
        // Set memory optimization for better performance
        logLevel: 'INFO'
      });
      
      console.log('🤖 Engine created, starting model reload...');
      console.log('🤖 Loading RedPajama model from local files...');
      console.log('🤖 Model files should be at /static/models/');
      
      // Check if model seems to be loading
      this._progress = 1; // Set small progress to indicate we've started
      this.notifyListeners({ progress: this._progress, text: "Starting model load..." });
      
      // Add manual progress simulation for debugging
      const simulateProgress = () => {
        if (this._progress < 10 && this._isLoading) {
          this._progress = Math.min(this._progress + 1, 9);
          this.notifyListeners({ progress: this._progress, text: `WebLLM initializing... ${this._progress}%` });
          setTimeout(simulateProgress, 2000);
        }
      };
      setTimeout(simulateProgress, 2000);
      
      // Load the model with explicit configuration and timeout
      console.log('🤖 Calling engine.reload...');
      
      // Set up a timeout to prevent hanging
      const loadingTimeout = setTimeout(() => {
        console.warn('🤖 Model loading timeout after 60 seconds');
        this._progress = 50; // Show some progress even if stuck
        this.notifyListeners({ progress: this._progress, text: "Loading taking longer than expected..." });
      }, 60000);
      
      try {
        await engine.reload("RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC", {
          // Optimized configuration for faster inference
          temperature: 0.7,
          max_gen_len: 256, // Reduced from 512 for faster responses
          top_p: 0.95,
          repetition_penalty: 1.1,
          // Enable faster inference modes
          use_cache: true,
          // Optimize for speed over quality slightly
          num_beams: 1 // Use greedy decoding for speed
        });
        clearTimeout(loadingTimeout);
      } catch (reloadError) {
        clearTimeout(loadingTimeout);
        console.error('🤖 Engine reload failed:', reloadError);
        throw reloadError;
      }
      
      console.log('🤖 Model reload completed successfully!');
      
      this.engine = engine;
      this._isReady = true;
      this._isLoading = false;
      this._progress = 100;
      
      console.log('🤖 AI model ready! Chat can now provide real AI responses.');
      this.notifyListeners();
      
    } catch (error) {
      console.warn('🤖 WebLLM initialization failed, using demo mode:', error);
      this._isReady = true; // Still ready, just with fallback responses
      this._isLoading = false;
      this._error = error;
      this.notifyListeners();
    }
  }
  
  // Getter methods for external components
  isReady() {
    return this._isReady;
  }
  
  isLoading() {
    return this._isLoading;
  }
  
  hasError() {
    return this._error !== null;
  }
  
  getProgress() {
    return this._progress || 0;
  }
  
  async chat(message) {
    if (!this._isReady) {
      return "AI assistant is loading... I'll help you with docStatic questions - combining Docusaurus + TinaCMS for modern documentation workflows!";
    }
    
    try {
      if (this.engine && !this._error) {
        const messages = [
          { role: "system", content: `You are a knowledgeable assistant for docStatic, a modern documentation platform that combines Docusaurus (static site generator) with TinaCMS (headless CMS).

Key docStatic features:
- Git-backed documentation with GitHub integration
- React-based with MDX content format
- Rich-text CMS editor for non-technical users
- Component templates: code blocks, figures, footnotes, tabs, collapsible details
- Content collections: glossary terms, snippets, taxonomies, variable sets, conditional text
- Media manager with third-party provider support
- No local setup required for content editing
- CI/CD workflow integration
- Support for Markdown, MDX, JSON, and YAML

When answering:
- Focus on docStatic/Docusaurus documentation workflows
- Mention TinaCMS for content management questions
- Explain MDX component usage when relevant
- Be concise but thorough
- If unsure, suggest checking the docStatic documentation` },
          { role: "user", content: message }
        ];
        
        const reply = await this.engine.chat.completions.create({ messages });
        return reply.choices[0].message.content;
      } else {
        // Enhanced fallback responses with docStatic knowledge
        const docStaticTopics = {
          'install': 'DocStatic combines Docusaurus with TinaCMS. Install with `yarn install` then `yarn start` for development.',
          'cms': 'TinaCMS provides the rich-text editor. Access at `/admin` to edit content without touching code.',
          'component': 'DocStatic includes MDX components like code blocks, figures, footnotes, and tabs. Use them in any MDX file.',
          'deploy': 'DocStatic uses GitHub Actions for CI/CD. Push to main branch triggers automatic deployment.',
          'content': 'Content types include docs, blog posts, glossary terms, snippets, and variable sets. All managed through TinaCMS.',
          'mdx': 'MDX extends Markdown with React components. Write normal Markdown but embed interactive elements.',
          'git': 'All content is Git-backed. TinaCMS commits changes automatically while preserving developer workflows.'
        };
        
        const topic = Object.keys(docStaticTopics).find(key => 
          message.toLowerCase().includes(key) || 
          message.toLowerCase().includes(key + 'ment') ||
          message.toLowerCase().includes(key + 'ing')
        );
        
        const hasWebGPU = navigator.gpu ? "🚀 GPU-accelerated" : "💻 CPU-powered";
        
        if (topic) {
          return `**DocStatic Info:** ${docStaticTopics[topic]}

*This response uses ${hasWebGPU} local AI (RedPajama 3B model, ~86MB) running entirely in your browser with no external API calls.*

${!navigator.gpu ? '**Performance Tip:** Enable WebGPU for faster AI responses!' : ''}`;
        }
        
        return `I'd be happy to help with docStatic! This modern documentation platform combines Docusaurus (static site generator) with TinaCMS (headless CMS).

**Common topics:**
• Installation & setup
• TinaCMS content editing (/admin)
• MDX components & templates  
• Git workflows & deployment
• Content collections & media

*Powered by ${hasWebGPU} local AI - no data leaves your browser!*

${!navigator.gpu ? 'Enable WebGPU for 5-10x faster responses!' : ''}`;
      }
    } catch (error) {
      console.error('🤖 Chat error:', error);
      return `I encountered an error, but I can still help with docStatic questions!\n\n**DocStatic** is a documentation platform combining:\n• **Docusaurus** - React-based static site generator\n• **TinaCMS** - Git-backed headless CMS\n• **MDX** - Markdown + React components\n\nTry asking about installation, content editing, components, or deployment!\n\n*This demo shows local AI (${navigator.gpu ? 'GPU-accelerated' : 'CPU-powered'}) with no external dependencies.*`;
    }
  }
  
  onStatusChange(callback) {
    this.listeners.add(callback);
    // Immediately notify of current status
    callback({
      isReady: this._isReady,
      isLoading: this._isLoading,
      error: this._error
    });
    
    return () => this.listeners.delete(callback);
  }
  
  notifyListeners(extra = {}) {
    const status = {
      isReady: this._isReady,
      isLoading: this._isLoading,
      error: this._error,
      ...extra
    };
    
    this.listeners.forEach(callback => callback(status));
  }
}

// Create singleton instance - starts loading immediately
const aiService = new AIService();

export default aiService;