import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const SalesDashboard = ({ receipts, style }) => {
  // Time period state
  const [timePeriod, setTimePeriod] = useState('daily');

  // Process and filter data based on selected time period
  const {
    filteredSalesData,
    refundData,
    productData,
    totalSales,
    successRate,
    totalTransactions
  } = useMemo(() => {
    // First, filter receipts based on time period
    const filteredReceipts = receipts.filter(receipt => {
      // If it's "total", include all receipts
      if (timePeriod === 'total') return true;
      
      const date = new Date(receipt.timestamp * 1000);
      const now = new Date();
      
      switch(timePeriod) {
        case 'daily':
          // Only include receipts from today
          return date.toDateString() === now.toDateString();
        case 'weekly':
          // Only include receipts from this week
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          weekStart.setHours(0, 0, 0, 0);
          return date >= weekStart;
        case 'monthly':
          // Only include receipts from this month
          return date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear();
        case 'yearly':
          // Only include receipts from this year
          return date.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
    
    // Group filtered receipts by time period for the chart
    const groupedSales = filteredReceipts.reduce((acc, receipt) => {
      const date = new Date(receipt.timestamp * 1000);
      
      // Define time period key based on selection
      let periodKey;
      
      switch(timePeriod) {
        case 'weekly':
          // For weekly view, group by day of week
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          periodKey = dayNames[date.getDay()];
          break;
        case 'monthly':
          // For monthly view, group by day of month
          periodKey = `${date.getDate()}`;
          break;
        case 'yearly':
          // For yearly view, group by month
          periodKey = date.toLocaleString('default', { month: 'short' });
          break;
        case 'total':
          periodKey = 'All Time';
          break;
        case 'daily':
        default:
          // For daily view, group by hour
          periodKey = `${date.getHours()}:00`;
          break;
      }
      
      acc[periodKey] = (acc[periodKey] || 0) + Number(receipt.amountPaid)/1e6;
      return acc;
    }, {});

    // Sort keys for proper ordering in charts
    let sortedKeys;
    if (timePeriod === 'weekly') {
      const dayOrder = {'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6};
      sortedKeys = Object.keys(groupedSales).sort((a, b) => dayOrder[a] - dayOrder[b]);
    } else if (timePeriod === 'monthly') {
      sortedKeys = Object.keys(groupedSales).sort((a, b) => parseInt(a) - parseInt(b));
    } else if (timePeriod === 'yearly') {
      const monthOrder = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11};
      sortedKeys = Object.keys(groupedSales).sort((a, b) => monthOrder[a] - monthOrder[b]);
    } else if (timePeriod === 'daily') {
      sortedKeys = Object.keys(groupedSales).sort((a, b) => {
        return parseInt(a.split(':')[0]) - parseInt(b.split(':')[0]);
      });
    } else {
      sortedKeys = Object.keys(groupedSales);
    }

    // Convert to array for chart with proper ordering
    const filteredSalesData = sortedKeys.map(key => ({
      period: key,
      total: parseFloat(groupedSales[key].toFixed(2))
    }));

    // Process refund statistics for filtered receipts
    const refundStats = filteredReceipts.reduce((acc, receipt) => {
      if (receipt.isRefunded) {
        acc.refunded += Number(receipt.amountPaid)/1e6;
        acc.refundCount++;
      } else {
        acc.successful += Number(receipt.amountPaid)/1e6;
        acc.successCount++;
      }
      return acc;
    }, { refunded: 0, successful: 0, refundCount: 0, successCount: 0 });

    const refundData = [
      { name: 'Successful', value: parseFloat(refundStats.successful.toFixed(2)) },
      { name: 'Refunded', value: parseFloat(refundStats.refunded.toFixed(2)) }
    ];

    // Product frequency analysis for filtered receipts
    const productFrequency = filteredReceipts.reduce((acc, receipt) => {
      acc[receipt.productBarcode] = (acc[receipt.productBarcode] || 0) + 1;
      return acc;
    }, {});

    const productData = Object.entries(productFrequency)
      .map(([barcode, count]) => ({
        barcode,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalSales = parseFloat((refundStats.successful + refundStats.refunded).toFixed(2));
    const successRate = filteredReceipts.length > 0 ? 
      ((refundStats.successCount / filteredReceipts.length) * 100).toFixed(1) : '0.0';
    const totalTransactions = filteredReceipts.length;

    return {
      filteredSalesData,
      refundData,
      productData,
      totalSales,
      successRate,
      totalTransactions
    };
  }, [receipts, timePeriod]);

  // Format currency
  const formatCurrency = (value) => {
    return `${value} USDC`;
  };

  // Time period options
  const timePeriodOptions = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
    { value: 'total', label: 'All Time' }
  ];

  return (
    <div className={`bg-gray-900 rounded-lg shadow-xl p-6 text-gray-100 ${style}`}>
      {/* Dashboard Header with Time Period Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Sales Performance Dashboard</h2>
          <p className="text-gray-400">Tracking sales, refunds, and product performance</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="inline-flex items-center bg-gray-800 rounded-lg overflow-hidden">
            {timePeriodOptions.map((option) => (
              <button
                key={option.value}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  timePeriod === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setTimePeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-medium text-blue-400">Total Sales</p>
          <h3 className="text-2xl font-bold text-gray-100">{formatCurrency(totalSales)}</h3>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-medium text-green-400">Success Rate</p>
          <h3 className="text-2xl font-bold text-gray-100">{successRate}%</h3>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-medium text-purple-400">Total Transactions</p>
          <h3 className="text-2xl font-bold text-gray-100">{totalTransactions}</h3>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          {timePeriod === 'daily' ? 'Today\'s' : 
           timePeriod === 'weekly' ? 'This Week\'s' : 
           timePeriod === 'monthly' ? 'This Month\'s' : 
           timePeriod === 'yearly' ? 'This Year\'s' : 'All Time'} Sales Trend
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredSalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="period" 
                tick={{ fill: '#9CA3AF' }}
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF' }}
                axisLine={{ stroke: '#4B5563' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Sales']}
                contentStyle={{ backgroundColor: '#1F2937', borderRadius: '0.375rem', border: '1px solid #374151', color: '#E5E7EB' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#60A5FA" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#60A5FA', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }}
                name="Sales Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Refund Analysis */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Transaction Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={refundData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {refundData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#34D399' : '#F87171'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                  contentStyle={{ backgroundColor: '#1F2937', borderRadius: '0.375rem', border: '1px solid #374151', color: '#E5E7EB' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#E5E7EB' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200">
              Success Rate: {successRate}%
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Selling Products</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="barcode" 
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563' }}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563' }}
                />
                <Tooltip
                  formatter={(value) => [value, 'Units Sold']}
                  contentStyle={{ backgroundColor: '#1F2937', borderRadius: '0.375rem', border: '1px solid #374151', color: '#E5E7EB' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;