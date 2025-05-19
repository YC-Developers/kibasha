-- SQL script for employee management system

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Salaries table
CREATE TABLE IF NOT EXISTS salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Insert a default admin user (password: admin123)
INSERT INTO users (username, password, first_name, last_name, email)
VALUES ('admin', '$2b$10$mLEI4smzk0YQPfNx7KA5UOlHu.77V0VG/W9RqQmPBJA0KQNu4W5Hy', 'Admin', 'User', 'admin@example.com');

-- Insert sample employees
INSERT INTO employees (first_name, last_name, email, phone, address, position, department, hire_date)
VALUES
('John', 'Doe', 'john.doe@example.com', '555-123-4567', '123 Main St, Anytown, USA', 'Software Engineer', 'Engineering', '2022-01-15'),
('Jane', 'Smith', 'jane.smith@example.com', '555-987-6543', '456 Oak Ave, Somewhere, USA', 'HR Manager', 'Human Resources', '2021-05-20'),
('Michael', 'Johnson', 'michael.johnson@example.com', '555-456-7890', '789 Pine Rd, Nowhere, USA', 'Accountant', 'Finance', '2022-03-10');

-- Insert sample salaries
INSERT INTO salaries (employee_id, amount, effective_date)
VALUES
(1, 75000.00, '2022-01-15'),
(2, 85000.00, '2021-05-20'),
(3, 65000.00, '2022-03-10');
