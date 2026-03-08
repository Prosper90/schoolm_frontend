"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { PageLoading } from "@/components/ui/Loading";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { studentsApi } from "@/lib/services/students";
import { paymentsApi } from "@/lib/services/payments";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Student, Payment } from "@/types";

function StudentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      setIsLoading(true);
      try {
        const [studentRes, paymentsRes] = await Promise.all([
          studentsApi.getById(params.id as string),
          paymentsApi.getStudentHistory(params.id as string).catch(() => null),
        ]);
        if (studentRes?.data) {
          setStudent(studentRes.data as Student);
        }
        if (paymentsRes?.data) {
          const paymentData = paymentsRes.data as any;
          setPayments(paymentData.payments || paymentData || []);
        }
      } catch (error) {
        console.error("Failed to fetch student:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSuspend = async () => {
    if (!student) return;
    try {
      if (student.isSuspended) {
        await studentsApi.activate(student.id);
      } else {
        await studentsApi.suspend(student.id);
      }
      const res = await studentsApi.getById(student.id);
      if (res?.data) setStudent(res.data as Student);
    } catch (error) {
      console.error("Failed to update student status:", error);
    }
    setShowSuspendModal(false);
  };

  const handleDelete = async () => {
    if (!student) return;
    try {
      await studentsApi.delete(student.id);
      router.push("/students");
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading message="Loading student details..." />
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Student not found</h2>
          <Link href="/students">
            <Button className="mt-4">Back to Students</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = (student.totalFeesRequired || 0) - totalPaid;

  return (
    <DashboardLayout>
      <PageHeader
        title="Student Details"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students", href: "/students" },
          { label: `${student.user?.firstName} ${student.user?.lastName}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/students/${student.id}/edit`}>
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
            </Link>
            <Button variant={student.isSuspended ? "success" : "warning"} onClick={() => setShowSuspendModal(true)}>
              {student.isSuspended ? "Activate" : "Suspend"}
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar fallback={`${student.user?.firstName} ${student.user?.lastName}`} size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{student.user?.firstName} {student.user?.lastName}</h2>
                    {student.isSuspended ? (
                      <Badge variant="danger">Suspended</Badge>
                    ) : student.user?.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="warning">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1">{student.admissionNumber}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="primary">{student.class?.name || "Unassigned"}</Badge>
                    {student.rollNumber && <span className="text-sm text-gray-500">Roll No: {student.rollNumber}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{student.user?.email || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{student.user?.phone || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Date of Birth</p><p className="font-medium">{student.dateOfBirth ? formatDate(student.dateOfBirth) : "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Gender</p><p className="font-medium">{student.gender || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Blood Group</p><p className="font-medium">{student.bloodGroup || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Religion</p><p className="font-medium">{student.religion || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Category</p><p className="font-medium">{student.category || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Joined Date</p><p className="font-medium">{formatDate(student.createdAt)}</p></div>
              </div>
              {student.address && (
                <div className="mt-6"><p className="text-sm text-gray-500">Address</p><p className="font-medium">{student.address}</p></div>
              )}
            </CardContent>
          </Card>

          {student.guardian && (
            <Card>
              <CardHeader><CardTitle>Guardian Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{student.guardian.firstName} {student.guardian.lastName}</p></div>
                  <div><p className="text-sm text-gray-500">Relationship</p><p className="font-medium">{student.guardian.relationship}</p></div>
                  <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{student.guardian.phone}</p></div>
                  <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{student.guardian.email || "N/A"}</p></div>
                  <div><p className="text-sm text-gray-500">Occupation</p><p className="font-medium">{student.guardian.occupation || "N/A"}</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-500">Total Fees</span><span className="font-semibold">{formatCurrency(student.totalFeesRequired || 0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Paid</span><span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span></div>
                <div className="border-t pt-4 flex justify-between"><span className="text-gray-500">Balance</span><span className={`font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>{formatCurrency(balance)}</span></div>
              </div>
              <Link href={`/payments/record?studentId=${student.id}`}>
                <Button className="w-full mt-4">Record Payment</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href={`/payments?studentId=${student.id}`} className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Payment History
                </Link>
                <Link href={`/attendance?studentId=${student.id}`} className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  Attendance Records
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showSuspendModal} onClose={() => setShowSuspendModal(false)} title={student.isSuspended ? "Activate Student" : "Suspend Student"}>
        <p className="text-gray-600">{student.isSuspended ? `Are you sure you want to activate ${student.user?.firstName} ${student.user?.lastName}?` : `Are you sure you want to suspend ${student.user?.firstName} ${student.user?.lastName}? They will not be able to access the system.`}</p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSuspendModal(false)}>Cancel</Button>
          <Button variant={student.isSuspended ? "success" : "warning"} onClick={handleSuspend}>{student.isSuspended ? "Activate" : "Suspend"}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Student">
        <p className="text-gray-600">Are you sure you want to delete {student.user?.firstName} {student.user?.lastName}? This action cannot be undone.</p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function StudentDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "SECRETARY"]}>
      <StudentDetailContent />
    </ProtectedRoute>
  );
}
