"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoading } from "@/components/ui/Loading";
import { EmptyState, NoDataIcon } from "@/components/ui/EmptyState";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { departmentsApi } from "@/lib/services/departments";
import { debounce } from "@/lib/utils";
import { Department, DepartmentFormData } from "@/types";

function DepartmentsContent() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [formData, setFormData] = useState<DepartmentFormData>({ name: "", code: "", description: "" });

  const fetchDepartments = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const response = await departmentsApi.getAll({ page: pagination.page, limit: pagination.limit, search: searchTerm || undefined });
      if (response?.data) {
        setDepartments(response.data.departments || []);
        setPagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) { console.error("Failed to fetch departments:", error); setDepartments([]); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDepartments(); }, [pagination.page]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchDepartments(search);
    }, 300);
    debouncedSearch();
  }, [search]);

  const openAddModal = () => {
    setEditingDepartment(null);
    setFormData({ name: "", code: "", description: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({ name: dept.name, code: "", description: dept.description || "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    setError("");
    try {
      if (editingDepartment) {
        await departmentsApi.update(editingDepartment.id, formData);
      } else {
        await departmentsApi.create(formData);
      }
      setShowModal(false);
      fetchDepartments(search);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to save department");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try { await departmentsApi.delete(id); fetchDepartments(search); } catch (error) { console.error("Failed to delete department:", error); }
  };

  if (isLoading && departments.length === 0) {
    return <DashboardLayout><PageLoading message="Loading departments..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Departments"
        description="Manage school departments"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Departments" }]}
        actions={<Button onClick={openAddModal}><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Department</Button>}
      />

      <Card className="mb-6">
        <CardContent className="py-4">
          <Input placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {departments.length === 0 && !isLoading ? (
            <EmptyState icon={<NoDataIcon />} title="No departments found" description="Create your first department" action={<Button onClick={openAddModal}>Add Department</Button>} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell><span className="font-medium">{dept.name}</span></TableCell>
                      <TableCell><span className="text-gray-500 text-sm">{dept.description || "N/A"}</span></TableCell>
                      <TableCell><Badge variant="primary">{dept._count?.staff || 0}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(dept)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingDepartment ? "Edit Department" : "Add Department"} size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Input label="Department Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required placeholder="e.g., Science, Languages" />
          <Input label="Code" value={formData.code} onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))} placeholder="e.g., SCI, LANG" />
          <Textarea label="Description" value={formData.description || ""} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.name} isLoading={isSubmitting}>{editingDepartment ? "Update" : "Add"} Department</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function DepartmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <DepartmentsContent />
    </ProtectedRoute>
  );
}
