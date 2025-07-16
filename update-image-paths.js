const pool = require("./database/");

async function updateImagePaths() {
  try {
    const sql = `
      UPDATE inventory
      SET 
        inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
        inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
    `;
    
    const result = await pool.query(sql);
    console.log("Image paths updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating image paths:", error);
    process.exit(1);
  }
}

updateImagePaths();