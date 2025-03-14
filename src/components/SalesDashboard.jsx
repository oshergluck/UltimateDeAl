import React from 'react';
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
  // Process daily sales data
  const dailySales = receipts.reduce((acc, receipt) => {
    const date = new Date(receipt.timestamp * 1000).toLocaleDateString();
    acc[date] = (acc[date] || 0) + Number(receipt.amountPaid)/1e6;
    return acc;
  }, {});

  const dailySalesData = Object.entries(dailySales).map(([date, total]) => ({
    date,
    total: parseFloat(total.toFixed(2))
  }));

  // Process refund statistics
  const refundStats = receipts.reduce((acc, receipt) => {
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

  // Product frequency analysis
  const productFrequency = receipts.reduce((acc, receipt) => {
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

  const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'];
  const successRate = ((refundStats.successCount / receipts.length) * 100).toFixed(1);

  // Format currency
  const formatCurrency = (value) => {
    return `${value} USDT`;
  };

  return (
    <div className={`bg-gray-900 rounded-lg shadow-xl p-6 text-gray-100 ${style}`}>
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-100">Sales Performance Dashboard</h2>
        <p className="text-gray-400">Tracking sales, refunds, and product performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-medium text-blue-400">Total Sales</p>
          <h3 className="text-2xl font-bold text-gray-100">{formatCurrency(refundStats.successful + refundStats.refunded)}</h3>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-medium text-green-400">Success Rate</p>
          <h3 className="text-2xl font-bold text-gray-100">{successRate}%</h3>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-medium text-purple-400">Total Transactions</p>
          <h3 className="text-2xl font-bold text-gray-100">{receipts.length}</h3>
        </div>
      </div>

      {/* Daily Sales Trend */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Daily Sales Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
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
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {refundData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[1] : COLORS[3]} />
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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