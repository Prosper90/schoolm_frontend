"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoading } from "@/components/ui/Loading";
import { EmptyState, NoDataIcon } from "@/components/ui/EmptyState";
import { StatsCard } from "@/components/ui/StatsCard";
import { paymentsApi } from "@/lib/services/payments";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Payment } from "@/types";

function PaymentsContent() {
  const searchParams = useSearchParams();
  const studentIdFilter = searchParams.get("studentId") || "";

  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [summary, setSummary] = useState({ totalAmount: 0, totalTransactions: 0 });

  const paymentMethods = [
    { value: "", label: "All Methods" },
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Mobile Money", label: "Mobile Money" },
    { value: "Cheque", label: "Cheque" },
  ];

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await paymentsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        studentId: studentIdFilter || undefined,
        paymentMethod: paymentMethod || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (response?.data) {
        setPayments(response.data.payments || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.pagination?.total || 0,
          pages: response.data?.pagination?.pages || 0,
        }));
        setSummary({
          totalAmount: response.data.summary?.totalAmount || 0,
          totalTransactions: response.data?.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, startDate, endDate, paymentMethod, studentIdFilter]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  if (isLoading && payments.length === 0) {
    return (
      <DashboardLayout>
        <PageLoading message="Loading payments..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Payments"
        description="Manage fee payments and financial records"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payments" }]}
        actions={
          <Link href="/payments/record">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Record Payment
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatsCard
          title="Total Collected"
          value={formatCurrency(summary.totalAmount)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green"
        />
        <StatsCard
          title="Total Transactions"
          value={summary.totalTransactions}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          color="blue"
        />
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Select label="Payment Method" options={paymentMethods} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); setPaymentMethod(""); }}>Clear Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 && !isLoading ? (
            <EmptyState icon={<NoDataIcon />} title="No payments found" description="No payment records match your criteria" action={<Link href="/payments/record"><Button>Record Payment</Button></Link>} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No.</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell><span className="font-mono text-sm">{payment.receiptNumber || "N/A"}</span></TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{payment.student?.user?.firstName} {payment.student?.user?.lastName}</p>
                          <p className="text-sm text-gray-500">{payment.student?.admissionNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-semibold text-green-600">{formatCurrency(payment.amount)}</span></TableCell>
                      <TableCell><Badge variant="secondary">{payment.paymentMethod || "N/A"}</Badge></TableCell>
                      <TableCell>{payment.term || "N/A"}</TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/payments/${payment.id}`}>
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function PaymentsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT", "SECRETARY"]}>
      <PaymentsContent />
    </ProtectedRoute>
  );
}
