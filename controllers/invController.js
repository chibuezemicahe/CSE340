const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  // Check if classification already exists
  const classificationExists = await invModel.checkExistingClassification(classification_name)
  
  if (classificationExists) {
    req.flash("notice", "Sorry, that classification name already exists.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    })
    return
  }

  const regResult = await invModel.addClassification(classification_name)

  if (regResult) {
    req.flash(
      "notice",
      `The ${classification_name} classification was successfully added.`
    )
    // Get updated navigation with new classification
    nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, adding the classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    })
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view (UPDATED)
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.invId
  const data = await invModel.getInventoryByInventoryId(inventory_id)
  const detailView = await utilities.buildVehicleDetail(data)
  
  // Get reviews and average rating
  const reviews = await reviewModel.getReviewsByInventoryId(inventory_id)
  const averageRating = await reviewModel.getAverageRating(inventory_id)
  
  let nav = await utilities.getNav()
  const make = data.inv_make
  const model = data.inv_model
  res.render("./inventory/detail", {
    title: make + " " + model,
    nav,
    detailView,
    reviews,
    averageRating,
    inventory: data,
  })
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
    layout: './layouts/layout' // Explicit layout path
  })
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const inventoryData = req.body

  const regResult = await invModel.addInventory(inventoryData)

  if (regResult && !regResult.message) {
    req.flash(
      "notice",
      `The ${inventoryData.inv_make} ${inventoryData.inv_model} was successfully added to inventory.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, adding the vehicle failed.")
    let classificationList = await utilities.buildClassificationList(inventoryData.classification_id)
    res.status(501).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      ...inventoryData
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

// Add these functions to the existing invController.js file

const reviewModel = require("../models/review-model")

/* ***************************
 *  Build add review form
 * ************************** */
invCont.buildAddReview = async function (req, res, next) {
  const inv_id = req.params.invId
  const inventory = await invModel.getInventoryByInventoryId(inv_id)
  let nav = await utilities.getNav()
  
  // Check if user already reviewed this vehicle
  if (res.locals.loggedin) {
    const existingReview = await reviewModel.checkExistingReview(res.locals.accountData.account_id, inv_id)
    if (existingReview) {
      req.flash("notice", "You have already reviewed this vehicle.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }
  }
  
  res.render("./inventory/add-review", {
    title: `Review ${inventory.inv_make} ${inventory.inv_model}`,
    nav,
    inventory,
    errors: null,
  })
}

/* ***************************
 *  Process add review
 * ************************** */
invCont.addReview = async function (req, res) {
  let nav = await utilities.getNav()
  const { inv_id, review_rating, review_text } = req.body
  const account_id = res.locals.accountData.account_id
  
  // Check if user already reviewed this vehicle
  const existingReview = await reviewModel.checkExistingReview(account_id, inv_id)
  if (existingReview) {
    req.flash("notice", "You have already reviewed this vehicle.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }
  
  const reviewResult = await reviewModel.addReview(account_id, inv_id, review_rating, review_text)
  
  if (reviewResult && !reviewResult.message) {
    req.flash("notice", "Thank you for your review!")
    res.redirect(`/inv/detail/${inv_id}`)
  } else {
    req.flash("notice", "Sorry, adding the review failed.")
    const inventory = await invModel.getInventoryByInventoryId(inv_id)
    res.status(501).render("inventory/add-review", {
      title: `Review ${inventory.inv_make} ${inventory.inv_model}`,
      nav,
      inventory,
      errors: null,
      review_rating,
      review_text
    })
  }
}

/* ***************************
 *  Mark review as helpful
 * ************************** */
invCont.markReviewHelpful = async function (req, res) {
  const review_id = req.params.reviewId
  const inv_id = req.params.invId
  
  const result = await reviewModel.updateReviewHelpfulness(review_id)
  
  if (result && !result.message) {
    req.flash("notice", "Thank you for your feedback!")
  } else {
    req.flash("notice", "Sorry, there was an error processing your request.")
  }
  
  res.redirect(`/inv/detail/${inv_id}`)
}

module.exports = invCont
