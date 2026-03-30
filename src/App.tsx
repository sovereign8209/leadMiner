// src/App.jsx
import { useState } from 'react';
import './App.css';

export default function App() {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [minReviews, setMinReviews] = useState('');
  const [maxReviews, setMaxReviews] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScrape = async (e) => {
    e.preventDefault();
    
    if (!location || !category || !minReviews || !maxReviews) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          category,
          min_reviews: parseInt(minReviews),
          max_reviews: parseInt(maxReviews),
        }),
      });

      if (!response.ok) throw new Error('Scraping failed');

      // Download Excel file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `businesses_${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Google Maps Scraper</h1>
      <form onSubmit={handleScrape}>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            placeholder="e.g., New York, London, Tokyo"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            placeholder="e.g., vegan restaurants, car repair, yoga studios"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Min Reviews</label>
            <input
              type="number"
              placeholder="0"
              value={minReviews}
              onChange={(e) => setMinReviews(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Max Reviews</label>
            <input
              type="number"
              placeholder="1000"
              value={maxReviews}
              onChange={(e) => setMaxReviews(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Scraping...' : 'Start Scraping'}
        </button>
      </form>
    </div>
  );
}