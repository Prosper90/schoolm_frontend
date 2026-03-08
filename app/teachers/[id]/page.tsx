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
import { staffApi } from "@/lib/services/staff";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Staff } from "@/types";

function TeacherDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!params.id) return;
      setIsLoading(true);
      try {
        const response = await staffApi.getById(params.id as string);
        if (response?.data) {
          setTeacher(response.data as Staff);
        }
      } catch (error) {
        console.error("Failed to fetch teacher:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeacher();
  }, [params.id]);

  const handleToggleStatus = async () => {
    if (!teacher) return;
    try {
      await staffApi.toggleStatus(teacher.id);
      const res = await staffApi.getById(teacher.id);
      if (res?.data) setTeacher(res.data as Staff);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
    setShowStatusModal(false);
  };

  const handleDelete = async () => {
    if (!teacher) return;
    try {
      await staffApi.delete(teacher.id);
      router.push("/teachers");
    } catch (error) {
      console.error("Failed to delete teacher:", error);
    }
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return <DashboardLayout><PageLoading message="Loading teacher details..." /></DashboardLayout>;
  }

  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Teacher not found</h2>
          <Link href="/teachers"><Button className="mt-4">Back to Teachers</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  const isActive = teacher.user?.isActive;

  return (
    <DashboardLayout>
      <PageHeader
        title="Teacher Details"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Teachers", href: "/teachers" },
          { label: `${teacher.user?.firstName} ${teacher.user?.lastName}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant={isActive ? "warning" : "success"} onClick={() => setShowStatusModal(true)}>
              {isActive ? "Deactivate" : "Activate"}
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
                <Avatar fallback={`${teacher.user?.firstName} ${teacher.user?.lastName}`} size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{teacher.user?.firstName} {teacher.user?.lastName}</h2>
                    {isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1">{teacher.position || "Teacher"}</p>
                  <div className="flex items-center gap-4 mt-3">
                    {teacher.department && <Badge variant="primary">{teacher.department.name}</Badge>}
                    <Badge variant="secondary">TEACHER</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{teacher.user?.email || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{teacher.user?.phone || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Position</p><p className="font-medium">{teacher.position || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Department</p><p className="font-medium">{teacher.department?.name || "Not assigned"}</p></div>
                <div><p className="text-sm text-gray-500">Joining Date</p><p className="font-medium">{teacher.joiningDate ? formatDate(teacher.joiningDate) : formatDate(teacher.createdAt)}</p></div>
                <div><p className="text-sm text-gray-500">Salary</p><p className="font-medium">{teacher.salary ? formatCurrency(teacher.salary) : "N/A"}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Quick Info</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  {isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium">Teacher</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-medium">{teacher.joiningDate ? formatDate(teacher.joiningDate) : formatDate(teacher.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/teachers" className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  All Teachers
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title={isActive ? "Deactivate Teacher" : "Activate Teacher"}>
        <p className="text-gray-600">
          {isActive
            ? `Are you sure you want to deactivate ${teacher.user?.firstName} ${teacher.user?.lastName}? They will not be able to access the system.`
            : `Are you sure you want to activate ${teacher.user?.firstName} ${teacher.user?.lastName}?`}
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button variant={isActive ? "warning" : "success"} onClick={handleToggleStatus}>{isActive ? "Deactivate" : "Activate"}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Teacher">
        <p className="text-gray-600">Are you sure you want to delete {teacher.user?.firstName} {teacher.user?.lastName}? This action cannot be undone.</p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function TeacherDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "SECRETARY"]}>
      <TeacherDetailContent />
    </ProtectedRoute>
  );
}
