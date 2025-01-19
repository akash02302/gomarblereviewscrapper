const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Update CORS to handle production URLs
app.use(cors({
  origin: [
    'http://localhost:3000',                          // Development
    'https://gomarblereviewscrapper.vercel.app/',           // Production frontend
    '*'          // Any other domains
  ],
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

async function identifySelectors(page) {
  const pageContent = await page.content();
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Analyze this HTML content and identify the CSS selectors for:
    1. Review container
    2. Review text
    3. Rating
    4. Author name
    5. Review date
    6. Pagination next button
    
    Return only JSON format with these selectors.
    HTML: ${pageContent}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

async function extractPageReviews(page, selectors) {
  return await page.evaluate((sel) => {
    const reviews = [];
    const reviewElements = document.querySelectorAll(sel.reviewContainer);

    reviewElements.forEach(element => {
      reviews.push({
        text: element.querySelector(sel.reviewText)?.textContent?.trim(),
        rating: element.querySelector(sel.rating)?.textContent?.trim(),
        author: element.querySelector(sel.authorName)?.textContent?.trim(),
        date: element.querySelector(sel.reviewDate)?.textContent?.trim(),
      });
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