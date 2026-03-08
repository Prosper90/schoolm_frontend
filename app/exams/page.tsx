"use client";

import { useEffect, useState } from "react";
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
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { examsApi } from "@/lib/services/exams";
import { classesApi } from "@/lib/services/classes";
import { formatDate } from "@/lib/utils";
import { Exam, Class, ExamFormData } from "@/types";

function ExamsContent() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termFilter, setTermFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([{ value: "", label: "All Classes" }]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [formData, setFormData] = useState<ExamFormData>({ name: "", term: "", academicYear: new Date().getFullYear().toString(), startDate: "", endDate: "", classId: "" });

  const termOptions = [{ value: "", label: "All Terms" }, { value: "Term 1", label: "Term 1" }, { value: "Term 2", label: "Term 2" }, { value: "Term 3", label: "Term 3" }];
  const termOptionsForForm = [{ value: "", label: "Select Term" }, { value: "Term 1", label: "Term 1" }, { value: "Term 2", label: "Term 2" }, { value: "Term 3", label: "Term 3" }];

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await classesApi.getAll({ limit: 100 });
        if (response?.data?.classes) {
          setClassOptions([
            { value: "", label: "All Classes" },
            ...response.data.classes.map((cls: Class) => ({ value: cls.id, label: cls.name + (cls.section ? ` - ${cls.section}` : "") })),
          ]);
        }
      } catch (error) { console.error("Failed to fetch classes:", error); }
    };
    loadClasses();
  }, []);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const response = await examsApi.getAll({
        page: pagination.page, limit: pagination.limit,
        term: termFilter || undefined, academicYear: yearFilter || undefined, classId: classFilter || undefined,
      });
      if (response?.data) {
        setExams(response.data.exams || []);
        setPagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) { console.error("Failed to fetch exams:", error); setExams([]); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchExams(); }, [pagination.page, termFilter, yearFilter, classFilter]);

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({ name: "", term: "", academicYear: new Date().getFullYear().toString(), startDate: "", endDate: "", classId: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({ name: exam.name, term: exam.term, academicYear: exam.academicYear, startDate: exam.startDate || "", endDate: exam.endDate || "", classId: exam.classId || "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.term || !formData.academicYear) return;
    setIsSubmitting(true);
    setError("");
    try {
      if (editingExam) {
        await examsApi.update(editingExam.id, formData);
      } else {
        await examsApi.create(formData);
      }
      setShowModal(false);
      fetchExams();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to save exam");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try { await examsApi.delete(id); fetchExams(); } catch (error) { console.error("Failed to delete exam:", error); }
  };

  if (isLoading && exams.length === 0) {
    return <DashboardLayout><PageLoading message="Loading exams..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Exams"
        description="Manage examinations and results"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exams" }]}
        actions={<Button onClick={openAddModal}><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Exam</Button>}
      />

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select options={termOptions} value={termFilter} onChange={(e) => setTermFilter(e.target.value)} />
            <Input placeholder="Year (e.g., 2024)" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} />
            <Select options={classOptions} value={classFilter} onChange={(e) => setClassFilter(e.target.value)} />
            <Button variant="outline" onClick={() => { setTermFilter(""); setYearFilter(""); setClassFilter(""); }}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {exams.length === 0 && !isLoading ? (
            <EmptyState icon={<NoDataIcon />} title="No exams found" description="Create your first examination" action={<Button onClick={openAddModal}>Add Exam</Button>} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell><span className="font-medium">{exam.name}</span></TableCell>
                      <TableCell><Badge variant="primary">{exam.term}</Badge></TableCell>
                      <TableCell>{exam.academicYear}</TableCell>
                      <TableCell>{exam.class?.name || "All Classes"}</TableCell>
                      <TableCell>{exam.startDate ? formatDate(exam.startDate) : "N/A"}</TableCell>
                      <TableCell>{exam.endDate ? formatDate(exam.endDate) : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(exam)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(exam.id)}>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingExam ? "Edit Exam" : "Add Exam"} size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Input label="Exam Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required placeholder="e.g., Mid-Term Examination" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Term" options={termOptionsForForm} value={formData.term} onChange={(e) => setFormData((prev) => ({ ...prev, term: e.target.value }))} required />
            <Input label="Academic Year" value={formData.academicYear} onChange={(e) => setFormData((prev) => ({ ...prev, academicYear: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))} />
          </div>
          <Select label="Class (Optional)" options={classOptions} value={formData.classId || ""} onChange={(e) => setFormData((prev) => ({ ...prev, classId: e.target.value }))} />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.term} isLoading={isSubmitting}>{editingExam ? "Update" : "Add"} Exam</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function ExamsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <ExamsContent />
    </ProtectedRoute>
  );
}
