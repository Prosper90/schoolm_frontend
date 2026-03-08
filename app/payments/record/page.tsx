"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { paymentsApi } from "@/lib/services/payments";
import { studentsApi } from "@/lib/services/students";
import { formatCurrency } from "@/lib/utils";
import { PaymentFormData, Student } from "@/types";

function RecordPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentOptions, setStudentOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Select Student" },
  ]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    studentId: preselectedStudentId,
    amount: 0,
    paymentMethod: "Cash",
    term: "",
    academicYear: new Date().getFullYear().toString(),
    notes: "",
  });

  const paymentMethods = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Mobile Money", label: "Mobile Money" },
    { value: "Cheque", label: "Cheque" },
  ];

  const terms = [
    { value: "", label: "Select Term" },
    { value: "Term 1", label: "Term 1" },
    { value: "Term 2", label: "Term 2" },
    { value: "Term 3", label: "Term 3" },
  ];

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await studentsApi.getAll({ limit: 200 });
        if (response?.data?.students) {
          setStudentOptions([
            { value: "", label: "Select Student" },
            ...response.data.students.map((s: Student) => ({
              value: s.id,
              label: `${s.user?.firstName} ${s.user?.lastName} (${s.admissionNumber || "N/A"}) - ${s.class?.name || "N/A"}`,
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to load students:", error);
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    if (!formData.studentId) {
      setSelectedStudent(null);
      return;
    }
    const fetchStudentInfo = async () => {
      try {
        const [studentRes, paymentsRes] = await Promise.all([
          studentsApi.getById(formData.studentId),
          paymentsApi.getStudentHistory(formData.studentId).catch(() => null),
        ]);
        if (studentRes?.data) {
          const s = studentRes.data as Student;
          const paymentData = paymentsRes?.data as any;
          const paymentsList = paymentData?.payments || paymentData || [];
          const totalPaid = Array.isArray(paymentsList) ? paymentsList.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) : 0;
          setSelectedStudent({
            name: `${s.user?.firstName} ${s.user?.lastName}`,
            class: s.class?.name || "N/A",
            totalFees: s.totalFeesRequired || 0,
            totalPaid,
            balance: (s.totalFeesRequired || 0) - totalPaid,
          });
        }
      } catch (error) {
        console.error("Failed to fetch student info:", error);
      }
    };
    fetchStudentInfo();
  }, [formData.studentId]);

  const handleChange = (field: keyof PaymentFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = field === "amount" ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (!formData.studentId) throw new Error("Please select a student");
      if (!formData.amount || formData.amount <= 0) throw new Error("Please enter a valid amount");
      if (!formData.term) throw new Error("Please select a term");

      await paymentsApi.record(formData);
      router.push("/payments");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to record payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Record Payment"
        description="Record a new fee payment"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payments", href: "/payments" }, { label: "Record Payment" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {error && <Alert variant="danger" className="mb-6" onClose={() => setError("")}>{error}</Alert>}

            <Card className="mb-6">
              <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Select label="Student" options={studentOptions} value={formData.studentId} onChange={handleChange("studentId")} required />
                  </div>
                  <Input label="Amount (UGX)" type="number" value={formData.amount || ""} onChange={handleChange("amount")} min={0} required />
                  <Select label="Payment Method" options={paymentMethods} value={formData.paymentMethod} onChange={handleChange("paymentMethod")} />
                  <Select label="Term" options={terms} value={formData.term} onChange={handleChange("term")} required />
                  <Input label="Academic Year" value={formData.academicYear} onChange={handleChange("academicYear")} />
                  <div className="md:col-span-2">
                    <Textarea label="Notes" value={formData.notes} onChange={handleChange("notes")} placeholder="Any additional notes..." rows={3} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" isLoading={isLoading}>Record Payment</Button>
            </div>
          </form>
        </div>

        <div>
          {selectedStudent ? (
            <Card>
              <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{selectedStudent.name}</p></div>
                  <div><p className="text-sm text-gray-500">Class</p><p className="font-medium">{selectedStudent.class}</p></div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2"><span className="text-sm text-gray-500">Total Fees</span><span className="font-medium">{formatCurrency(selectedStudent.totalFees)}</span></div>
                    <div className="flex justify-between mb-2"><span className="text-sm text-gray-500">Paid</span><span className="font-medium text-green-600">{formatCurrency(selectedStudent.totalPaid)}</span></div>
                    <div className="flex justify-between pt-2 border-t"><span className="text-sm font-medium">Balance</span><span className="font-bold text-red-600">{formatCurrency(selectedStudent.balance)}</span></div>
                  </div>
                  {formData.amount > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">After this payment, balance will be: <span className="font-bold">{formatCurrency(selectedStudent.balance - formData.amount)}</span></p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <p>Select a student to view their fee information</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function RecordPaymentPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT", "SECRETARY"]}>
      <RecordPaymentContent />
    </ProtectedRoute>
  );
}
