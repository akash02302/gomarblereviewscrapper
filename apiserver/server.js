const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Update CORS to be more permissive during development
app.use(cors({
  origin: '*',  // Allow all origins during development
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Add predefined selectors for common e-commerce sites
const SITE_SELECTORS = {
  amazon: {
    reviewContainer: 'div[data-hook="review"]',
    reviewText: 'span[data-hook="review-body"]',
    rating: 'i[data-hook="review-star-rating"]',
    authorName: 'span.a-profile-name',
    reviewDate: 'span[data-hook="review-date"]',
    paginationSelector: 'li.a-last > a'
  },
  shopify: {
    reviewContainer: '.review',
    reviewText: '.review__content',
    rating: '.review__rating',
    authorName: '.review__author',
    reviewDate: '.review__date',
    paginationSelector: '.pagination__next'
  },
  default: {
    reviewContainer: '.review, [class*="review"], [id*="review"]',
    reviewText: '.review-text, .review-content, [class*="review-text"]',
    rating: '.rating, .stars, [class*="rating"]',
    authorName: '.author, .reviewer, [class*="author"]',
    reviewDate: '.date, .review-date, [class*="date"]',
    paginationSelector: '.next, .pagination-next, [class*="next"]'
  }
};

// Review extraction endpoint
app.post('/api/extract-reviews', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { url, maxPages = 3 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    let allReviews = [];

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      // Get selectors using Gemini
      const selectors = await identifySelectors(page);
      
      let currentPage = 1;
      
      while (currentPage <= maxPages) {
        // Extract reviews from current page
        const pageReviews = await extractPageReviews(page, selectors);
        allReviews = [...allReviews, ...pageReviews];

        // Check and handle pagination
        const hasNextPage = await hasNextPageAvailable(page, selectors.paginationSelector);
        if (!hasNextPage) break;
        
        await navigateToNextPage(page, selectors.paginationSelector);
        await page.waitForTimeout(2000);
        currentPage++;
      }

      res.json({ success: true, reviews: allReviews });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error extracting reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update identifySelectors function
async function identifySelectors(page) {
  const url = page.url().toLowerCase();
  
  // Determine which selectors to use based on URL
  if (url.includes('amazon.com')) {
    return SITE_SELECTORS.amazon;
  } else if (url.includes('shopify')) {
    return SITE_SELECTORS.shopify;
  }

  // Use default selectors if site is not recognized
  return SITE_SELECTORS.default;
}

// Update extractPageReviews to handle missing elements better
async function extractPageReviews(page, selectors) {
  return await page.evaluate((sel) => {
    const reviews = [];
    const reviewElements = document.querySelectorAll(sel.reviewContainer);

    reviewElements.forEach(element => {
      const review = {
        text: element.querySelector(sel.reviewText)?.textContent?.trim() || 'No review text available',
        rating: element.querySelector(sel.rating)?.textContent?.trim() || 'No rating available',
        author: element.querySelector(sel.authorName)?.textContent?.trim() || 'Anonymous',
        date: element.querySelector(sel.reviewDate)?.textContent?.trim() || 'No date available'
      };

      // Only add reviews that have at least some content
      if (review.text !== 'No review text available' || review.rating !== 'No rating available') {
        reviews.push(review);
      }
    });

    return reviews;
  }, selectors);
}

async function hasNextPageAvailable(page, paginationSelector) {
  return await page.evaluate((selector) => {
    const nextButton = document.querySelector(selector);
    return nextButton && !nextButton.disabled;
  }, paginationSelector);
}

async function navigateToNextPage(page, paginationSelector) {
  await page.click(paginationSelector);
}

// Update the listen method for Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export the app for Vercel
module.exports = app; 