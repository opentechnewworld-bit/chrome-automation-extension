// Utility functions for URL encoding and string manipulation

/**
 * Safe URL encoding that handles surrogate pairs correctly
 */
function safeEncodeURIComponent(str) {
  try {
    // Convert to well-formed string first
    const wellFormed = toWellFormedString(str);
    return encodeURIComponent(wellFormed);
  } catch (e) {
    return encodeURIComponent(str.replace(/[^\u0000-\uD7FF\uE000-\uFFFF]/g, ''));
  }
}

/**
 * Convert string to well-formed Unicode (handle surrogates)
 */
function toWellFormedString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '\ufffd');
}

/**
 * Safe string truncation that respects emoji boundaries
 */
function safeTruncate(str, maxLength = 100) {
  if (typeof str !== 'string') return '';
  
  const wellFormed = toWellFormedString(str);
  if (wellFormed.length <= maxLength) return wellFormed;
  
  // Use Array.from to properly handle emoji and multi-byte characters
  const chars = Array.from(wellFormed);
  return chars.slice(0, maxLength).join('') + (chars.length > maxLength ? '...' : '');
}

/**
 * Clean affiliate URL by removing tracking parameters
 */
function cleanAffiliateUrl(url) {
  try {
    const urlObj = new URL(url);
    const paramsToRemove = ['qid', 'ref', 'sr', 'crid', 'keywords'];
    
    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}

/**
 * Extract domain name from URL
 */
function getDomainName(url) {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.hostname.split('.');
    return parts[parts.length - 2];
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Format price with currency symbol
 */
function formatPrice(priceStr) {
  const match = priceStr.match(/([\$£€₹])?\s?([0-9]+(?:[.,][0-9]{2})?)/);
  if (match) {
    const symbol = match[1] || '$';
    const price = match[2].replace(',', '.');
    return `${symbol}${price}`;
  }
  return priceStr;
}

/**
 * Generate Pinterest-optimized title
 */
function generatePinterestTitle(productTitle, price) {
  const baseTitle = safeTruncate(productTitle, 60);
  const priceStr = price ? ` | ${price}` : '';
  return `Check Price & Details${priceStr} | #AffiliateLink`;
}

/**
 * Generate Pinterest description
 */
function generatePinterestDescription(productTitle, productDescription) {
  const desc = productDescription || productTitle;
  const truncated = safeTruncate(desc, 300);
  return truncated + '\n\nClick to check current price and details!';
}

/**
 * Validate if URL is valid affiliate link
 */
function isValidAffiliateUrl(url) {
  try {
    const urlObj = new URL(url);
    const supportedHosts = ['amazon', 'ebay', 'aliexpress', 'flipkart'];
    return supportedHosts.some(host => urlObj.hostname.includes(host));
  } catch (e) {
    return false;
  }
}

/**
 * Save product to local history
 */
function saveProductToHistory(productData) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['productHistory'], (result) => {
      const history = result.productHistory || [];
      const item = {
        ...productData,
        savedAt: new Date().toISOString()
      };
      history.unshift(item);
      // Keep only last 50 products
      history.splice(50);
      chrome.storage.local.set({ productHistory: history }, resolve);
    });
  });
}
