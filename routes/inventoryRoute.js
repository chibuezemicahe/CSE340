const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory management view - REQUIRES ADMIN ACCESS
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement))

// Route to build add classification view - REQUIRES ADMIN ACCESS
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification))

// Route to process add classification - REQUIRES ADMIN ACCESS
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Route to build inventory by classification view - PUBLIC ACCESS
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory detail view - PUBLIC ACCESS
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))

// Route to build add inventory view - REQUIRES ADMIN ACCESS
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))

// Route to process add inventory - REQUIRES ADMIN ACCESS
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Route to get inventory items by classification as JSON - REQUIRES ADMIN ACCESS
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Add these routes to the existing inventoryRoute.js file

const reviewValidate = require("../utilities/review-validation")

// Route to build add review form - REQUIRES LOGIN
router.get("/add-review/:invId", utilities.checkLogin, utilities.handleErrors(invController.buildAddReview))

// Route to process add review - REQUIRES LOGIN
router.post(
  "/add-review",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(invController.addReview)
)

// Route to mark review as helpful - REQUIRES LOGIN
router.get("/review/:reviewId/helpful/:invId", utilities.checkLogin, utilities.handleErrors(invController.markReviewHelpful))

module.exports = router