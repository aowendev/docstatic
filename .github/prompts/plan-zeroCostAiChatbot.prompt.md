## Plan: Zero-Cost AI Chatbot for docStatic

Add a configurable, provider-agnostic chatbot widget to the docStatic site that works with zero-cost AI providers (Together.ai, Groq, OpenRouter, etc.) and deploys seamlessly on GitHub Pages.

**Steps**

1. **Create chatbot UI component** 
   - Build React chatbot widget in `src/components/Chatbot/`
   - Implement collapsible chat interface with message history
   - Add typing indicators, error states, and loading states
   - Style using Infima classes to match docStatic theme

2. **Implement provider abstraction layer** (*parallel with step 1*)
   - Create `src/components/Chatbot/providers/` with base provider interface
   - Add adapters for Together.ai, Groq, OpenRouter, and Google Gemini
   - Handle OpenAI-compatible vs native API formats
   - Implement fallback logic for failed providers

3. **Add configuration system**
   - Create `config/chatbot/index.json` for chatbot settings
   - Define provider configs (API endpoints, model names, parameters)
   - Add user customization options (position, theme, default provider)
   - Integrate with existing docStatic config loading pattern

4. **Create theme integration**
   - Add chatbot toggle to main layout in `src/theme/DocPage/index.jsx`
   - Register chatbot as MDX component in `src/theme/MDXComponents.jsx`
   - Add client module in `src/clientModules/` for global initialization
   - Implement responsive positioning and z-index management

5. **Add build-time configuration**
   - Modify `docusaurus.config.ts` to include chatbot settings
   - Add API key injection from environment variables (optional)
   - Create template config for new users in `template/config/chatbot/`
   - Update `frontmatter.json` schema if adding chatbot frontmatter options

6. **Implement security and rate limiting**
   - Add client-side request throttling and queue management
   - Implement session-based conversation limits
   - Add user warnings about API usage and privacy
   - Create guidance for public vs private API key usage

7. **Add documentation and examples**
   - Create `docs/chatbot.mdx` with setup and configuration guide
   - Add provider-specific setup instructions
   - Include troubleshooting section for common issues
   - Add example configurations for different use cases

**Relevant files**

- `src/components/Chatbot/index.jsx` — main chatbot React component with chat UI
- `src/components/Chatbot/providers/BaseProvider.js` — abstract provider interface
- `src/components/Chatbot/providers/TogetherProvider.js` — Together.ai API adapter
- `src/components/Chatbot/providers/GroqProvider.js` — Groq API adapter  
- `src/components/Chatbot/providers/OpenRouterProvider.js` — OpenRouter API adapter
- `src/components/Chatbot/providers/GeminiProvider.js` — Google Gemini API adapter
- `config/chatbot/index.json` — chatbot configuration options
- `src/theme/DocPage/index.jsx` — add chatbot to page layout
- `src/theme/MDXComponents.jsx` — register chatbot for MDX usage
- `src/clientModules/chatbot.js` — global chatbot initialization
- `docusaurus.config.ts` — main site config integration
- `docs/chatbot.mdx` — user documentation

**Verification**

1. **Test provider switching** — verify chatbot works with each configured provider (Together.ai, Groq, OpenRouter, Gemini)
2. **Test configuration** — verify custom configs in `config/chatbot/index.json` are applied correctly
3. **Test fallback logic** — simulate API failures to ensure fallback providers activate
4. **Test rate limiting** — verify client-side throttling prevents spam requests
5. **Test responsive design** — verify chatbot displays correctly on mobile/tablet/desktop
6. **Test GitHub Pages deployment** — ensure static build includes all necessary assets and configs

**Decisions**

- **Client-side only approach**: No backend required, works with GitHub Pages
- **Provider-agnostic architecture**: Users can switch between AI providers via config
- **React component pattern**: Follows existing docStatic component structure
- **Config-driven customization**: Leverages existing docStatic configuration patterns
- **Optional MDX usage**: Can be embedded in docs or used as global widget
- **Zero-infrastructure**: No serverless functions needed, all logic client-side
