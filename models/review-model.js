const pool = require("../database/")

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(account_id, inv_id, review_rating, review_text) {
  try {
    const sql = `INSERT INTO reviews (account_id, inv_id, review_rating, review_text) 
                 VALUES ($1, $2, $3, $4) RETURNING *`
    return await pool.query(sql, [account_id, inv_id, review_rating, review_text])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get reviews by inventory ID
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `SELECT r.*, a.first_name, a.last_name 
                 FROM reviews r 
                 JOIN account a ON r.account_id = a.account_id 
                 WHERE r.inv_id = $1 
                 ORDER BY r.review_date DESC`
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error " + error)
    return []
  }
}

/* ***************************
 *  Get reviews by account ID
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year 
                 FROM reviews r 
                 JOIN inventory i ON r.inv_id = i.inv_id 
                 WHERE r.account_id = $1 
                 ORDER BY r.review_date DESC`
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByAccountId error " + error)
    return []
  }
}

/* ***************************
 *  Check if user already reviewed this vehicle
 * ************************** */
async function checkExistingReview(account_id, inv_id) {
  try {
    const sql = "SELECT * FROM reviews WHERE account_id = $1 AND inv_id = $2"
    const review = await pool.query(sql, [account_id, inv_id])
    return review.rowCount
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update review helpfulness count
 * ************************** */
async function updateReviewHelpfulness(review_id) {
  try {
    const sql = "UPDATE reviews SET helpful_count = helpful_count + 1 WHERE review_id = $1 RETURNING *"
    return await pool.query(sql, [review_id])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get average rating for a vehicle
 * ************************** */
async function getAverageRating(inv_id) {
  try {
    const sql = `SELECT AVG(review_rating)::NUMERIC(3,2) as avg_rating, COUNT(*) as review_count 
                 FROM reviews WHERE inv_id = $1`
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("getAverageRating error " + error)
    return { avg_rating: 0, review_count: 0 }
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewsByAccountId,
  checkExistingReview,
  updateReviewHelpfulness,
  getAverageRating
}