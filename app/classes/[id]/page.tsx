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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { PageLoading } from "@/components/ui/Loading";
import { EmptyState, NoDataIcon } from "@/components/ui/EmptyState";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { classesApi } from "@/lib/services/classes";
import { formatCurrency } from "@/lib/utils";

function ClassDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [classData, setClassData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState({ name: "", capacity: "", feesAmount: "", stream: "" });

  useEffect(() => {
    const fetchClass = async () => {
      setIsLoading(true);
      try {
        const response = await classesApi.getById(id);
        if (response?.data) {
          setClassData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch class:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  const openEditModal = () => {
    if (!classData) return;
    setEditForm({
      name: classData.name || "",
      capacity: classData.capacity?.toString() || "",
      feesAmount: classData.feesAmount?.toString() || "",
      stream: classData.stream || "",
    });
    setError("");
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await classesApi.update(id, {
        name: editForm.name,
        capacity: editForm.capacity ? Number(editForm.capacity) : undefined,
        feesAmount: editForm.feesAmount ? Number(editForm.feesAmount) : undefined,
        stream: editForm.stream || undefined,
      });
      setShowEditModal(false);
      const response = await classesApi.getById(id);
      if (response?.data) setClassData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update class");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await classesApi.delete(id);
      router.push("/classes");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to delete class");
      setShowDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <DashboardLayout><PageLoading message="Loading class details..." /></DashboardLayout>;
  }

  if (!classData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Class not found</h2>
          <p className="text-gray-500 mb-4">The class you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/classes"><Button>Back to Classes</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  const studentCount = classData._count?.students || classData.students?.length || 0;
  const subjectCount = classData._count?.subjects || classData.subjects?.length || 0;
  const capacityPercent = classData.capacity ? Math.round((studentCount / classData.capacity) * 100) : 0;

  return (
    <DashboardLayout>
      <PageHeader
        title={classData.name}
        description={`${classData.level} - Grade ${classData.grade}${classData.stream ? ` (Stream ${classData.stream})` : ""}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Classes", href: "/classes" },
          { label: classData.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openEditModal}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete
            </Button>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{studentCount}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{subjectCount}</p>
              <p className="text-sm text-gray-500">Subjects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(Number(classData.feesAmount) || 0)}</p>
              <p className="text-sm text-gray-500">Fees Amount</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{capacityPercent}%</p>
              <p className="text-sm text-gray-500">Capacity ({studentCount}/{classData.capacity || "N/A"})</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Class Info */}
        <Card>
          <CardHeader><CardTitle>Class Information</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-gray-500">Level</span><Badge variant="primary">{classData.level}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Grade</span><span className="font-medium">{classData.grade}</span></div>
              {classData.stream && <div className="flex justify-between"><span className="text-sm text-gray-500">Stream</span><span className="font-medium">{classData.stream}</span></div>}
              <div className="flex justify-between"><span className="text-sm text-gray-500">Capacity</span><span className="font-medium">{classData.capacity || "N/A"}</span></div>
              {classData.classTeacher && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Class Teacher</span>
                  <span className="font-medium">{classData.classTeacher.user?.firstName} {classData.classTeacher.user?.lastName}</span>
                </div>
              )}
              {classData.school && (
                <div className="flex justify-between"><span className="text-sm text-gray-500">School</span><span className="font-medium">{classData.school.name}</span></div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subjects ({subjectCount})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {classData.subjects && classData.subjects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classData.subjects.map((cs: any) => (
                    <TableRow key={cs.id}>
                      <TableCell><span className="font-medium">{cs.subject?.name || "N/A"}</span></TableCell>
                      <TableCell>{cs.teacher ? `${cs.teacher.user?.firstName} ${cs.teacher.user?.lastName}` : "Not assigned"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">
                No subjects assigned to this class yet.{" "}
                <Link href="/subjects" className="text-blue-600 hover:underline">Manage subjects</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Students ({studentCount})</CardTitle>
          <Link href="/students/add"><Button size="sm">Add Student</Button></Link>
        </CardHeader>
        <CardContent className="p-0">
          {classData.students && classData.students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classData.students.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell><span className="font-medium">{student.user?.firstName} {student.user?.lastName}</span></TableCell>
                    <TableCell>{student.admissionNumber || "N/A"}</TableCell>
                    <TableCell>{student.user?.email || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Link href={`/students/${student.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={<NoDataIcon />}
              title="No students in this class"
              description="Students will appear here once enrolled"
              action={<Link href="/students/add"><Button size="sm">Add Student</Button></Link>}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Class" size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Input label="Class Name" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stream" value={editForm.stream} onChange={(e) => setEditForm((prev) => ({ ...prev, stream: e.target.value }))} placeholder="e.g., A, B" />
            <Input label="Capacity" type="number" value={editForm.capacity} onChange={(e) => setEditForm((prev) => ({ ...prev, capacity: e.target.value }))} />
          </div>
          <Input label="Fees Amount (UGX)" type="number" value={editForm.feesAmount} onChange={(e) => setEditForm((prev) => ({ ...prev, feesAmount: e.target.value }))} required />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={!editForm.name} isLoading={isSubmitting}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Class" size="sm">
        <p className="text-gray-600">Are you sure you want to delete <strong>{classData.name}</strong>? This action cannot be undone.</p>
        {studentCount > 0 && (
          <Alert variant="warning" className="mt-4">This class has {studentCount} enrolled students. You must remove all students before deleting.</Alert>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={studentCount > 0} isLoading={isSubmitting}>Delete Class</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function ClassDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "SECRETARY"]}>
      <ClassDetailContent />
    </ProtectedRoute>
  );
}
