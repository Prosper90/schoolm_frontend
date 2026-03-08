"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { studentsApi } from "@/lib/services/students";
import { paymentsApi } from "@/lib/services/payments";
import { classesApi } from "@/lib/services/classes";
import { staffApi } from "@/lib/services/staff";
import { Student, Payment, Class } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const StudentsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TeachersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const ClassesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SubjectsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

// Helper to check roles
const isAdmin = (role?: string) => role === "SUPER_ADMIN" || role === "SCHOOL_ADMIN";
const isFinanceRole = (role?: string) => isAdmin(role) || role === "ACCOUNTANT";
const isAcademicRole = (role?: string) => isAdmin(role) || role === "TEACHER" || role === "SECRETARY";

function DashboardContent() {
  const { user } = useAuthStore();
  const role = user?.role;
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
  });
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [classChartData, setClassChartData] = useState<{ name: string; students: number; capacity: number }[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [feeCollectionData, setFeeCollectionData] = useState<{ name: string; collected: number; pending: number }[]>([]);
  // Student-specific
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (role === "STUDENT") {
          // Student dashboard: load own profile and payment history
          const profileRes = await import("@/lib/auth").then((m) => m.authApi.getProfile()).catch(() => null);
          if (profileRes) {
            setStudentProfile(profileRes);
            const studentId = (profileRes as any)?.student?.id;
            if (studentId) {
              const historyRes = await paymentsApi.getStudentHistory(studentId).catch(() => null);
              if (historyRes?.data) {
                const data = historyRes.data as any;
                setStudentPayments(data.payments || []);
                setStats({
                  totalStudents: 0,
                  totalTeachers: 0,
                  totalClasses: 0,
                  totalRevenue: data.financialSummary?.totalPaid || 0,
                });
              }
            }
          }
        } else {
          // Staff/admin dashboard
          const promises: Promise<any>[] = [];

          // Everyone who can access students
          if (isAcademicRole(role)) {
            promises.push(studentsApi.getAll({ page: 1, limit: 5 }).catch(() => null));
            promises.push(classesApi.getAll({ page: 1, limit: 100 }).catch(() => null));
            promises.push(staffApi.getAll({ role: "TEACHER", page: 1, limit: 1 }).catch(() => null));
          } else {
            promises.push(Promise.resolve(null), Promise.resolve(null), Promise.resolve(null));
          }

          // Finance data
          if (isFinanceRole(role)) {
            promises.push(paymentsApi.getAll({ page: 1, limit: 5 }).catch(() => null));
            promises.push(paymentsApi.getReport({}).catch(() => null));
          } else {
            promises.push(Promise.resolve(null), Promise.resolve(null));
          }

          const [studentsRes, classesRes, staffRes, paymentsRes, paymentReportRes] = await Promise.all(promises);

          setStats({
            totalStudents: studentsRes?.data?.pagination?.total || 0,
            totalTeachers: staffRes?.data?.pagination?.total || 0,
            totalClasses: classesRes?.data?.pagination?.total || 0,
            totalRevenue: paymentsRes?.data?.summary?.totalAmount || 0,
          });

          if (studentsRes?.data?.students) {
            setRecentStudents(studentsRes.data.students.slice(0, 5));
          }
          if (paymentsRes?.data?.payments) {
            setRecentPayments(paymentsRes.data.payments.slice(0, 5));
          }

          // Class enrollment chart data
          if (classesRes?.data?.classes) {
            const classes = classesRes.data.classes as Class[];
            setClassChartData(
              classes.slice(0, 10).map((c) => ({
                name: c.name,
                students: c._count?.students || 0,
                capacity: c.capacity || 0,
              }))
            );

            setFeeCollectionData(
              classes.slice(0, 8).map((c) => {
                const totalExpected = (c._count?.students || 0) * Number(c.feesAmount || 0);
                return { name: c.name, collected: 0, pending: totalExpected };
              })
            );
          }

          // Payment breakdown from report (admin/accountant only)
          if (paymentReportRes?.data) {
            const report = paymentReportRes.data as any;
            if (report.summary?.byPaymentMethod) {
              setPaymentMethodData(
                report.summary.byPaymentMethod.map((pm: any) => ({
                  name: pm.method,
                  value: Number(pm.amount) || 0,
                }))
              );
            }
            if (report.studentsWithOutstanding && classesRes?.data?.classes) {
              const classes = classesRes.data.classes as Class[];
              const classMap = new Map<string, { collected: number; total: number }>();
              classes.forEach((c) => {
                const totalExpected = (c._count?.students || 0) * Number(c.feesAmount || 0);
                classMap.set(c.name, { collected: 0, total: totalExpected });
              });
              report.studentsWithOutstanding.forEach((s: any) => {
                if (s.class && classMap.has(s.class)) {
                  const entry = classMap.get(s.class)!;
                  entry.collected += s.totalPaid || 0;
                }
              });
              setFeeCollectionData(
                Array.from(classMap.entries()).slice(0, 8).map(([name, data]) => ({
                  name,
                  collected: data.collected,
                  pending: Math.max(0, data.total - data.collected),
                }))
              );
            }
          }

          // Monthly revenue
          if (paymentsRes?.data?.payments) {
            const allPayments = paymentsRes.data.payments || [];
            const monthMap = new Map<string, number>();
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              monthMap.set(`${months[d.getMonth()]} ${d.getFullYear()}`, 0);
            }
            allPayments.forEach((p: any) => {
              const d = new Date(p.createdAt);
              const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
              if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) || 0) + Number(p.amount || 0));
            });
            setMonthlyRevenueData(Array.from(monthMap.entries()).map(([month, revenue]) => ({ month, revenue })));
          }
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [role]);

  if (isLoading) {
    return <DashboardLayout><PageLoading message="Loading dashboard..." /></DashboardLayout>;
  }

  // =================== STUDENT DASHBOARD ===================
  if (role === "STUDENT") {
    const student = (studentProfile as any)?.student;
    const className = student?.class?.name || "N/A";
    const totalFees = Number(student?.class?.feesAmount || 0);
    const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const balance = totalFees - totalPaid;

    return (
      <DashboardLayout>
        <PageHeader
          title="My Dashboard"
          description={`Welcome back, ${user?.firstName}! Here's your academic overview.`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="My Class" value={className} icon={<ClassesIcon />} color="blue" />
          <StatsCard title="Total Fees" value={formatCurrency(totalFees)} icon={<RevenueIcon />} color="purple" />
          <StatsCard title="Paid" value={formatCurrency(totalPaid)} icon={<RevenueIcon />} color="green" />
          <StatsCard title="Balance" value={formatCurrency(balance)} icon={<RevenueIcon />} color={balance > 0 ? "red" : "green"} />
        </div>

        {/* Fee Progress */}
        {totalFees > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Fee Payment Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{Math.round((totalPaid / totalFees) * 100)}%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min((totalPaid / totalFees) * 100, 100)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Paid: {formatCurrency(totalPaid)}</span>
                <span>Remaining: {formatCurrency(balance)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader><CardTitle>My Payment History</CardTitle></CardHeader>
          <CardContent>
            {studentPayments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No payments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {studentPayments.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{p.term || "Payment"}</p>
                      <p className="text-xs text-gray-500">{formatDate(p.createdAt)} - {p.paymentMethod}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // =================== STAFF/ADMIN DASHBOARD ===================
  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.firstName}! Here's what's happening today.`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAcademicRole(role) && (
          <>
            <StatsCard title="Total Students" value={stats.totalStudents} icon={<StudentsIcon />} color="blue" />
            <StatsCard title="Total Teachers" value={stats.totalTeachers} icon={<TeachersIcon />} color="green" />
            <StatsCard title="Total Classes" value={stats.totalClasses} icon={<ClassesIcon />} color="purple" />
          </>
        )}
        {isFinanceRole(role) && (
          <StatsCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<RevenueIcon />} color="cyan" />
        )}
      </div>

      {/* Finance Charts - Admin & Accountant only */}
      {isFinanceRole(role) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              {monthlyRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyRevenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                    <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">No payment data available yet</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
            <CardContent>
              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {paymentMethodData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => formatCurrency(value ?? 0)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">No payment data yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Academic Charts - Admin, Teacher, Secretary */}
      {isAcademicRole(role) && (
        <div className={`grid grid-cols-1 ${isFinanceRole(role) ? "lg:grid-cols-2" : "lg:grid-cols-2"} gap-6 mb-6`}>
          <Card>
            <CardHeader><CardTitle>Students per Class</CardTitle></CardHeader>
            <CardContent>
              {classChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#3b82f6" name="Enrolled" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">No class data yet</div>
              )}
            </CardContent>
          </Card>

          {isFinanceRole(role) ? (
            <Card>
              <CardHeader><CardTitle>Fee Collection by Class</CardTitle></CardHeader>
              <CardContent>
                {feeCollectionData.length > 0 && feeCollectionData.some((d) => d.collected > 0 || d.pending > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={feeCollectionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                      <Tooltip formatter={(value: number | undefined) => formatCurrency(value ?? 0)} />
                      <Legend />
                      <Bar dataKey="collected" stackId="a" fill="#10b981" name="Collected" />
                      <Bar dataKey="pending" stackId="a" fill="#fbbf24" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">No fee collection data yet</div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>Class Capacity Overview</CardTitle></CardHeader>
              <CardContent>
                {classChartData.length > 0 ? (
                  <div className="space-y-4">
                    {classChartData.map((cls) => {
                      const pct = cls.capacity > 0 ? Math.round((cls.students / cls.capacity) * 100) : 0;
                      return (
                        <div key={cls.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{cls.name}</span>
                            <span className="text-gray-500">{cls.students}/{cls.capacity} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-blue-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">No class data yet</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAcademicRole(role) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Students</CardTitle>
              <Link href="/students"><Button variant="ghost" size="sm">View All</Button></Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No students yet</p>
                ) : (
                  recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">{student.user?.firstName?.[0]}{student.user?.lastName?.[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.user?.firstName} {student.user?.lastName}</p>
                          <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="primary" size="sm">{student.class?.name || "Unassigned"}</Badge>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(student.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {isFinanceRole(role) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Link href="/payments"><Button variant="ghost" size="sm">View All</Button></Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No payments yet</p>
                ) : (
                  recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payment.student?.user?.firstName} {payment.student?.user?.lastName}</p>
                          <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isAcademicRole(role) && (
              <Link href="/students/add">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  <span className="text-sm">Add Student</span>
                </Button>
              </Link>
            )}
            {isFinanceRole(role) && (
              <Link href="/payments/record">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span className="text-sm">Record Payment</span>
                </Button>
              </Link>
            )}
            <Link href="/attendance">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <span className="text-sm">Mark Attendance</span>
              </Button>
            </Link>
            <Link href="/exams">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-sm">{role === "TEACHER" ? "Enter Results" : "View Exams"}</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
