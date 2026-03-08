"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { studentsApi } from "@/lib/services/students";
import { classesApi } from "@/lib/services/classes";
import { guardiansApi } from "@/lib/services/guardians";
import { StudentFormData, GuardianFormData, Class, Guardian } from "@/types";

function AddStudentContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasClasses, setHasClasses] = useState(true);
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Select Class" },
  ]);
  const [guardianOptions, setGuardianOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "No Guardian (optional)" },
  ]);
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    gender: undefined,
    classId: "",
    guardianId: "",
    admissionNumber: "",
    rollNumber: "",
    category: "",
    religion: "",
    bloodGroup: "",
    address: "",
  });

  // Inline guardian creation
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [isCreatingGuardian, setIsCreatingGuardian] = useState(false);
  const [guardianError, setGuardianError] = useState("");
  const [guardianForm, setGuardianForm] = useState<GuardianFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    relationship: "",
    email: "",
    occupation: "",
    address: "",
  });

  const loadGuardians = async () => {
    try {
      const guardiansRes = await guardiansApi.getAll({ limit: 100 });
      if (guardiansRes?.data?.guardians) {
        setGuardianOptions([
          { value: "", label: "No Guardian (optional)" },
          ...guardiansRes.data.guardians.map((g: Guardian) => ({
            value: g.id,
            label: `${g.firstName} ${g.lastName} (${g.phone})`,
          })),
        ]);
      }
    } catch (error) {
      console.error("Failed to load guardians:", error);
    }
  };

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [classesRes] = await Promise.all([
          classesApi.getAll({ limit: 100 }).catch(() => null),
        ]);

        if (classesRes?.data?.classes && classesRes.data.classes.length > 0) {
          setHasClasses(true);
          setClassOptions([
            { value: "", label: "Select Class" },
            ...classesRes.data.classes.map((cls: Class) => ({
              value: cls.id,
              label: cls.name + (cls.section ? ` - ${cls.section}` : ""),
            })),
          ]);
        } else {
          setHasClasses(false);
        }
      } catch (error) {
        console.error("Failed to load classes:", error);
        setHasClasses(false);
      }

      await loadGuardians();
    };
    loadDropdowns();
  }, []);

  const genderOptions = [
    { value: "", label: "Select Gender" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
  ];

  const bloodGroups = [
    { value: "", label: "Select Blood Group" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  const handleChange = (field: keyof StudentFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!formData.firstName || !formData.lastName) {
        throw new Error("First name and last name are required");
      }
      if (!formData.classId) {
        throw new Error("Please select a class");
      }

      await studentsApi.create(formData);
      router.push("/students");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to create student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGuardian = async () => {
    if (!guardianForm.firstName || !guardianForm.lastName || !guardianForm.phone || !guardianForm.relationship) return;
    setIsCreatingGuardian(true);
    setGuardianError("");
    try {
      const response = await guardiansApi.create(guardianForm);
      if (response?.data) {
        const newGuardian = response.data as Guardian;
        // Reload guardians list and auto-select the new one
        await loadGuardians();
        setFormData((prev) => ({ ...prev, guardianId: newGuardian.id }));
        setShowGuardianModal(false);
        setGuardianForm({ firstName: "", lastName: "", phone: "", relationship: "", email: "", occupation: "", address: "" });
      }
    } catch (err: any) {
      setGuardianError(err?.response?.data?.message || err.message || "Failed to create guardian");
    } finally {
      setIsCreatingGuardian(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Add New Student"
        description="Register a new student in the system"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students", href: "/students" },
          { label: "Add Student" },
        ]}
      />

      {/* Prerequisite warning: No classes */}
      {!hasClasses && (
        <Alert variant="warning" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <strong>No classes found.</strong> You need to create at least one class before adding students.
            </div>
            <Link href="/classes">
              <Button size="sm" variant="outline">Go to Classes</Button>
            </Link>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="danger" className="mb-6" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" value={formData.firstName} onChange={handleChange("firstName")} required />
              <Input label="Last Name" value={formData.lastName} onChange={handleChange("lastName")} required />
              <Input label="Email" type="email" value={formData.email} onChange={handleChange("email")} />
              <Input label="Phone" value={formData.phone} onChange={handleChange("phone")} />
              <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange("dateOfBirth")} />
              <Select label="Gender" options={genderOptions} value={formData.gender || ""} onChange={handleChange("gender")} />
              <Select label="Blood Group" options={bloodGroups} value={formData.bloodGroup || ""} onChange={handleChange("bloodGroup")} />
              <Input label="Religion" value={formData.religion} onChange={handleChange("religion")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasClasses ? (
              <div className="text-center py-6 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <p className="font-medium">No classes available</p>
                <p className="text-sm mt-1">Please <Link href="/classes" className="text-blue-600 hover:underline">create a class</Link> first, then come back to add a student.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Class" options={classOptions} value={formData.classId || ""} onChange={handleChange("classId")} required />
                <Input label="Admission Number" value={formData.admissionNumber} onChange={handleChange("admissionNumber")} />
                <Input label="Roll Number" value={formData.rollNumber} onChange={handleChange("rollNumber")} />
                <Input label="Category" value={formData.category} onChange={handleChange("category")} placeholder="e.g., Day Scholar, Boarder" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Guardian Information</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => { setGuardianError(""); setShowGuardianModal(true); }}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Guardian
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {guardianOptions.length <= 1 ? (
              <div className="text-center py-6 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <p className="font-medium">No guardians yet</p>
                <p className="text-sm mt-1">Click "New Guardian" above to create one, or you can skip this and add one later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Select Existing Guardian" options={guardianOptions} value={formData.guardianId || ""} onChange={handleChange("guardianId")} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea label="Address" value={formData.address} onChange={handleChange("address")} rows={3} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Password" type="password" value={formData.password} onChange={handleChange("password")} helperText="Leave blank to use default password (student123)" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={isLoading} disabled={!hasClasses}>Create Student</Button>
        </div>
      </form>

      {/* Inline Guardian Creation Modal */}
      <Modal isOpen={showGuardianModal} onClose={() => setShowGuardianModal(false)} title="Add New Guardian" size="md">
        <div className="space-y-4">
          {guardianError && <Alert variant="danger" onClose={() => setGuardianError("")}>{guardianError}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={guardianForm.firstName} onChange={(e) => setGuardianForm((prev) => ({ ...prev, firstName: e.target.value }))} required />
            <Input label="Last Name" value={guardianForm.lastName} onChange={(e) => setGuardianForm((prev) => ({ ...prev, lastName: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={guardianForm.phone} onChange={(e) => setGuardianForm((prev) => ({ ...prev, phone: e.target.value }))} required />
            <Input label="Relationship" value={guardianForm.relationship} onChange={(e) => setGuardianForm((prev) => ({ ...prev, relationship: e.target.value }))} required placeholder="e.g., Father, Mother" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={guardianForm.email || ""} onChange={(e) => setGuardianForm((prev) => ({ ...prev, email: e.target.value }))} />
            <Input label="Occupation" value={guardianForm.occupation || ""} onChange={(e) => setGuardianForm((prev) => ({ ...prev, occupation: e.target.value }))} />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowGuardianModal(false)}>Cancel</Button>
          <Button onClick={handleCreateGuardian} disabled={!guardianForm.firstName || !guardianForm.lastName || !guardianForm.phone || !guardianForm.relationship} isLoading={isCreatingGuardian}>Create Guardian</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function AddStudentPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "SECRETARY"]}>
      <AddStudentContent />
    </ProtectedRoute>
  );
}
