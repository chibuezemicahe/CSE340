const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
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
 *  Build inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.invId
  const data = await invModel.getInventoryByInventoryId(inventory_id)
  const detailView = await utilities.buildVehicleDetail(data)
  let nav = await utilities.getNav()
  const make = data.inv_make
  const model = data.inv_model
  res.render("./inventory/detail", {
    title: make + " " + model,
    nav,
    detailView,
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

module.exports = invCont
