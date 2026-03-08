"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Loading";
import { EmptyState, NoDataIcon } from "@/components/ui/EmptyState";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { classesApi } from "@/lib/services/classes";
import { formatCurrency, debounce } from "@/lib/utils";
import { Class } from "@/types";

function ClassesContent() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("");
  const [newClassStream, setNewClassStream] = useState("");
  const [newClassLevel, setNewClassLevel] = useState("PRIMARY");
  const [newClassCapacity, setNewClassCapacity] = useState("");
  const [newClassFees, setNewClassFees] = useState("");

  const levelOptions = [
    { value: "PRIMARY", label: "Primary" },
    { value: "SECONDARY", label: "Secondary" },
  ];

  const gradeOptions = newClassLevel === "PRIMARY"
    ? [{ value: "", label: "Select Grade" }, ...Array.from({ length: 7 }, (_, i) => ({ value: String(i + 1), label: `P${i + 1}` }))]
    : [{ value: "", label: "Select Grade" }, ...Array.from({ length: 6 }, (_, i) => ({ value: String(i + 1), label: `S${i + 1}` }))];

  const fetchClasses = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const response = await classesApi.getAll({ search: searchTerm || undefined, limit: 100 });
      if (response?.data?.classes) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      fetchClasses(search);
    }, 300);
    debouncedSearch();
  }, [search]);

  const handleAddClass = async () => {
    if (!newClassName || !newClassGrade || !newClassLevel || !newClassFees) return;
    setIsSubmitting(true);
    setError("");
    try {
      await classesApi.create({
        name: newClassName,
        grade: newClassGrade,
        stream: newClassStream || undefined,
        level: newClassLevel,
        capacity: newClassCapacity ? Number(newClassCapacity) : undefined,
        feesAmount: Number(newClassFees),
      });
      setShowAddModal(false);
      setNewClassName("");
      setNewClassGrade("");
      setNewClassStream("");
      setNewClassLevel("PRIMARY");
      setNewClassCapacity("");
      setNewClassFees("");
      fetchClasses(search);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to add class");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && classes.length === 0) {
    return (
      <DashboardLayout>
        <PageLoading message="Loading classes..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Classes"
        description="Manage school classes and sections"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Classes" },
        ]}
        actions={
          <Button onClick={() => setShowAddModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Class
          </Button>
        }
      />

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <Input
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {classes.length === 0 && !isLoading ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<NoDataIcon />}
              title="No classes found"
              description="Get started by adding your first class"
              action={
                <Button onClick={() => setShowAddModal(true)}>Add Class</Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/classes/${cls.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cls.name}
                      </h3>
                      {cls.section && (
                        <Badge variant="secondary" className="mt-1">
                          Section {cls.section}
                        </Badge>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Students</span>
                      <span className="font-medium">
                        {cls._count?.students || 0} / {cls.capacity || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subjects</span>
                      <span className="font-medium">{cls._count?.subjects || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fees</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(cls.feesAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {cls.capacity && (
                    <div className="mt-4">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(((cls._count?.students || 0) / cls.capacity) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(((cls._count?.students || 0) / cls.capacity) * 100)}% capacity
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Add Class Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Class"
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <Alert variant="danger" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          <Input
            label="Class Name"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="e.g., Primary 1"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Level"
              options={levelOptions}
              value={newClassLevel}
              onChange={(e) => { setNewClassLevel(e.target.value); setNewClassGrade(""); }}
              required
            />
            <Select
              label="Grade"
              options={gradeOptions}
              value={newClassGrade}
              onChange={(e) => setNewClassGrade(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stream"
              value={newClassStream}
              onChange={(e) => setNewClassStream(e.target.value)}
              placeholder="e.g., A, B (optional)"
            />
            <Input
              label="Capacity"
              type="number"
              value={newClassCapacity}
              onChange={(e) => setNewClassCapacity(e.target.value)}
              placeholder="e.g., 40"
            />
          </div>
          <Input
            label="Fees Amount (UGX)"
            type="number"
            value={newClassFees}
            onChange={(e) => setNewClassFees(e.target.value)}
            placeholder="e.g., 1500000"
            required
          />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddClass} disabled={!newClassName || !newClassGrade || !newClassFees} isLoading={isSubmitting}>
            Add Class
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function ClassesPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "SECRETARY"]}>
      <ClassesContent />
    </ProtectedRoute>
  );
}
