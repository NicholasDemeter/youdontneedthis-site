# CHANGELOG

## v2.0.0 - Final Alignment (2025-08-29)

### 🔄 **Major Changes**
- **Removed Supabase dependencies**: Eliminated all Supabase client code, edge functions, and authentication
- **Direct Google Sheets integration**: Now fetches product catalog directly from Google Sheets CSV endpoint
- **Site-relative image paths**: All thumbnails and media now use `/LOT-###/Photos/thumb.jpg` format
- **Simplified architecture**: Static site with no backend dependencies

### ✅ **Features Added**
- Direct CSV parsing from Google Sheets (Sheet ID: 1Pp6bvp4DoDJqVKIrNuN9N6zS_MhVex9UDRSC-nIGI6k)
- URI encoding for folder names with spaces/punctuation
- Automatic case fallback for .jpg/.JPG extensions
- Graceful degradation when Google Sheets is unavailable

### 🗑️ **Removed**
- All Supabase configuration files and dependencies
- Edge functions (`fetch-products`)
- GitHub raw.githubusercontent.com URL generation
- Complex image path normalization pipelines

### 🎯 **Path Structure**
- Thumbnails: `/{folder_name}/Photos/thumb.jpg`
- Future galleries: `/{folder_name}/Photos/*`
- Future videos: `/{folder_name}/Videos/*`

### 🔧 **Technical Details**
- Uses Google Sheets public CSV export endpoint
- Maintains existing UI/UX with ProductGrid and ProductCard components
- Preserves all filtering, sorting, and search functionality
- No breaking changes to component interfaces