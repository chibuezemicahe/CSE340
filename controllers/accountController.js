const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

const accountCont = {}

/* ***************************
 *  Build account management view
 * ************************** */
accountCont.buildAccountManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build login view
 * ************************** */
accountCont.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build update account view
 * ************************** */
accountCont.buildUpdateAccount = async function (req, res, next) {
  let nav = await utilities.getNav()
  const account_id = req.params.account_id
  res.render("./account/update", {
    title: "Update Account Information",
    nav,
    account_id,
    errors: null,
  })
}

/* ***************************
 *  Build registration view
 * ************************** */
accountCont.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
accountCont.registerAccount = async function(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // Use async hash instead of hashSync
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    console.error("Password hashing error:", error)
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return // Add return here
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
  } catch (error) {
    console.error("Registration error:", error)
    req.flash("notice", "Sorry, the registration failed.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  Process logout
 * ************************** */
accountCont.logout = async function (req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

/* ****************************************
 *  Process login request
 * ************************************ */
accountCont.accountLogin = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  
  try {
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
      return
    }
    
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "Sorry, there was an error processing the login.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

/* ***************************
 *  Process Account Update
 * ************************** */
accountCont.updateAccount = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  
  try {
    const updateResult = await accountModel.updateAccountInfo(
      account_firstname,
      account_lastname, 
      account_email,
      account_id
    )
    
    if (updateResult) {
      req.flash("notice", "Account information updated successfully.")
      // Get updated account data
      const accountData = await accountModel.getAccountById(account_id)
      res.locals.accountData = accountData
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the account update failed.")
      res.status(501).render("account/update", {
        title: "Update Account Information",
        nav,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        errors: null,
      })
    }
  } catch (error) {
    console.error("Account update error:", error)
    req.flash("notice", "Sorry, there was an error updating the account.")
    res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      errors: null,
    })
  }
}

/* ***************************
 *  Process Password Change
 * ************************** */
accountCont.changePassword = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  
  // Hash the new password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    console.error("Password hashing error:", error)
    req.flash("notice", "Sorry, there was an error processing the password change.")
    res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      account_id,
      errors: null,
    })
    return
  }
  
  try {
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
    
    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the password update failed.")
      res.status(501).render("account/update", {
        title: "Update Account Information",
        nav,
        account_id,
        errors: null,
      })
    }
  } catch (error) {
    console.error("Password update error:", error)
    req.flash("notice", "Sorry, there was an error updating the password.")
    res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      account_id,
      errors: null,
    })
  }
}

module.exports = accountCont