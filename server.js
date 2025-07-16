/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const expressLayouts = require("express-ejs-layouts")
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // Default Layout

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Intentional error route for Task 3
app.get("/trigger-error", utilities.handleErrors(baseController.triggerError))

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ 
    const errorView = utilities.buildErrorView(404, "Page not found")
    return res.status(404).render("errors/error", {
      title: "404 - Page Not Found",
      nav,
      errorView
    })
  } else {
    const errorView = utilities.buildErrorView(500, "Server Error")
    return res.status(500).render("errors/error", {
      title: "Server Error",
      nav,
      errorView
    })
  }
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
