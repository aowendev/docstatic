const fs = require('fs');
const path = require('path');

/**
 * Generate CSS variables from theme configuration
 * @param {Object} themeConfig - Theme configuration object
 * @returns {string} CSS variables as a string
 */
function generateThemeCSS(themeConfig) {
  if (!themeConfig) return '';
  
  let css = '';
  
  // Custom CSS first (for @import statements)
  if (themeConfig.customCSS) {
    css += '/* Custom CSS from Theme Configuration */\n';
    css += themeConfig.customCSS;
    css += '\n\n';
  }
  
  css += ':root {\n';
  
  // Colors
  if (themeConfig.colors) {
    const { colors } = themeConfig;
    if (colors.primary) css += `  --ifm-color-primary: ${colors.primary};\n`;
    if (colors.primaryDark) css += `  --ifm-color-primary-dark: ${colors.primaryDark};\n`;
    if (colors.primaryLight) css += `  --ifm-color-primary-light: ${colors.primaryLight};\n`;
    if (colors.footerBackground) css += `  --ifm-footer-background-color: ${colors.footerBackground};\n`;
  }
  
  // Typography
  if (themeConfig.typography) {
    const { typography } = themeConfig;
    if (typography.baseFontFamily) css += `  --ifm-font-family-base: ${typography.baseFontFamily};\n`;
    if (typography.monospaceFontFamily) css += `  --ifm-font-family-monospace: ${typography.monospaceFontFamily};\n`;
    if (typography.codeFontSize) css += `  --ifm-code-font-size: ${typography.codeFontSize};\n`;
  }
  
  // Layout
  if (themeConfig.layout) {
    const { layout } = themeConfig;
    if (layout.globalRadius) css += `  --ifm-global-radius: ${layout.globalRadius}px;\n`;
    if (layout.buttonRadius) css += `  --ifm-button-border-radius: ${layout.buttonRadius}px;\n`;
    if (layout.cardRadius) css += `  --ifm-card-border-radius: ${layout.cardRadius}px;\n`;
    if (layout.navbarHeight) css += `  --ifm-navbar-height: ${layout.navbarHeight};\n`;
  }
  
  css += '}\n';
  
  return css;
}

/**
 * Read theme configuration and update CSS file
 */
function updateThemeCSS() {
  try {
    const configPath = path.join(process.cwd(), 'config/theme/index.json');
    const cssPath = path.join(process.cwd(), 'src/css/theme-variables.css');
    
    // Read theme config
    const themeConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Generate CSS
    const css = generateThemeCSS(themeConfig);
    
    // Write CSS file
    fs.writeFileSync(cssPath, css);
    
    console.log('Theme CSS updated successfully!');
  } catch (error) {
    console.error('Error updating theme CSS:', error);
  }
}

module.exports = { generateThemeCSS, updateThemeCSS };