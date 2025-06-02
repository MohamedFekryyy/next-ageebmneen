# Automatic SEO Generation Setup

This project includes automatic SEO generation that runs during deployment to ensure all SEO files are up-to-date with the latest product data.

## What Gets Generated

### 1. Sitemap.xml
- **Location**: `public/sitemap.xml`
- **Content**: All product comparison pages, brand pages, category pages, and price range pages
- **Updates**: Automatically generated from `src/lib/seo-products.ts`

### 2. Robots.txt
- **Location**: `public/robots.txt`
- **Content**: Search engine crawling instructions
- **Features**: 
  - Allows all comparison pages
  - Blocks admin and API routes
  - Points to sitemap location

### 3. Structured Data
- **Location**: `public/structured-data.json`
- **Content**: Schema.org ItemList for all products
- **Purpose**: Helps search engines understand the product catalog

## How It Works

### Build Process
The SEO generation runs automatically during the build process:

1. **Pre-build**: `npm run prebuild` → Generates SEO files before Next.js build
2. **Build**: `npm run build` → Standard Next.js build process
3. **Post-build**: `npm run postbuild` → Regenerates SEO files after build

### Manual Generation
You can also generate SEO files manually:

```bash
npm run generate-seo
```

### Deployment Integration

#### Vercel
- **File**: `vercel.json`
- **Build Command**: `npm run generate-seo && npm run build`
- **Headers**: Proper caching and content-type headers for SEO files

#### GitHub Actions
- **File**: `.github/workflows/deploy.yml`
- **Features**: 
  - Runs SEO generation on every push
  - Commits updated SEO files back to repository
  - Ensures consistency across deployments

## Adding New Products

When you add new products to `src/lib/seo-products.ts`:

1. **Development**: Run `npm run generate-seo` to update local SEO files
2. **Deployment**: SEO files will be automatically updated during build
3. **Git**: Commit the updated SEO files to keep them in sync

## File Structure

```
scripts/
  └── generate-seo.js          # SEO generation script
public/
  ├── sitemap.xml             # Generated sitemap
  ├── robots.txt              # Generated robots file
  └── structured-data.json    # Generated structured data
src/lib/
  └── seo-products.ts         # Product data source
.github/workflows/
  └── deploy.yml              # GitHub Actions workflow
vercel.json                   # Vercel deployment config
```

## Benefits

1. **Always Up-to-Date**: SEO files automatically reflect current product catalog
2. **No Manual Work**: Zero maintenance required for SEO files
3. **Search Engine Friendly**: Proper sitemaps and structured data
4. **Performance**: Cached SEO files with proper headers
5. **Consistency**: Same generation process across all environments

## Monitoring

Check the build logs to ensure SEO generation is working:

```
🚀 Starting SEO generation...
✅ Generated sitemap.xml with 10 product pages and 6 brand pages
✅ Generated robots.txt
✅ Generated structured data for 10 products
✅ SEO generation completed successfully!
```

## Troubleshooting

If SEO generation fails:

1. Check that `src/lib/seo-products.ts` has valid syntax
2. Ensure the `scripts/` directory exists
3. Verify Node.js has write permissions to `public/` directory
4. Check build logs for specific error messages 