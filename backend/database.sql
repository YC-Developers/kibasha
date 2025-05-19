-- SQL script for employee payroll management system

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

-- Department table
CREATE TABLE IF NOT EXISTS departments (
    department_code VARCHAR(10) PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    employee_number VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    address TEXT,
    telephone VARCHAR(20),
    gender ENUM('Male', 'Female', 'Other'),
    hired_date DATE NOT NULL,
    department_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_code) REFERENCES departments(department_code)
);

-- Salary table
CREATE TABLE IF NOT EXISTS salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_number VARCHAR(20) NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    total_deduction DECIMAL(10, 2) NOT NULL,
    net_salary DECIMAL(10, 2) NOT NULL,
    month DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_number) REFERENCES employees(employee_number) ON DELETE CASCADE
);

-- Insert a default admin user (password: admin123)
INSERT INTO users (username, password, first_name, last_name, email)
VALUES ('admin', '$2b$10$mLEI4smzk0YQPfNx7KA5UOlHu.77V0VG/W9RqQmPBJA0KQNu4W5Hy', 'Admin', 'User', 'admin@example.com');

-- Insert sample departments
INSERT INTO departments (department_code, department_name, gross_salary)
VALUES
('ENG', 'Engineering', 75000.00),
('HR', 'Human Resources', 65000.00),
('FIN', 'Finance', 70000.00),
('MKT', 'Marketing', 60000.00);

-- Insert sample employees
INSERT INTO employees (employee_number, first_name, last_name, position, address, telephone, gender, hired_date, department_code)
VALUES
('EMP001', 'John', 'Doe', 'Software Engineer', '123 Main St, Anytown, USA', '555-123-4567', 'Male', '2022-01-15', 'ENG'),
('EMP002', 'Jane', 'Smith', 'HR Manager', '456 Oak Ave, Somewhere, USA', '555-987-6543', 'Female', '2021-05-20', 'HR'),
('EMP003', 'Michael', 'Johnson', 'Accountant', '789 Pine Rd, Nowhere, USA', '555-456-7890', 'Male', '2022-03-10', 'FIN');

-- Insert sample salaries
INSERT INTO salaries (employee_number, gross_salary, total_deduction, net_salary, month)
VALUES
('EMP001', 75000.00, 15000.00, 60000.00, '2023-01-01'),
('EMP002', 65000.00, 13000.00, 52000.00, '2023-01-01'),
('EMP003', 70000.00, 14000.00, 56000.00, '2023-01-01'),
('EMP001', 75000.00, 15000.00, 60000.00, '2023-02-01'),
('EMP002', 65000.00, 13000.00, 52000.00, '2023-02-01'),
('EMP003', 70000.00, 14000.00, 56000.00, '2023-02-01');
