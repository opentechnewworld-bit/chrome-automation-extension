# AutoPilot - Chrome Extension for Affiliate Publishing

Automatically publish affiliate products to your website and Pinterest with one click.

## Features

✨ **Quick Setup**
- Paste affiliate link (Amazon, eBay, etc.)
- Auto-extract product information
- One-click publish to multiple platforms

🌐 **Multi-Platform Publishing**
- Publish directly to your website/store
- Auto-post to Pinterest
- Support for multiple affiliate networks

📊 **Smart Data Extraction**
- Automatic product title, price, and image extraction
- Affiliate URL cleaning and optimization
- Price formatting across multiple currencies

🔒 **Secure & Private**
- Local storage of settings
- No server-side product data retention
- Direct API integration with Pinterest

## Installation

### Development Mode

1. Clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder

### Production

Package the extension and submit to Chrome Web Store.

## Usage

### Initial Setup

1. Click the AutoPilot extension icon
2. Enter your website URL (where products will be posted)
3. Connect your Pinterest account (one-time)
4. Select default Pinterest board

### Publishing a Product

1. Copy affiliate product link
2. Click AutoPilot extension
3. Paste link and click "Extract Product Info"
4. Review product preview
5. Edit title if needed
6. Select target platforms (Website, Pinterest, or both)
7. Click "Publish Now"

## Supported Platforms

- **Amazon** - Full product extraction
- **eBay** - Full product extraction
- **Generic URLs** - Basic extraction from page title and meta tags

## API Integration

### Website Endpoint

Your website should have a POST endpoint at `/api/products` or similar:

```json
{
  "title": "Product Title",
  "price": "$99.99",
  "description": "Product description",
  "image": "image_url",
  "affiliateUrl": "https://affiliate-link",
  "source": "Amazon"
}
```

### Pinterest API

The extension uses Pinterest's official API. You'll need:
- Pinterest Developer Account
- Access Token with `pins:write` and `boards:read` permissions

## Files Structure

```
├── manifest.json          - Extension configuration
├── popup.html             - User interface
├── popup.js               - UI logic
├── background.js          - Service worker (extraction & API)
├── styles.css             - Styling
├── utils.js               - Utility functions
├── README.md              - This file
└── images/                - Extension icons
```

## Security Notes

- Never commit API keys or tokens
- Use Chrome's storage.local for sensitive data
- URLs are cleaned of tracking parameters before publishing
- All data processing happens locally in the extension

## Troubleshooting

### "Failed to extract product"
- Ensure the affiliate link is valid and publicly accessible
- Check if the website allows automated access
- Try with a different product

### Pinterest not publishing
- Verify Pinterest token is still valid
- Check board ID is correct
- Ensure "pins:write" permission is granted

### Website not receiving posts
- Verify endpoint URL is correct
- Check server logs for POST requests
- Ensure CORS is properly configured

## Future Enhancements

- [ ] Bulk upload from CSV
- [ ] Custom product description templates
- [ ] Multi-board Pinterest scheduling
- [ ] Instagram publishing
- [ ] TikTok Shop integration
- [ ] Product analytics dashboard
- [ ] A/B testing for pin titles

## Support

For issues or feature requests, create an issue in the repository.

## License

MIT License - Feel free to use and modify for your projects.
