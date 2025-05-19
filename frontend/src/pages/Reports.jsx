import { useState, useEffect } from 'react';
import { BarChartBig, Users, DollarSign, Calendar, FileText } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Reports = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7) + '-01');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch department summary
        const deptResponse = await axios.get(`${API_URL}/reports/departments`, { withCredentials: true });
        setDepartmentData(deptResponse.data);

        // Fetch monthly payroll report
        const reportResponse = await axios.get(`${API_URL}/reports/monthly-payroll?month=${selectedMonth}`, { withCredentials: true });
        setMonthlyReport(reportResponse.data);
      } catch (err) {
        setError('Failed to load report data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Calculate total employees and average salary
  const totalEmployees = departmentData.reduce((sum, dept) => sum + (dept.employee_count || 0), 0);
  const totalDepartments = departmentData.length;
  const averageNetSalary = departmentData.length > 0
    ? departmentData.reduce((sum, dept) => sum + (parseFloat(dept.average_net_salary) || 0), 0) / departmentData.length
    : 0;

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-xl">Loading report data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payroll Reports</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Net Salary</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(averageNetSalary)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <BarChartBig className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDepartments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Payroll Report */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Monthly Payroll Report</h2>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <input
              type="month"
              value={selectedMonth.slice(0, 7)}
              onChange={(e) => handleMonthChange(e.target.value + '-01')}
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyReport.length > 0 ? (
                monthlyReport.map((employee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.first_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.department_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(employee.net_salary)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No payroll data available for {formatDate(selectedMonth)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Department Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Gross Salary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Deduction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Net Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentData.length > 0 ? (
                departmentData.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.employee_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.base_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.average_gross_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.average_deduction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.average_net_salary)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No department data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
