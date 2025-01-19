import React, { useState } from 'react';
import axios from 'axios';
import './Reviews.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Reviews = () => {
  const [url, setUrl] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting to connect to:', API_URL); // Debug log
      const response = await axios.post(`${API_URL}/api/extract-reviews`, {
        url,
        maxPages: 3
      });
      
      if (response.data.reviews) {
        setReviews(response.data.reviews);
      } else {
        setError('No reviews found');
      }
    } catch (err) {
      console.error('Network Error Details:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if the server is running.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reviews-container">
      <h1>Product Review Extractor</h1>
      
      <form onSubmit={handleSubmit} className="url-form">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter product page URL"
          required
          className="url-input"
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Extracting...' : 'Extract Reviews'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Extracting reviews, please wait...</p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <span className="author">{review.author}</span>
                <span className="rating">Rating: {review.rating}</span>
                <span className="date">{review.date}</span>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews; 