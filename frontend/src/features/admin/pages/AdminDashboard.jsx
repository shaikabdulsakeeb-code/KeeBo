import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, TrendingUp, DollarSign, Activity,
  AlertTriangle, CheckCircle, Search, Filter, Download, Calendar, ChevronRight, Clock, X, Eye,
  ShieldAlert, User
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import {
  useGetAdminStatsQuery,
  useGetAllTechniciansQuery,
  useVerifyTechnicianMutation,
  useGetSettlementsQuery,
  useVerifySettlementMutation,
  useSuspendTechnicianMutation
} from '../api/adminApi';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { socket } from '../../../lib/socket';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: statsResponse, isLoading: isStatsLoading } = useGetAdminStatsQuery();
  const { data: techsResponse, isLoading: isTechsLoading } = useGetAllTechniciansQuery({
    isApproved: 'approved',
    limit: 100
  });
  const [verifyTech] = useVerifyTechnicianMutation();

  const { data: settlementsResponse, isLoading: isSettlementsLoading } = useGetSettlementsQuery();
  const [verifySettlement, { isLoading: isVerifyingSettlement }] = useVerifySettlementMutation();
  const [suspendTech, { isLoading: isSuspending }] = useSuspendTechnicianMutation();

  const statsData = statsResponse?.data || {};
  const technicians = techsResponse?.data || [];
  const settlements = settlementsResponse?.data || [];
  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const defaulterTechs = technicians.filter(t => t.outstandingDues > 0);

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [hoveredPointIdx, setHoveredPointIdx] = useState(null);

  const activeTab = searchParams.get('tab') || 'queue';
  const hasTabParam = !!searchParams.get('tab');
  const setActiveTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Suspension modal states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [selectedTechToSuspend, setSelectedTechToSuspend] = useState(null);

  // Dues partial settlement modal states
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [decision, setDecision] = useState('approve_full'); // 'approve_full', 'approve_partial', 'reject'
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [remainingDuesInput, setRemainingDuesInput] = useState('');

  // Live online counts tracked via Socket.io
  const [onlineCounts, setOnlineCounts] = useState({ users: 0, technicians: 0 });

  useEffect(() => {
    const handleOnlineStats = (data) => {
      if (data) {
        setOnlineCounts(data);
      }
    };

    socket.on('onlineStats', handleOnlineStats);

    // If socket is connected, request immediate update
    if (socket.connected) {
      socket.emit('joinAdmin');
    }

    return () => {
      socket.off('onlineStats', handleOnlineStats);
    };
  }, []);

  const calculateDaysUnpaid = (lastPaymentDate, createdAt) => {
    const lastPay = lastPaymentDate || createdAt || new Date();
    const diffTime = Math.abs(new Date() - new Date(lastPay));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatUnpaidDuration = (lastPaymentDate, createdAt) => {
    const lastPay = lastPaymentDate || createdAt;
    if (!lastPay) return 'Not paid since some time ago';

    const diffMs = Math.abs(new Date() - new Date(lastPay));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `Not paid since ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) {
      return `Not paid since ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    if (diffMins > 0) {
      return `Not paid since ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }
    return 'Not paid since just now';
  };

  const handleExportReport = () => {
    if (!statsData) {
      toast.error("No statistics data available to export.");
      return;
    }

    const rows = [
      ["KEEBO ADMIN SYSTEM SUMMARY REPORT"],
      [`Generated At: ${new Date().toLocaleString()}`],
      [],
      ["METRICS", "VALUE"],
      ["Total Verified Technicians", statsData.totalTechnicians || 0],
      ["Active Bookings", statsData.totalBookings || 0],
      ["Registered Customers", statsData.totalUsers || 0],
      ["Total Platform Profit (Revenue)", `₹${statsData.totalPlatformEarnings || 0}`],
      ["Average Earnings Per Job", `₹${statsData.avgPlatformEarning || 0}`],
      ["Total Outstanding Dues", `₹${statsData.totalOutstandingDues || 0}`],
      [],
      ["DAILY PERFORMANCE TREND (LAST 7 DAYS)"],
      ["Date", "Day", "Bookings Count", "Revenue Generated"],
    ];

    const dailyTrend = statsData.dailyTrend || [];
    dailyTrend.forEach(item => {
      rows.push([item.date, item.day, item.count, `₹${item.revenue}`]);
    });

    rows.push([]);
    rows.push(["SERVICE CATEGORY DISTRIBUTION"]);
    rows.push(["Service Category", "Bookings Count"]);

    const categoryDistribution = statsData.categoryDistribution || [];
    categoryDistribution.forEach(cat => {
      rows.push([cat.category, cat.count]);
    });

    // Convert to CSV format with a UTF-8 BOM prefix (\uFEFF)
    const csvContent = "\uFEFF" + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

    // Use Blob to ensure proper UTF-8 handling in Excel and other spreadsheet viewers
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KeeBo_Admin_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Summary report exported successfully as CSV!");
  };

  const handleToggleSuspend = async (tech) => {
    if (tech.isSuspended) {
      try {
        const res = await suspendTech({ id: tech._id }).unwrap();
        toast.success(res.message || 'Technician reactivated successfully');
      } catch (err) {
        toast.error(err.data?.message || 'Failed to reactivate technician');
      }
    } else {
      setSelectedTechToSuspend(tech);
      const durationStr = formatUnpaidDuration(tech.lastPaymentDate, tech.createdAt);
      setSuspensionReason(`Outstanding platform dues unpaid. ${durationStr}. Profile locked until settled.`);
      setShowSuspendModal(true);
    }
  };

  const confirmSuspend = async () => {
    if (!selectedTechToSuspend) return;
    try {
      const res = await suspendTech({ id: selectedTechToSuspend._id, suspensionReason }).unwrap();
      toast.success(res.message || 'Technician profile suspended');
      setShowSuspendModal(false);
      setSelectedTechToSuspend(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to suspend technician');
    }
  };

  const stats = [
    { label: 'Total Technicians', value: statsData.totalTechnicians || '0', trend: '+12%', icon: <Briefcase className="w-5 h-5 text-blue-500" /> },
    { label: 'Total Bookings', value: statsData.totalBookings || '0', trend: 'Live', icon: <Activity className="w-5 h-5 text-orange-500" /> },
    { label: 'Total Customers', value: statsData.totalUsers || '0', trend: '+8%', icon: <Users className="w-5 h-5 text-cyan-500" /> },
    { label: 'Platform Profit', value: `₹${statsData.totalPlatformEarnings?.toLocaleString() || '0'}`, trend: 'Revenue', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
    { 
      label: 'Avg Comm / Job', 
      value: `₹${statsData.avgPlatformEarning || '0'}`, 
      trend: 'Average', 
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-indigo-500"
        >
          <path d="M6 3h12M6 8h12" />
          <path d="M6 3a5 5 0 0 1 0 10h3" />
          <path d="M9 13l6 8" />
        </svg>
      )
    },
    { label: 'Outstanding Dues', value: `₹${statsData.totalOutstandingDues?.toLocaleString() || '0'}`, trend: 'Receivables', icon: <AlertTriangle className="w-5 h-5 text-rose-500" /> },
  ];

  const handleVerify = async (id, status) => {
    try {
      await verifyTech({ id, status }).unwrap();
      toast.success(`Technician ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to verify technician');
    }
  };

  const openDecisionModal = (settlement, initialStatus) => {
    setSelectedSettlement(settlement);
    if (initialStatus === 'approved') {
      setDecision('approve_full');
    } else {
      setDecision('reject');
    }
    setRejectionReasonInput('');
    setRemainingDuesInput('');
  };

  const handleConfirmDecision = async () => {
    if (!selectedSettlement) return;

    let status = 'approved';
    let rejectionReason = '';
    let remainingDues = undefined;

    if (decision === 'reject') {
      status = 'rejected';
      rejectionReason = rejectionReasonInput.trim();
      if (!rejectionReason) {
        toast.error("Rejection reason is required.");
        return;
      }
    } else if (decision === 'approve_partial') {
      status = 'approved';
      if (remainingDuesInput === '' || isNaN(Number(remainingDuesInput)) || Number(remainingDuesInput) < 0) {
        toast.error("Please enter a valid remaining due amount (0 or higher).");
        return;
      }
      remainingDues = Number(remainingDuesInput);
      if (remainingDues >= selectedSettlement.amount) {
        toast.error(`Remaining due must be less than the total dues claimed (₹${selectedSettlement.amount})!`);
        return;
      }
    }

    try {
      await verifySettlement({
        id: selectedSettlement._id,
        status,
        rejectionReason,
        remainingDues
      }).unwrap();

      toast.success(`Payment request processed as ${decision === 'reject'
          ? 'rejected'
          : decision === 'approve_partial'
            ? `approved with ₹${remainingDues.toLocaleString()} remaining dues`
            : 'approved & fully cleared'
        }!`);
      setSelectedSettlement(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to process payment decision');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {activeTab === 'queue' && hasTabParam
              ? 'Dues Settlement Queue'
              : activeTab === 'defaulters' && hasTabParam
                ? 'Unpaid Accounts Ledger'
                : 'Dashboard Overview'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeTab === 'queue' && hasTabParam
              ? 'Review and approve bank payouts uploaded by technicians via UPI scans.'
              : activeTab === 'defaulters' && hasTabParam
                ? 'Directly view active technician accounts with outstanding platform dues.'
                : 'Real-time performance analytics for this month.'}
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-start sm:justify-end">
          <div className="bg-white border rounded-xl px-4 py-2 flex items-center text-xs sm:text-sm font-bold text-slate-600 shadow-sm whitespace-nowrap">
            <Calendar className="w-4 h-4 mr-2" /> {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          {!hasTabParam && (
            <Button
              onClick={handleExportReport}
              className="btn-primary flex items-center rounded-xl text-xs sm:text-sm py-2.5 px-4 shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
          )}
        </div>
      </header>

      {/* Live System Activity Banner */}
      <div className="bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent border border-emerald-500/10 rounded-[1.5rem] p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
        <div className="flex items-center space-x-3">
          <div className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </div>
          <div>
            <span className="text-xs font-black text-emerald-800 tracking-wider uppercase block">Live Connection Room</span>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Socket-level active listener count</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          {/* Customers Online Card */}
          <div className="bg-white border rounded-xl px-4 py-2 flex items-center space-x-3 shadow-sm min-w-[140px]">
            <div className="p-1.5 bg-cyan-50 rounded-lg">
              <Users className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Online Users</span>
              <span className="text-base font-black text-slate-800 leading-none mt-0.5 block">{onlineCounts.users}</span>
            </div>
          </div>

          {/* Technicians Online Card */}
          <div className="bg-white border rounded-xl px-4 py-2 flex items-center space-x-3 shadow-sm min-w-[140px]">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Online Technicians</span>
              <span className="text-base font-black text-slate-800 leading-none mt-0.5 block">{onlineCounts.technicians}</span>
            </div>
          </div>
        </div>
      </div>

      {!hasTabParam ? (
        <>
          {/* General Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white border rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl">{stat.icon}</div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${stat.label === 'Outstanding Dues' && statsData.totalOutstandingDues > 0
                      ? 'bg-rose-50 text-rose-600 animate-pulse'
                      : stat.trend.includes('+') || stat.trend === 'Revenue'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 truncate">{isStatsLoading ? '...' : stat.value}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {(() => {
            const dailyTrend = statsData.dailyTrend || [];
            const maxCount = Math.max(...dailyTrend.map(d => d.count), 1);
            const categoryDistribution = statsData.categoryDistribution || [];
            const totalCategoryBookings = categoryDistribution.reduce((acc, c) => acc + c.count, 0);
            const colors = ['#2563EB', '#FF7A00', '#06B6D4', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
            const textColors = ['bg-blue-500', 'bg-orange-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500'];

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 pb-10">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-white border rounded-[2rem] p-8 shadow-sm relative">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-xl font-black text-slate-800">Performance Trend</h2>
                      <p className="text-xs text-slate-400">Daily bookings & growth for {new Date().toLocaleString('default', { month: 'long' })}</p>
                    </div>
                    <div className="px-4 py-1.5 bg-slate-50 text-slate-500 border rounded-xl text-[10px] font-black uppercase tracking-wider">
                      Last 7 Days
                    </div>
                  </div>

                  {dailyTrend.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-[1.5rem] p-6 text-slate-400 italic text-xs">
                      No daily performance trend recorded yet.
                    </div>
                  ) : (() => {
                    const paddingLeft = 40;
                    const paddingRight = 40;
                    const width = 600;
                    const height = 240;
                    const chartWidth = width - paddingLeft - paddingRight; // 520

                    const points = dailyTrend.map((item, i) => ({
                      x: paddingLeft + (i * (chartWidth / Math.max(dailyTrend.length - 1, 1))),
                      y: 200 - (item.count / maxCount) * 160,
                      item
                    }));

                    let linePath = "";
                    let areaPath = "";

                    if (points.length > 0) {
                      linePath = `M ${points[0].x} ${points[0].y}`;
                      for (let i = 0; i < points.length - 1; i++) {
                        const p0 = points[i];
                        const p1 = points[i + 1];
                        const cpX1 = p0.x + (p1.x - p0.x) / 2;
                        const cpY1 = p0.y;
                        const cpX2 = p0.x + (p1.x - p0.x) / 2;
                        const cpY2 = p1.y;
                        linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                      }
                      areaPath = linePath + ` L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;
                    }

                    const handleMouseMove = (e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseX = e.clientX - rect.left;
                      // Map mouseX (0 to rect.width) to SVG viewBox width (0 to 600)
                      const svgX = (mouseX / rect.width) * 600;

                      let closestIdx = 0;
                      let minDiff = Infinity;
                      points.forEach((pt, idx) => {
                        const diff = Math.abs(pt.x - svgX);
                        if (diff < minDiff) {
                          minDiff = diff;
                          closestIdx = idx;
                        }
                      });
                      setHoveredPointIdx(closestIdx);
                    };

                    const handleMouseLeave = () => {
                      setHoveredPointIdx(null);
                    };

                    return (
                      <div className="relative h-64">
                        {/* Dynamic floating metric indicator at top-right of container */}
                        <AnimatePresence>
                          {hoveredPointIdx !== null && points[hoveredPointIdx] && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute -top-16 right-0 bg-slate-900 text-white text-[10px] sm:text-[11px] py-2 px-3 rounded-2xl shadow-xl flex items-center gap-4 transition-all duration-150 z-30"
                            >
                              <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[8px]">Day</span>
                                <span className="font-extrabold">{points[hoveredPointIdx].item.day}</span>
                              </div>
                              <div className="w-px h-6 bg-slate-800" />
                              <div>
                                <span className="text-blue-400 font-bold uppercase tracking-wider block text-[8px]">Bookings</span>
                                <span className="font-black text-center block">{points[hoveredPointIdx].item.count}</span>
                              </div>
                              <div className="w-px h-6 bg-slate-800" />
                              <div>
                                <span className="text-emerald-400 font-bold uppercase tracking-wider block text-[8px]">Revenue</span>
                                <span className="font-black">₹{points[hoveredPointIdx].item.revenue}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* SVG Spline Graph */}
                        <svg
                          viewBox="0 0 600 240"
                          className="w-full h-full overflow-visible select-none"
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#2563EB" />
                              <stop offset="50%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#60A5FA" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal dashed reference lines */}
                          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                            const yGrid = 200 - ratio * 160;
                            return (
                              <line
                                key={idx}
                                x1={40}
                                y1={yGrid}
                                x2={560}
                                y2={yGrid}
                                stroke="#F8FAFC"
                                strokeWidth="1.5"
                                strokeDasharray="4 6"
                              />
                            );
                          })}

                          {/* Active hovered vertical tracking guide */}
                          {hoveredPointIdx !== null && points[hoveredPointIdx] && (
                            <line
                              x1={points[hoveredPointIdx].x}
                              y1={20}
                              x2={points[hoveredPointIdx].x}
                              y2={200}
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                              className="transition-all duration-200"
                            />
                          )}

                          {/* Dynamic Gradient Area Fill below curve */}
                          {areaPath && (
                            <path
                              d={areaPath}
                              fill="url(#chartGradient)"
                              className="transition-all duration-500"
                            />
                          )}

                          {/* Dynamic Smooth Spline Curve Stroke */}
                          {linePath && (
                            <path
                              d={linePath}
                              fill="none"
                              stroke="url(#lineGradient)"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              className="transition-all duration-500"
                            />
                          )}

                          {/* Interactive coordinates points */}
                          {points.map((pt, idx) => {
                            const isHovered = hoveredPointIdx === idx;
                            return (
                              <g key={idx} className="cursor-pointer">
                                {/* Inner core indicator */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="5"
                                  fill="#FFFFFF"
                                  stroke="#2563EB"
                                  strokeWidth="3"
                                  className="transition-all duration-200"
                                />
                                {/* Outer pulsing ring for active tracked coordinate */}
                                {isHovered && (
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="10"
                                    fill="#2563EB"
                                    fillOpacity="0.2"
                                    className="animate-ping pointer-events-none"
                                  />
                                )}
                              </g>
                            );
                          })}

                          {/* X-Axis day labels */}
                          {points.map((pt, idx) => (
                            <text
                              key={idx}
                              x={pt.x}
                              y={225}
                              textAnchor="middle"
                              className={`text-[9px] font-black tracking-wider uppercase select-none transition-colors duration-200 ${hoveredPointIdx === idx ? 'fill-blue-600 font-extrabold' : 'fill-slate-400 font-bold'
                                }`}
                            >
                              {pt.item.day}
                            </text>
                          ))}
                        </svg>
                      </div>
                    );
                  })()}
                </div>

                {/* Bookings by Category Pie Chart */}
                <div className="bg-white border rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">Service Distribution</h2>
                    <p className="text-xs text-slate-400 mb-8">Data for current month</p>
                  </div>

                  <div className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto mb-8">
                    <svg viewBox="0 0 100 100" className="rotate-[-90deg] w-full h-full">
                      {totalCategoryBookings === 0 ? (
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="12" strokeDasharray="251.3" />
                      ) : (() => {
                        let cumulativePercent = 0;
                        return categoryDistribution.slice(0, 5).map((cat, idx) => {
                          const percent = cat.count / totalCategoryBookings;
                          const strokeLength = percent * 251.3;
                          const strokeOffset = -(cumulativePercent * 251.3);
                          cumulativePercent += percent;
                          return (
                            <circle
                              key={idx}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke={colors[idx % colors.length]}
                              strokeWidth="12"
                              strokeDasharray={`${strokeLength} 251.3`}
                              strokeDashoffset={strokeOffset}
                              className="transition-all duration-500 hover:stroke-[14px] cursor-pointer"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black">{totalCategoryBookings}</span>
                      <span className="text-[10px] font-bold text-slate-400">Total</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {categoryDistribution.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 italic">No service data recorded.</p>
                    ) : (
                      categoryDistribution.slice(0, 5).map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${textColors[idx % textColors.length]} mr-2`}></div>
                            <span className="truncate max-w-[120px] text-slate-700">{cat.category}</span>
                          </div>
                          <span className="text-slate-500">{cat.count} ({Math.round((cat.count / totalCategoryBookings) * 100)}%)</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        /* Action Desk Workspace */
        <div className="mb-10 bg-white border rounded-[2rem] p-8 shadow-sm">
          {activeTab === 'queue' ? (
            <div>
              {isSettlementsLoading ? (
                <div className="py-10 text-center text-slate-400 italic text-xs">Loading settlement ledger...</div>
              ) : pendingSettlements.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-6 text-slate-400">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
                  <h4 className="font-extrabold text-sm text-slate-700">Clear Settlement Queue</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
                    All technician payments are settled and reconciled. No pending reviews exist at this moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingSettlements.map((settlement) => (
                    <motion.div
                      key={settlement._id}
                      whileHover={{ scale: 1.01 }}
                      className="border rounded-[1.5rem] p-5 shadow-sm bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 text-sm">
                            {settlement.user?.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800">{settlement.user?.name || 'Technician'}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{settlement.user?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-dashed py-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Amount Transferred:</span>
                            <strong className="text-slate-900 font-black">₹{settlement.amount?.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">UPI Ref:</span>
                            <code className="text-indigo-600 font-bold bg-indigo-50/50 px-1.5 py-0.5 rounded text-[10px]">{settlement.transactionRef}</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date Logged:</span>
                            <span className="text-slate-600 font-medium">{new Date(settlement.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-dashed pt-2 mt-2">
                            <span className="text-slate-400">Payment Receipt:</span>
                            {settlement.screenshot ? (
                              <button
                                type="button"
                                onClick={() => setActiveReceipt(settlement.screenshot)}
                                className="flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase transition-colors shadow-sm"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Receipt</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">No attachment</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() => openDecisionModal(settlement, 'approved')}
                          disabled={isVerifyingSettlement}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-10 font-bold"
                        >
                          Approve Payment
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => openDecisionModal(settlement, 'rejected')}
                          disabled={isVerifyingSettlement}
                          className="flex-1 border-red-500 hover:bg-red-50 text-red-650 rounded-xl text-xs h-10 font-bold"
                        >
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {isTechsLoading ? (
                <div className="py-10 text-center text-slate-400 italic text-xs">Loading dues ledger...</div>
              ) : defaulterTechs.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-6 text-slate-400">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
                  <h4 className="font-extrabold text-sm text-slate-700">All Accounts Cleared</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
                    All active verified professionals have completely settled their platform balances. No defaulters exist.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {defaulterTechs.map((tech) => {
                    return (
                      <motion.div
                        key={tech._id}
                        whileHover={{ scale: 1.01 }}
                        className="border rounded-[1.5rem] p-5 shadow-sm bg-slate-50/50 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase tracking-wider">
                              ₹{tech.outstandingDues?.toLocaleString()} Due
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${tech.isSuspended
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-slate-100 text-slate-500'
                              }`}>
                              {tech.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-500 text-sm shadow-inner shrink-0">
                              {tech.profileImage && tech.profileImage !== 'default.jpg' ? (
                                <img src={tech.profileImage} alt={tech.userId?.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-sm text-slate-800 truncate">{tech.userId?.name || 'Technician'}</h4>
                              <p className="text-[10px] font-medium text-slate-400 truncate">{tech.userId?.email}</p>
                            </div>
                          </div>

                          <div className="space-y-2 border-t border-dashed py-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Category:</span>
                              <span className="text-indigo-600 font-extrabold uppercase text-[10px]">{tech.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Duration:</span>
                              <span className="text-rose-600 font-black">{formatUnpaidDuration(tech.lastPaymentDate, tech.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Last Payment Settled:</span>
                              <span className="text-slate-600 font-medium">
                                {tech.lastPaymentDate ? new Date(tech.lastPaymentDate).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-dashed">
                          <Button
                            onClick={() => handleToggleSuspend(tech)}
                            disabled={isSuspending}
                            className={`w-full rounded-xl text-xs h-10 font-black uppercase tracking-wider shadow-sm transition-all ${tech.isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-amber-600 hover:bg-amber-700 text-white'
                              }`}
                          >
                            {tech.isSuspended ? 'Reactivate' : 'Suspend'}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Custom Settlement Action Decision Modal */}
      <AnimatePresence>
        {selectedSettlement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 flex flex-col overflow-y-auto max-h-[90vh] modern-scrollbar"
            >
              <button
                onClick={() => setSelectedSettlement(null)}
                className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors animate-pulse animate-duration-1000"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-black text-slate-900 mb-2">Process Settlement</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Review payment details and select the matching action for <strong>{selectedSettlement.technician?.userId?.name || selectedSettlement.user?.name || 'Technician'}</strong>.
              </p>

              {/* Transfer Details Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border mb-6 text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Dues Claimed:</span>
                  <span className="font-extrabold text-slate-800">₹{selectedSettlement.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UPI Ref ID:</span>
                  <code className="text-indigo-600 font-bold bg-indigo-50/50 px-1 py-0.5 rounded text-[10px]">{selectedSettlement.transactionRef}</code>
                </div>
                {selectedSettlement.screenshot && (
                  <div className="flex justify-between items-center border-t border-dashed pt-2 mt-2">
                    <span className="text-slate-400">Receipt Attachment:</span>
                    <button
                      type="button"
                      onClick={() => setActiveReceipt(selectedSettlement.screenshot)}
                      className="flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Receipt</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Decision Selector */}
              <div className="w-full mb-6">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  Settlement Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('approve_full')}
                    className={`py-2.5 px-2 rounded-xl text-[10px] font-black uppercase border transition-all ${decision === 'approve_full'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-655 font-bold'
                      }`}
                  >
                    Approve Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('approve_partial')}
                    className={`py-2.5 px-2 rounded-xl text-[10px] font-black uppercase border transition-all ${decision === 'approve_partial'
                        ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-655 font-bold'
                      }`}
                  >
                    Approve Partial
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('reject')}
                    className={`py-2.5 px-2 rounded-xl text-[10px] font-black uppercase border transition-all ${decision === 'reject'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-655 font-bold'
                      }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Conditional Inputs */}
              {decision === 'approve_partial' && (
                <div className="w-full mb-6 text-left animate-fadeIn">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Remaining Outstanding Dues (₹) *
                  </label>
                  <input
                    type="number"
                    value={remainingDuesInput}
                    onChange={(e) => setRemainingDuesInput(e.target.value)}
                    placeholder="Enter remaining balance due"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    This confirms a partial payment. The technician paid ₹{(selectedSettlement.amount - (Number(remainingDuesInput) || 0)).toLocaleString()}. The balance of ₹{Number(remainingDuesInput || 0).toLocaleString()} will remain on their profile.
                  </p>
                </div>
              )}

              {decision === 'reject' && (
                <div className="w-full mb-6 text-left animate-fadeIn">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Provide a clear explanation for rejecting this payment submission..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-xs focus:outline-none focus:border-indigo-500 text-slate-800 resize-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 w-full mt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSettlement(null)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDecision}
                  disabled={isVerifyingSettlement}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black shadow-md ${decision === 'reject'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : decision === 'approve_partial'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                >
                  {isVerifyingSettlement ? 'Processing...' : 'Confirm Decision'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payout Screenshot Lightbox Modal */}
      <AnimatePresence>
        {activeReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 flex flex-col items-center"
            >
              <button
                onClick={() => setActiveReceipt(null)}
                className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-slate-900 mb-4 text-center">Bank Transfer Receipt</h3>

              <div className="w-full h-80 sm:h-96 bg-slate-50 rounded-2xl border p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={activeReceipt}
                  alt="Technician Bank Transfer Receipt"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suspend Reason Confirmation Modal */}
      <AnimatePresence>
        {showSuspendModal && selectedTechToSuspend && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 flex flex-col space-y-6"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>

              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Suspend Profile</h3>

                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 text-left space-y-1 text-xs">
                  <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Platform Due Analytics</p>
                  <p className="font-extrabold text-amber-900">
                    Outstanding Balance: <span className="text-slate-900 font-black">₹{selectedTechToSuspend.outstandingDues || 0}</span>
                  </p>
                  <p className="font-bold text-amber-800">
                    Unpaid Duration: <span className="underline font-black text-amber-900">{formatUnpaidDuration(selectedTechToSuspend.lastPaymentDate, selectedTechToSuspend.createdAt)}</span>
                  </p>
                </div>

                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Provide a reason for suspending <span className="font-bold text-slate-700">{selectedTechToSuspend.userId?.name}</span>. This will be shown on their dashboard.
                </p>
              </div>

              <div className="text-left space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suspension Reason</label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g., Outstanding platform dues unpaid."
                  className="w-full min-h-[80px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={confirmSuspend}
                  disabled={isSuspending}
                  className="h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/10 text-xs"
                >
                  {isSuspending ? 'Suspending...' : 'Confirm Suspension'}
                </Button>
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSelectedTechToSuspend(null);
                  }}
                  className="h-10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
