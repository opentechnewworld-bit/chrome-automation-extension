// Background Service Worker

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractProduct') {
    extractProductInfo(request.url).then(data => {
      sendResponse({ success: true, data });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'publishWebsite') {
    publishToWebsite(request.url, request.product, request.title).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (request.action === 'publishPinterest') {
    publishToPinterest(request.product, request.title, request.boardId).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

async function extractProductInfo(url) {
  try {
    // Validate URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Determine source and extract accordingly
    if (hostname.includes('amazon')) {
      return await extractFromAmazon(url);
    } else if (hostname.includes('ebay')) {
      return await extractFromEbay(url);
    } else {
      return await extractGeneric(url);
    }
  } catch (error) {
    throw new Error('Invalid URL: ' + error.message);
  }
}

async function extractFromAmazon(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Parse HTML to extract product data
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract title
    const title = doc.querySelector('h1 span')?.textContent?.trim() || 'Unknown Product';

    // Extract price
    const priceText = doc.querySelector('.a-price-whole')?.textContent?.trim() || '$0.00';

    // Extract image
    const imageUrl = doc.querySelector('#landingImage')?.getAttribute('src') || '';

    // Extract ASIN from URL
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = asinMatch ? asinMatch[1] : '';

    return {
      title: title.substring(0, 100),
      price: priceText,
      description: title.substring(0, 200),
      image: imageUrl,
      source: 'Amazon',
      asin: asin,
      affiliateUrl: url
    };
  } catch (error) {
    throw new Error('Failed to extract from Amazon: ' + error.message);
  }
}

async function extractFromEbay(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('h1')?.textContent?.trim() || 'Unknown Product';
    const priceText = doc.querySelector('.vi-VR-cvipPrice')?.textContent?.trim() || '$0.00';
    const imageUrl = doc.querySelector('#vi_main img')?.getAttribute('src') || '';

    return {
      title: title.substring(0, 100),
      price: priceText,
      description: title.substring(0, 200),
      image: imageUrl,
      source: 'eBay',
      affiliateUrl: url
    };
  } catch (error) {
    throw new Error('Failed to extract from eBay: ' + error.message);
  }
}

async function extractGeneric(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('h1')?.textContent?.trim() ||
                  doc.querySelector('title')?.textContent?.trim() ||
                  'Product';

    return {
      title: title.substring(0, 100),
      price: 'Contact for price',
      description: title.substring(0, 200),
      image: '',
      source: 'Generic',
      affiliateUrl: url
    };
  } catch (error) {
    throw new Error('Failed to extract from URL: ' + error.message);
  }
}

async function publishToWebsite(websiteUrl, productData, title) {
  try {
    // Send product data to website endpoint
    const payload = {
      title: title,
      price: productData.price,
      description: productData.description,
      image: productData.image,
      affiliateUrl: productData.affiliateUrl,
      source: productData.source
    };

    const response = await fetch(websiteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to publish to website: ' + error.message);
  }
}

async function publishToPinterest(productData, title, boardId) {
  try {
    // Retrieve Pinterest token from storage
    const result = await new Promise((resolve) => {
      chrome.storage.local.get(['pinterestToken'], resolve);
    });

    if (!result.pinterestToken) {
      throw new Error('Pinterest authentication required');
    }

    // Prepare pin data
    const pinData = {
      board_id: boardId,
      title: title,
      description: productData.description,
      link: productData.affiliateUrl,
      image_url: productData.image
    };

    // Call Pinterest API (would need backend proxy or Pinterest SDK)
    const response = await fetch('https://api.pinterest.com/v5/pins/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${result.pinterestToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pinData)
    });

    if (!response.ok) {
      throw new Error(`Pinterest API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to publish to Pinterest: ' + error.message);
  }
}
