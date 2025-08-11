const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // Rating is required and must be between 1-5
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),
    
    // Review text is required and must be reasonable length
    body("review_text")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters."),
    
    // Inventory ID is required
    body("inv_id")
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle selected.")
  ]
}

/* ******************************
 * Check review data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, review_rating, review_text } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const invModel = require("../models/inventory-model")
    const inventory = await invModel.getInventoryByInventoryId(inv_id)
    res.render("inventory/add-review", {
      errors,
      title: `Review ${inventory.inv_make} ${inventory.inv_model}`,
      nav,
      inventory,
      review_rating,
      review_text
    })
    return
  }
  next()
}

module.exports = validate