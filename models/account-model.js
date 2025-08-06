const pool = require("../database/")

/* *****************************
* Register new account
* ***************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (first_name, last_name, email, password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, first_name as account_firstname, last_name as account_lastname, email as account_email, account_type, password as account_password FROM account WHERE email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account ID
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, first_name as account_firstname, last_name as account_lastname, email as account_email, account_type FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* *****************************
* Update account information
* ***************************** */
async function updateAccountInfo(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = "UPDATE account SET first_name = $1, last_name = $2, email = $3 WHERE account_id = $4 RETURNING *"
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
    return error.message
  }
}

/* *****************************
* Update account password
* ***************************** */
async function updatePassword(hashedPassword, account_id) {
  try {
    const sql = "UPDATE account SET password = $1 WHERE account_id = $2 RETURNING *"
    const data = await pool.query(sql, [hashedPassword, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
    return error.message
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword
}