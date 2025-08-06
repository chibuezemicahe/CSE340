const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to build account management view - REQUIRES LOGIN
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Route to build update account view - REQUIRES LOGIN
router.get("/update/:account_id", utilities.checkJWTToken, utilities.handleErrors(accountController.buildUpdateAccount))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration request
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Route to process logout
router.get("/logout", utilities.handleErrors(accountController.logout))

// Process account update
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Process password change
router.post(
  "/change-password",
  regValidate.passwordChangeRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.changePassword)
)

module.exports = router