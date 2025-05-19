import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios
axios.defaults.withCredentials = true;

// Department API
export const departmentAPI = {
  // Get all departments
  getAll: async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get department by code
  getByCode: async (code) => {
    try {
      const res = await axios.get(`${API_URL}/departments/${code}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Create department
  create: async (departmentData) => {
    try {
      const res = await axios.post(`${API_URL}/departments`, departmentData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Update department
  update: async (code, departmentData) => {
    try {
      const res = await axios.put(`${API_URL}/departments/${code}`, departmentData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete department
  delete: async (code) => {
    try {
      const res = await axios.delete(`${API_URL}/departments/${code}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

// Employee API
export const employeeAPI = {
  // Get all employees
  getAll: async () => {
    try {
      const res = await axios.get(`${API_URL}/employees`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee by number
  getByNumber: async (number) => {
    try {
      const res = await axios.get(`${API_URL}/employees/${number}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Create employee
  create: async (employeeData) => {
    try {
      const res = await axios.post(`${API_URL}/employees`, employeeData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Update employee
  update: async (number, employeeData) => {
    try {
      const res = await axios.put(`${API_URL}/employees/${number}`, employeeData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete employee
  delete: async (number) => {
    try {
      const res = await axios.delete(`${API_URL}/employees/${number}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

// Salary API
export const salaryAPI = {
  // Get all salaries
  getAll: async () => {
    try {
      const res = await axios.get(`${API_URL}/salaries`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get salaries by employee number
  getByEmployeeNumber: async (employeeNumber) => {
    try {
      const res = await axios.get(`${API_URL}/employees/${employeeNumber}/salaries`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Create salary
  create: async (salaryData) => {
    try {
      const res = await axios.post(`${API_URL}/salaries`, salaryData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Update salary
  update: async (id, salaryData) => {
    try {
      const res = await axios.put(`${API_URL}/salaries/${id}`, salaryData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete salary
  delete: async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/salaries/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

// Reports API
export const reportAPI = {
  // Get department summary
  getDepartmentSummary: async () => {
    try {
      const res = await axios.get(`${API_URL}/reports/departments`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get monthly payroll report
  getMonthlyPayroll: async (month) => {
    try {
      const res = await axios.get(`${API_URL}/reports/monthly-payroll?month=${month}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
