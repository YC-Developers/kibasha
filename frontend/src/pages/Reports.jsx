import { useState, useEffect } from 'react';
import { BarChartBig, Users, DollarSign, TrendingUp } from 'lucide-react';
import { reportAPI } from '../utils/api';

const Reports = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);
        const data = await reportAPI.getDepartmentSummary();

        // Format data
        const formattedData = data.map(dept => ({
          name: dept.department || 'Unassigned',
          employees: dept.employee_count,
          averageSalary: parseFloat(dept.average_salary) || 0,
          minSalary: parseFloat(dept.min_salary) || 0,
          maxSalary: parseFloat(dept.max_salary) || 0,
        }));

        setDepartmentData(formattedData);
      } catch (err) {
        setError('Failed to load report data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate total employees and average salary
  const totalEmployees = departmentData.reduce((sum, dept) => sum + dept.employees, 0);
  const overallAverageSalary = departmentData.length > 0
    ? departmentData.reduce((sum, dept) => sum + (dept.averageSalary * dept.employees), 0) / totalEmployees
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-xl">Loading report data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

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
              <p className="text-sm font-medium text-gray-500">Average Salary</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(overallAverageSalary)}
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
              <p className="text-2xl font-semibold text-gray-900">{departmentData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Representation of Department Data */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Department Comparison</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {departmentData.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                  <span className="text-sm text-gray-500">{dept.employees} employees</span>
                </div>

                {/* Employee count bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gray-800 h-2.5 rounded-full"
                    style={{ width: `${(dept.employees / Math.max(...departmentData.map(d => d.employees))) * 100}%` }}
                  ></div>
                </div>

                {/* Salary info */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Min: {formatCurrency(dept.minSalary)}</span>
                  <span>Avg: {formatCurrency(dept.averageSalary)}</span>
                  <span>Max: {formatCurrency(dept.maxSalary)}</span>
                </div>

                {/* Salary range bar */}
                <div className="relative w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  {/* Min to Avg */}
                  <div
                    className="absolute bg-blue-500 h-2.5 rounded-l-full"
                    style={{
                      width: `${(dept.averageSalary / Math.max(...departmentData.map(d => d.maxSalary))) * 100}%`,
                      left: `${(dept.minSalary / Math.max(...departmentData.map(d => d.maxSalary))) * 100}%`
                    }}
                  ></div>

                  {/* Avg to Max */}
                  <div
                    className="absolute bg-green-500 h-2.5 rounded-r-full"
                    style={{
                      width: `${((dept.maxSalary - dept.averageSalary) / Math.max(...departmentData.map(d => d.maxSalary))) * 100}%`,
                      left: `${(dept.averageSalary / Math.max(...departmentData.map(d => d.maxSalary))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
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
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Salary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minimum Salary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maximum Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentData.length > 0 ? (
                departmentData.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.employees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.averageSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.minSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.maxSalary)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
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
