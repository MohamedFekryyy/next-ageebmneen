const fs = require('fs');
const path = require('path');

// Import the SEO products data
const seoProductsPath = path.join(__dirname, '../src/lib/seo-products.ts');

// Function to extract products from TypeScript file
function extractProductsFromFile() {
  const content = fs.readFileSync(seoProductsPath, 'utf8');
  
  // Extract product slugs using regex
  const slugMatches = content.match(/slug: '([^']+)'/g);
  const slugs = slugMatches ? slugMatches.map(match => match.replace(/slug: '([^']+)'/, '$1')) : [];
  
  // Extract brands using regex
  const brandMatches = content.match(/brand: '([^']+)'/g);
  const brands = brandMatches ? [...new Set(brandMatches.map(match => match.replace(/brand: '([^']+)'/, '$1')))] : [];
  
  return { slugs, brands };
}

// Generate sitemap.xml
function generateSitemap() {
  const { slugs, brands } = extractProductsFromFile();
  const baseUrl = 'https://ageebmneen.vercel.app';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Main page -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="ar-EG" href="${baseUrl}/" />
  </url>
  
  <!-- Individual product comparison pages -->`;

  // Add individual product pages
  slugs.forEach(slug => {
    sitemap += `
  <url>
    <loc>${baseUrl}/compare/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemap += `
  
  <!-- Brand comparison pages -->`;

  // Add brand pages
  brands.forEach(brand => {
    const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
    sitemap += `
  <url>
    <loc>${baseUrl}/compare/brand/${brandSlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemap += `
  
  <!-- Category comparison pages -->
  <url>
    <loc>${baseUrl}/compare/category/flagship</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare/category/mid-range</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare/category/budget</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Price range comparison pages -->
  <url>
    <loc>${baseUrl}/compare/under-20000</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare/20000-50000</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare/over-50000</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  // Write sitemap to public directory
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Generated sitemap.xml with ${slugs.length} product pages and ${brands.length} brand pages`);
}

// Generate robots.txt
function generateRobots() {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://ageebmneen.vercel.app/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow all comparison pages
Allow: /compare/

# Block admin pages
Disallow: /admin/
Disallow: /api/

# Block any temporary or development files
Disallow: /_next/
Disallow: /static/`;

  const robotsPath = path.join(__dirname, '../public/robots.txt');
  fs.writeFileSync(robotsPath, robots);
  console.log('✅ Generated robots.txt');
}

// Generate structured data for products
function generateStructuredData() {
  const { slugs } = extractProductsFromFile();
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "مقارنة أسعار الموبايلات - أجيب منين؟",
    "description": "مقارنة شاملة لأسعار الموبايلات في مصر والخارج مع حساب الجمارك والضرايب",
    "url": "https://ageebmneen.vercel.app",
    "numberOfItems": slugs.length,
    "itemListElement": slugs.map((slug, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://ageebmneen.vercel.app/compare/${slug}`,
      "name": slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }))
  };

  const structuredDataPath = path.join(__dirname, '../public/structured-data.json');
  fs.writeFileSync(structuredDataPath, JSON.stringify(structuredData, null, 2));
  console.log(`✅ Generated structured data for ${slugs.length} products`);
}

// Main function
function main() {
  console.log('🚀 Starting SEO generation...');
  
  try {
    generateSitemap();
    generateRobots();
    generateStructuredData();
    
    console.log('✅ SEO generation completed successfully!');
  } catch (error) {
    console.error('❌ Error during SEO generation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 