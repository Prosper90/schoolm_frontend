"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Loading";
import { paymentsApi } from "@/lib/services/payments";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Payment } from "@/types";

function PaymentDetailContent() {
  const params = useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      if (!params.id) return;
      setIsLoading(true);
      try {
        const response = await paymentsApi.getById(params.id as string);
        if (response?.data) setPayment(response.data as Payment);
      } catch (error) {
        console.error("Failed to fetch payment:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayment();
  }, [params.id]);

  if (isLoading) {
    return <DashboardLayout><PageLoading message="Loading payment details..." /></DashboardLayout>;
  }

  if (!payment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Payment not found</h2>
          <Link href="/payments"><Button className="mt-4">Back to Payments</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Payment Receipt"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payments", href: "/payments" }, { label: payment.receiptNumber || "Detail" }]}
        actions={
          <Link href="/payments"><Button variant="outline">Back to Payments</Button></Link>
        }
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
              {payment.receiptNumber && <p className="text-gray-500 font-mono mt-1">{payment.receiptNumber}</p>}
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-4xl font-bold text-green-600 mt-1">{formatCurrency(payment.amount)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Student</span>
                <span className="font-medium">{payment.student?.user?.firstName} {payment.student?.user?.lastName}</span>
              </div>
              {payment.student?.admissionNumber && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Admission No.</span>
                  <span className="font-medium">{payment.student.admissionNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Payment Method</span>
                <Badge variant="secondary">{payment.paymentMethod || "N/A"}</Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Term</span>
                <span className="font-medium">{payment.term || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Academic Year</span>
                <span className="font-medium">{payment.academicYear || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{formatDate(payment.createdAt)}</span>
              </div>
              {payment.notes && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Notes</span>
                  <span className="font-medium text-right max-w-xs">{payment.notes}</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => window.print()}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function PaymentDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT", "SECRETARY"]}>
      <PaymentDetailContent />
    </ProtectedRoute>
  );
}
