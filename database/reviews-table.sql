-- Create reviews table for vehicle review system
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
  inv_id INTEGER NOT NULL REFERENCES inventory(inv_id) ON DELETE CASCADE,
  review_rating INTEGER NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
  review_text TEXT NOT NULL,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  helpful_count INTEGER DEFAULT 0,
  UNIQUE(account_id, inv_id) -- Prevent duplicate reviews from same user for same vehicle
);

-- Create index for better performance
CREATE INDEX idx_reviews_inv_id ON reviews(inv_id);
CREATE INDEX idx_reviews_account_id ON reviews(account_id);