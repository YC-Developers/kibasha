import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios
axios.defaults.withCredentials = true;

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

  // Get employee by ID
  getById: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/employees/${id}`);
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
  update: async (id, employeeData) => {
    try {
      const res = await axios.put(`${API_URL}/employees/${id}`, employeeData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete employee
  delete: async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/employees/${id}`);
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

  // Get salaries by employee ID
  getByEmployeeId: async (employeeId) => {
    try {
      const res = await axios.get(`${API_URL}/employees/${employeeId}/salaries`);
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
};
