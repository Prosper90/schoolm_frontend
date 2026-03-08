"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoading } from "@/components/ui/Loading";
import { EmptyState, NoDataIcon } from "@/components/ui/EmptyState";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { subjectsApi } from "@/lib/services/subjects";
import { debounce } from "@/lib/utils";
import { Subject } from "@/types";

function SubjectsContent() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });

  const fetchSubjects = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const response = await subjectsApi.getAll({ page: pagination.page, limit: pagination.limit, search: searchTerm || undefined });
      if (response?.data) {
        setSubjects(response.data.subjects || []);
        setPagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, [pagination.page]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchSubjects(search);
    }, 300);
    debouncedSearch();
  }, [search]);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({ name: "", code: "", description: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, code: subject.code || "", description: subject.description || "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) return;
    setIsSubmitting(true);
    setError("");
    try {
      if (editingSubject) {
        await subjectsApi.update(editingSubject.id, { name: formData.name, code: formData.code, description: formData.description || undefined, level: "" });
      } else {
        await subjectsApi.create({ name: formData.name, code: formData.code, description: formData.description || undefined, level: "" });
      }
      setShowModal(false);
      fetchSubjects(search);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      await subjectsApi.delete(id);
      fetchSubjects(search);
    } catch (error) {
      console.error("Failed to delete subject:", error);
    }
  };

  if (isLoading && subjects.length === 0) {
    return <DashboardLayout><PageLoading message="Loading subjects..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Subjects"
        description="Manage school subjects"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subjects" }]}
        actions={<Button onClick={openAddModal}><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Subject</Button>}
      />

      <Card className="mb-6">
        <CardContent className="py-4">
          <Input placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {subjects.length === 0 && !isLoading ? (
            <EmptyState icon={<NoDataIcon />} title="No subjects found" description="Get started by adding your first subject" action={<Button onClick={openAddModal}>Add Subject</Button>} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell><span className="font-medium">{subject.name}</span></TableCell>
                      <TableCell><span className="font-mono text-sm">{subject.code || "N/A"}</span></TableCell>
                      <TableCell><span className="text-gray-500 text-sm">{subject.description || "N/A"}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(subject)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(subject.id)}>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSubject ? "Edit Subject" : "Add Subject"} size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Input label="Subject Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
          <Input label="Subject Code" value={formData.code} onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))} placeholder="e.g., MATH, ENG" required />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.code} isLoading={isSubmitting}>{editingSubject ? "Update" : "Add"} Subject</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function SubjectsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <SubjectsContent />
    </ProtectedRoute>
  );
}
