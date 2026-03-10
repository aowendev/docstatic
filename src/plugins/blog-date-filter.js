const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * Get list of future-dated blog files that should be excluded
 * @param {string} blogDir - Full path to the blog directory
 * @returns {string[]} - Array of relative file paths to exclude
 */
function getFutureDatedBlogFiles(blogDir) {
  const futureDatedFiles = [];
  
  // Only exclude future-dated files in production builds
  // Allow them in development for preview purposes
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.log('🚀 Development mode: Including future-dated blog posts for preview');
    return []; // Return empty array in development - include all posts
  }
  
  try {
    if (!fs.existsSync(blogDir)) {
      console.warn(`Blog directory ${blogDir} does not exist`);
      return [];
    }

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Read all blog files
    const allFiles = fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
      .filter(file => !file.startsWith('.'));

    for (const file of allFiles) {
      try {
        const fullPath = path.join(blogDir, file);
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const { data: frontmatter } = matter(fileContent);
        
        if (!frontmatter.date) {
          continue; // Skip files without dates
        }
        
        let postDateString;
        
        // Handle different date formats
        if (frontmatter.date instanceof Date) {
          postDateString = frontmatter.date.toISOString().split('T')[0];
        } else if (typeof frontmatter.date === 'string') {
          // Try to parse the date string
          const parsedDate = new Date(frontmatter.date);
          if (!isNaN(parsedDate.getTime())) {
            postDateString = parsedDate.toISOString().split('T')[0];
          } else {
            // Assume YYYY-MM-DD format if parsing fails
            postDateString = frontmatter.date.split('T')[0];
          }
        }
        
        // Add to exclude list if post date is in the future
        if (postDateString && postDateString > currentDateString) {
          futureDatedFiles.push(file);
          console.log(`📅 Excluding future-dated blog post: ${file} (date: ${postDateString})`);
        }
        
      } catch (error) {
        console.warn(`Error checking blog post date for ${file}:`, error.message);
        // Skip files with parsing errors (don't exclude them)
      }
    }

  } catch (error) {
    console.warn(`Error reading blog directory ${blogDir}:`, error.message);
  }

  return futureDatedFiles;
}

module.exports = {
  getFutureDatedBlogFiles
};