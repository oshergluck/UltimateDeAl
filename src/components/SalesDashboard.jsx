
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const SalesDashboard = ({ receipts = [], className = "" }) => {
  const [timePeriod, setTimePeriod] = useState("daily");

  const timePeriodOptions = [
    { value: "daily", label: "Today" },
    { value: "weekly", label: "This Week" },
    { value: "monthly", label: "This Month" },
    { value: "yearly", label: "This Year" },
    { value: "total", label: "All Time" },
  ];

  const periodTitle =
    timePeriod === "daily"
      ? "Today's"
      : timePeriod === "weekly"
      ? "This Week's"
      : timePeriod === "monthly"
      ? "This Month's"
      : timePeriod === "yearly"
      ? "This Year's"
      : "All Time";

  const formatCurrency = (value) => `${Number(value).toFixed(2)} USDC`;

  // a nicer recharts tooltip container
  const TooltipBox = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <div className="text-xs text-gray-300">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="mt-1 flex items-center justify-between gap-6">
            <div className="text-sm text-gray-100">{p.name}</div>
            <div className="text-sm font-semibold text-white">
              {p.name.includes("Sales") || p.name.includes("Amount")
                ? formatCurrency(p.value)
                : p.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const {
    filteredSalesData,
    refundData,
    productData,
    totalSales,
    successRate,
    totalTransactions,
  } = useMemo(() => {
    const now = new Date();

    const filteredReceipts = (receipts || []).filter((receipt) => {
      if (timePeriod === "total") return true;

      const date = new Date(receipt.timestamp * 1000);

      switch (timePeriod) {
        case "daily":
          return date.toDateString() === now.toDateString();

        case "weekly": {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          return date >= weekStart;
        }

        case "monthly":
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );

        case "yearly":
          return date.getFullYear() === now.getFullYear();

        default:
          return true;
      }
    });

    const groupedSales = filteredReceipts.reduce((acc, receipt) => {
      const date = new Date(receipt.timestamp * 1000);
      let periodKey;

      switch (timePeriod) {
        case "weekly": {
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          periodKey = dayNames[date.getDay()];
          break;
        }
        case "monthly":
          periodKey = `${date.getDate()}`;
          break;
        case "yearly":
          periodKey = date.toLocaleString("default", { month: "short" });
          break;
        case "total":
          periodKey = "All Time";
          break;
        case "daily":
        default:
          periodKey = `${date.getHours()}:00`;
          break;
      }

      acc[periodKey] =
        (acc[periodKey] || 0) + Number(receipt.amountPaid || 0) / 1e6;
      return acc;
    }, {});

    let sortedKeys;
    if (timePeriod === "weekly") {
      const order = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      sortedKeys = Object.keys(groupedSales).sort((a, b) => order[a] - order[b]);
    } else if (timePeriod === "monthly") {
      sortedKeys = Object.keys(groupedSales).sort((a, b) => +a - +b);
    } else if (timePeriod === "yearly") {
      const order = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      sortedKeys = Object.keys(groupedSales).sort((a, b) => order[a] - order[b]);
    } else if (timePeriod === "daily") {
      sortedKeys = Object.keys(groupedSales).sort(
        (a, b) => parseInt(a.split(":")[0], 10) - parseInt(b.split(":")[0], 10)
      );
    } else {
      sortedKeys = Object.keys(groupedSales);
    }

    const filteredSalesData = sortedKeys.map((key) => ({
      period: key,
      total: Number(groupedSales[key].toFixed(2)),
    }));

    const refundStats = filteredReceipts.reduce(
      (acc, receipt) => {
        const paid = Number(receipt.amountPaid || 0) / 1e6;
        if (receipt.isRefunded) {
          acc.refunded += paid;
          acc.refundCount++;
        } else {
          acc.successful += paid;
          acc.successCount++;
        }
        return acc;
      },
      { refunded: 0, successful: 0, refundCount: 0, successCount: 0 }
    );

    const refundData = [
      { name: "Successful", value: Number(refundStats.successful.toFixed(2)) },
      { name: "Refunded", value: Number(refundStats.refunded.toFixed(2)) },
    ];

    const productFrequency = filteredReceipts.reduce((acc, receipt) => {
      const key = receipt.productBarcode || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const productData = Object.entries(productFrequency)
      .map(([barcode, count]) => ({ barcode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalSales = Number(
      (refundStats.successful + refundStats.refunded).toFixed(2)
    );
    const totalTransactions = filteredReceipts.length;
    const successRate =
      totalTransactions > 0
        ? ((refundStats.successCount / totalTransactions) * 100).toFixed(1)
        : "0.0";

    return {
      filteredSalesData,
      refundData,
      productData,
      totalSales,
      successRate,
      totalTransactions,
    };
  }, [receipts, timePeriod]);

  const empty = !receipts?.length;

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl",
        "p-4 sm:p-6 lg:p-8 text-white",
        className,
      ].join(" ")}
    >
      {/* soft glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Sales Dashboard
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sales Performance
          </h2>
          <p className="mt-1 text-sm text-gray-300">
            Track sales, refunds, and top products by period.
          </p>
        </div>

        {/* Period Switch */}
        <div className="flex flex-wrap gap-2">
          {timePeriodOptions.map((opt) => {
            const active = timePeriod === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTimePeriod(opt.value)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  "border border-white/10",
                  active
                    ? "bg-cyan-400 text-black shadow-lg shadow-cyan-500/20"
                    : "bg-black/20 text-gray-200 hover:bg-white/10",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Sales"
          value={formatCurrency(totalSales)}
          hint={periodTitle}
          pill="bg-cyan-400/15 text-cyan-200 border-cyan-300/20"
        />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          hint="Non-refunded"
          pill="bg-emerald-400/15 text-emerald-200 border-emerald-300/20"
        />
        <StatCard
          label="Transactions"
          value={totalTransactions}
          hint="Count"
          pill="bg-violet-400/15 text-violet-200 border-violet-300/20"
        />
      </div>

      {/* Empty state */}
      {empty ? (
        <div className="relative z-10 mt-6 rounded-3xl border border-white/10 bg-black/20 p-6 text-center text-gray-200">
          <div className="text-lg font-bold">No receipts yet</div>
          <div className="mt-1 text-sm text-gray-300">
            Once sales are recorded, charts and top products will appear here.
          </div>
        </div>
      ) : (
        <>
          {/* Sales Trend */}
          <div className="relative z-10 mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold">
                {periodTitle} Sales Trend
              </h3>
              <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200">
                {filteredSalesData.length} points
              </span>
            </div>

            <div className="mt-4 h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredSalesData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: "#D1D5DB", fontSize: 12 }}
                    axisLine={{ stroke: "#4B5563" }}
                    tickLine={{ stroke: "#4B5563" }}
                  />
                  <YAxis
                    tick={{ fill: "#D1D5DB", fontSize: 12 }}
                    axisLine={{ stroke: "#4B5563" }}
                    tickLine={{ stroke: "#4B5563" }}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<TooltipBox />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Sales Amount"
                    stroke="#22D3EE"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#22D3EE", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#67E8F9", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom grid */}
          <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Refunds */}
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Transaction Status</h3>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Success: {successRate}%
                </span>
              </div>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={refundData}
                      cx="50%"
                      cy="50%"
                      outerRadius={86}
                      dataKey="value"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth={1}
                    >
                      {refundData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={idx === 0 ? "#34D399" : "#F87171"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<TooltipBox />}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: "#E5E7EB" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-xs text-gray-300">
                Successful + Refunded amounts are computed from filtered receipts.
              </div>
            </div>

            {/* Top Products */}
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold">Top Selling Products</h3>
                <span className="text-xs text-gray-300">
                  Top {productData.length}
                </span>
              </div>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="barcode"
                      tick={{ fill: "#D1D5DB", fontSize: 11 }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={{ stroke: "#4B5563" }}
                    />
                    <YAxis
                      tick={{ fill: "#D1D5DB", fontSize: 12 }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={{ stroke: "#4B5563" }}
                    />
                    <Tooltip content={<TooltipBox />} />
                    <Bar dataKey="count" name="Units Sold" radius={[10, 10, 0, 0]}>
                      {productData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={["#22D3EE", "#34D399", "#FBBF24", "#F87171", "#A78BFA"][idx % 5]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ul className="mt-4 space-y-2">
                {productData.map((p) => (
                  <li
                    key={p.barcode}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2"
                  >
                    <span className="text-sm text-gray-200 truncate">
                      {p.barcode}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {p.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ label, value, hint, pill }) => (
  <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs text-gray-300">{label}</div>
        <div className="mt-1 text-2xl font-extrabold tracking-tight">{value}</div>
        <div className="mt-1 text-xs text-gray-400">{hint}</div>
      </div>
      <div className={["rounded-full border px-3 py-1 text-xs font-semibold", pill].join(" ")}>
        Live
      </div>
    </div>
  </div>
);

export default SalesDashboard;

