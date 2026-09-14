// DOM Elements
const affiliateLinkInput = document.getElementById('affiliateLink');
const extractBtn = document.getElementById('extractBtn');
const publishBtn = document.getElementById('publishBtn');
const productPreview = document.getElementById('productPreview');
const statusDiv = document.getElementById('status');

const productTitleEl = document.getElementById('productTitle');
const productImageEl = document.getElementById('productImage');
const productPriceEl = document.getElementById('productPrice');
const productDescriptionEl = document.getElementById('productDescription');

const websiteUrlInput = document.getElementById('websiteUrl');
const customTitleInput = document.getElementById('customTitle');
const publishWebsiteCheckbox = document.getElementById('publishWebsite');
const publishPinterestCheckbox = document.getElementById('publishPinterest');
const pinterestBoardSelect = document.getElementById('pinterestBoard');

let extractedProductData = null;

// Load saved settings
window.addEventListener('load', () => {
  chrome.storage.local.get(['websiteUrl', 'pinterestToken', 'pinterestBoards'], (result) => {
    if (result.websiteUrl) websiteUrlInput.value = result.websiteUrl;
    loadPinterestBoards();
  });
});

// Extract Product Info
extractBtn.addEventListener('click', async () => {
  const link = affiliateLinkInput.value.trim();
  if (!link) {
    showStatus('Please paste an affiliate link', 'error');
    return;
  }

  showStatus('Extracting product information...', 'loading');
  extractBtn.disabled = true;

  try {
    const productData = await extractProductInfo(link);
    extractedProductData = productData;

    // Display preview
    productTitleEl.textContent = productData.title;
    productImageEl.src = productData.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12">No Image</text></svg>';
    productPriceEl.textContent = productData.price || 'Price not available';
    productDescriptionEl.textContent = productData.description || productData.title;

    productPreview.classList.remove('hidden');
    if (!customTitleInput.value) {
      customTitleInput.value = productData.title;
    }

    showStatus('✅ Product extracted successfully!', 'success');
  } catch (error) {
    showStatus('❌ ' + error.message, 'error');
  } finally {
    extractBtn.disabled = false;
  }
});

// Publish to Website & Pinterest
publishBtn.addEventListener('click', async () => {
  if (!extractedProductData) {
    showStatus('Please extract product info first', 'error');
    return;
  }

  const publishWebsite = publishWebsiteCheckbox.checked;
  const publishPinterest = publishPinterestCheckbox.checked;
  const websiteUrl = websiteUrlInput.value.trim();
  const customTitle = customTitleInput.value.trim() || extractedProductData.title;

  if (publishWebsite && !websiteUrl) {
    showStatus('Please enter your website URL', 'error');
    return;
  }

  if (publishPinterest && !pinterestBoardSelect.value) {
    showStatus('Please select a Pinterest board', 'error');
    return;
  }

  showStatus('Publishing...', 'loading');
  publishBtn.disabled = true;

  try {
    const results = [];

    // Publish to Website
    if (publishWebsite) {
      await publishToWebsite(websiteUrl, extractedProductData, customTitle);
      results.push('Website');
    }

    // Publish to Pinterest
    if (publishPinterest) {
      await publishToPinterest(extractedProductData, customTitle, pinterestBoardSelect.value);
      results.push('Pinterest');
    }

    showStatus(`✅ Published to: ${results.join(', ')}`, 'success');
    
    // Reset form
    setTimeout(() => {
      affiliateLinkInput.value = '';
      customTitleInput.value = '';
      productPreview.classList.add('hidden');
    }, 2000);

  } catch (error) {
    showStatus('❌ ' + error.message, 'error');
  } finally {
    publishBtn.disabled = false;
  }
});

// Save website URL when changed
websiteUrlInput.addEventListener('change', () => {
  chrome.storage.local.set({ websiteUrl: websiteUrlInput.value });
});

// Helper Functions
async function extractProductInfo(url) {
  // Send message to background script to extract product info
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'extractProduct', url: url },
      (response) => {
        if (response?.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'Failed to extract product'));
        }
      }
    );
  });
}

async function publishToWebsite(websiteUrl, productData, title) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'publishWebsite',
        url: websiteUrl,
        product: productData,
        title: title
      },
      (response) => {
        if (response?.success) {
          resolve();
        } else {
          reject(new Error(response?.error || 'Failed to publish to website'));
        }
      }
    );
  });
}

async function publishToPinterest(productData, title, boardId) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'publishPinterest',
        product: productData,
        title: title,
        boardId: boardId
      },
      (response) => {
        if (response?.success) {
          resolve();
        } else {
          reject(new Error(response?.error || 'Failed to publish to Pinterest'));
        }
      }
    );
  });
}

function showStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
  if (type !== 'loading') {
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 4000);
  }
}

function loadPinterestBoards() {
  chrome.storage.local.get(['pinterestBoards'], (result) => {
    if (result.pinterestBoards && result.pinterestBoards.length > 0) {
      pinterestBoardSelect.innerHTML = '<option value="">Select board...</option>';
      result.pinterestBoards.forEach(board => {
        const option = document.createElement('option');
        option.value = board.id;
        option.textContent = board.name;
        pinterestBoardSelect.appendChild(option);
      });
    }
  });
}
