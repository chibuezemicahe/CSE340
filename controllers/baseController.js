const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

// Intentional error function for Task 3
baseController.triggerError = async function(req, res, next){
  try {
    // Intentionally throw an error to trigger the error handling middleware
    throw new Error("This is an intentional 500 error for testing purposes")
  } catch (error) {
    // Pass the error to the error handling middleware
    error.status = 500
    next(error)
  }
}

module.exports = baseController