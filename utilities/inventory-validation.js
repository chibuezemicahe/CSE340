const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    // classification name is required and must be string
    body("classification_name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Classification name must be at least 2 characters.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name can only contain letters and numbers, no spaces or special characters."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    // Make is required and must be string
    body("inv_make")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Make must be at least 2 characters."),
    
    // Model is required and must be string
    body("inv_model")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Model must be at least 2 characters."),
    
    // Year is required and must be valid
    body("inv_year")
      .isInt({ min: 1900, max: 2030 })
      .withMessage("Year must be between 1900 and 2030."),
    
    // Description is required
    body("inv_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),
    
    // Image path is required
    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Image path is required."),
    
    // Thumbnail path is required
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Thumbnail path is required."),
    
    // Price is required and must be positive
    body("inv_price")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be greater than 0."),
    
    // Miles is required and must be non-negative
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be 0 or greater."),
    
    // Color is required
    body("inv_color")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Color must be at least 2 characters."),
    
    // Classification is required
    body("classification_id")
      .isInt({ min: 1 })
      .withMessage("Please select a valid classification.")
  ]
}

/* ******************************
 * Check inventory data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { 
    inv_make, inv_model, inv_year, inv_description, 
    inv_image, inv_thumbnail, inv_price, inv_miles, 
    inv_color, classification_id 
  } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Vehicle",
      nav,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}

module.exports = validate