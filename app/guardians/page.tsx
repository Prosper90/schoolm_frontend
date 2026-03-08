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
import { guardiansApi } from "@/lib/services/guardians";
import { debounce } from "@/lib/utils";
import { Guardian, GuardianFormData } from "@/types";

function GuardiansContent() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [formData, setFormData] = useState<GuardianFormData>({ firstName: "", lastName: "", phone: "", relationship: "", email: "", occupation: "", address: "" });

  const relationshipOptions = ["Father", "Mother", "Guardian", "Uncle", "Aunt", "Grandparent", "Sibling", "Other"];

  const fetchGuardians = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const response = await guardiansApi.getAll({ page: pagination.page, limit: pagination.limit, search: searchTerm || undefined });
      if (response?.data) {
        setGuardians(response.data.guardians || []);
        setPagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) { console.error("Failed to fetch guardians:", error); setGuardians([]); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchGuardians(); }, [pagination.page]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchGuardians(search);
    }, 300);
    debouncedSearch();
  }, [search]);

  const openAddModal = () => {
    setEditingGuardian(null);
    setFormData({ firstName: "", lastName: "", phone: "", relationship: "", email: "", occupation: "", address: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setFormData({ firstName: guardian.firstName, lastName: guardian.lastName, phone: guardian.phone, relationship: guardian.relationship, email: guardian.email || "", occupation: guardian.occupation || "", address: guardian.address || "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.relationship) return;
    setIsSubmitting(true);
    setError("");
    try {
      if (editingGuardian) {
        await guardiansApi.update(editingGuardian.id, formData);
      } else {
        await guardiansApi.create(formData);
      }
      setShowModal(false);
      fetchGuardians(search);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to save guardian");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guardian?")) return;
    try { await guardiansApi.delete(id); fetchGuardians(search); } catch (error) { console.error("Failed to delete guardian:", error); }
  };

  if (isLoading && guardians.length === 0) {
    return <DashboardLayout><PageLoading message="Loading guardians..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Guardians"
        description="Manage student guardians"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Guardians" }]}
        actions={<Button onClick={openAddModal}><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Guardian</Button>}
      />

      <Card className="mb-6">
        <CardContent className="py-4">
          <Input placeholder="Search guardians..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {guardians.length === 0 && !isLoading ? (
            <EmptyState icon={<NoDataIcon />} title="No guardians found" description="Add your first guardian" action={<Button onClick={openAddModal}>Add Guardian</Button>} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guardians.map((guardian) => (
                    <TableRow key={guardian.id}>
                      <TableCell><span className="font-medium">{guardian.firstName} {guardian.lastName}</span></TableCell>
                      <TableCell>{guardian.phone}</TableCell>
                      <TableCell>{guardian.email || "N/A"}</TableCell>
                      <TableCell><Badge variant="secondary">{guardian.relationship}</Badge></TableCell>
                      <TableCell><Badge variant="primary">{guardian._count?.students || 0}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(guardian)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(guardian.id)}>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingGuardian ? "Edit Guardian" : "Add Guardian"} size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={formData.firstName} onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))} required />
            <Input label="Last Name" value={formData.lastName} onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} required />
            <Input label="Email" type="email" value={formData.email || ""} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Relationship" value={formData.relationship} onChange={(e) => setFormData((prev) => ({ ...prev, relationship: e.target.value }))} required placeholder="e.g., Father, Mother, Guardian" />
            <Input label="Occupation" value={formData.occupation || ""} onChange={(e) => setFormData((prev) => ({ ...prev, occupation: e.target.value }))} />
          </div>
          <Textarea label="Address" value={formData.address || ""} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} rows={2} />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.firstName || !formData.lastName || !formData.phone || !formData.relationship} isLoading={isSubmitting}>{editingGuardian ? "Update" : "Add"} Guardian</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function GuardiansPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "SECRETARY"]}>
      <GuardiansContent />
    </ProtectedRoute>
  );
}
