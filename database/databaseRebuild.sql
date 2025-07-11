-- ENUM type creation
CREATE TYPE public.account_type AS ENUM (
    'Client',
    'Employee',
    'Admin'
);

-- Table: account
CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  account_type account_type DEFAULT 'Client'
);

-- Table: classification
CREATE TABLE classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(255) UNIQUE NOT NULL
);

-- Table: inventory
CREATE TABLE inventory (
  inv_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(255) NOT NULL,
  inv_model VARCHAR(255) NOT NULL,
  inv_description TEXT NOT NULL,
  inv_image VARCHAR(255),
  inv_thumbnail VARCHAR(255),
  inv_price NUMERIC(10, 2) NOT NULL,
  inv_year INTEGER NOT NULL,
  inv_miles INTEGER,
  inv_color VARCHAR(50),
  classification_id INTEGER REFERENCES classification(classification_id)
);

-- Insert data into classification
INSERT INTO classification (classification_name) VALUES
('Sport'),
('SUV'),
('Truck');

-- Insert data into inventory
INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id)
VALUES 
('Ford', 'F-150', 'A rugged truck with great towing capacity.', '/images/f150.jpg', '/images/f150-thumb.jpg', 35000.00, 2022, 10000, 'Black', 3),
('Chevrolet', 'Camaro', 'A sporty car with sleek design.', '/images/camaro.jpg', '/images/camaro-thumb.jpg', 28000.00, 2023, 5000, 'Red', 1),
('GM', 'Hummer', 'A beastly ride with small interiors.', '/images/hummer.jpg', '/images/hummer-thumb.jpg', 55000.00, 2021, 15000, 'Silver', 2);
