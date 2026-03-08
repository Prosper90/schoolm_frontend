"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { PageLoading } from "@/components/ui/Loading";
import { studentsApi } from "@/lib/services/students";
import { classesApi } from "@/lib/services/classes";
import { guardiansApi } from "@/lib/services/guardians";
import { Student, Class, Guardian } from "@/types";

function EditStudentContent() {
  const params = useParams();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Select Class" },
  ]);
  const [guardianOptions, setGuardianOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Select Guardian" },
  ]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    classId: "",
    guardianId: "",
    admissionNumber: "",
    rollNumber: "",
    category: "",
    religion: "",
    bloodGroup: "",
    address: "",
    totalFeesRequired: "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      setIsPageLoading(true);
      try {
        const [studentRes, classesRes, guardiansRes] = await Promise.all([
          studentsApi.getById(params.id as string),
          classesApi.getAll({ limit: 100 }).catch(() => null),
          guardiansApi.getAll({ limit: 100 }).catch(() => null),
        ]);

        if (studentRes?.data) {
          const s = studentRes.data as Student;
          setFormData({
            firstName: s.user?.firstName || "",
            lastName: s.user?.lastName || "",
            email: s.user?.email || "",
            phone: s.user?.phone || "",
            dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split("T")[0] : "",
            gender: s.gender || "",
            classId: s.classId || "",
            guardianId: s.guardianId || "",
            admissionNumber: s.admissionNumber || "",
            rollNumber: s.rollNumber || "",
            category: s.category || "",
            religion: s.religion || "",
            bloodGroup: s.bloodGroup || "",
            address: s.address || "",
            totalFeesRequired: s.totalFeesRequired ? s.totalFeesRequired.toString() : "",
          });
        }

        if (classesRes?.data?.classes) {
          setClassOptions([
            { value: "", label: "Select Class" },
            ...classesRes.data.classes.map((cls: Class) => ({
              value: cls.id,
              label: cls.name + (cls.section ? ` - ${cls.section}` : ""),
            })),
          ]);
        }
        if (guardiansRes?.data?.guardians) {
          setGuardianOptions([
            { value: "", label: "Select Guardian" },
            ...guardiansRes.data.guardians.map((g: Guardian) => ({
              value: g.id,
              label: `${g.firstName} ${g.lastName} (${g.phone})`,
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setError("Failed to load student data");
      } finally {
        setIsPageLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  const genderOptions = [
    { value: "", label: "Select Gender" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
  ];

  const bloodGroups = [
    { value: "", label: "Select Blood Group" },
    { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
    { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
  ];

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!formData.firstName || !formData.lastName) {
        throw new Error("First name and last name are required");
      }

      await studentsApi.update(params.id as string, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: (formData.gender as "MALE" | "FEMALE") || undefined,
        classId: formData.classId || undefined,
        guardianId: formData.guardianId || undefined,
        admissionNumber: formData.admissionNumber || undefined,
        rollNumber: formData.rollNumber || undefined,
        category: formData.category || undefined,
        religion: formData.religion || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        address: formData.address || undefined,
        totalFeesRequired: formData.totalFeesRequired ? Number(formData.totalFeesRequired) : undefined,
      });
      setSuccess("Student updated successfully!");
      setTimeout(() => router.push(`/students/${params.id}`), 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update student");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return <DashboardLayout><PageLoading message="Loading student data..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Edit Student"
        description="Update student information"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students", href: "/students" },
          { label: `${formData.firstName} ${formData.lastName}`, href: `/students/${params.id}` },
          { label: "Edit" },
        ]}
      />

      <form onSubmit={handleSubmit}>
        {error && <Alert variant="danger" className="mb-6" onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess("")}>{success}</Alert>}

        <Card className="mb-6">
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" value={formData.firstName} onChange={handleChange("firstName")} required />
              <Input label="Last Name" value={formData.lastName} onChange={handleChange("lastName")} required />
              <Input label="Email" type="email" value={formData.email} onChange={handleChange("email")} />
              <Input label="Phone" value={formData.phone} onChange={handleChange("phone")} />
              <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange("dateOfBirth")} />
              <Select label="Gender" options={genderOptions} value={formData.gender} onChange={handleChange("gender")} />
              <Select label="Blood Group" options={bloodGroups} value={formData.bloodGroup} onChange={handleChange("bloodGroup")} />
              <Input label="Religion" value={formData.religion} onChange={handleChange("religion")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Academic Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Class" options={classOptions} value={formData.classId} onChange={handleChange("classId")} />
              <Input label="Admission Number" value={formData.admissionNumber} onChange={handleChange("admissionNumber")} />
              <Input label="Roll Number" value={formData.rollNumber} onChange={handleChange("rollNumber")} />
              <Input label="Category" value={formData.category} onChange={handleChange("category")} placeholder="e.g., Day Scholar, Boarder" />
              <Input label="Total Fees Required (UGX)" type="number" value={formData.totalFeesRequired} onChange={handleChange("totalFeesRequired")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Guardian Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Guardian" options={guardianOptions} value={formData.guardianId} onChange={handleChange("guardianId")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent>
            <Textarea label="Address" value={formData.address} onChange={handleChange("address")} rows={3} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Update Student</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}

export default function EditStudentPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "SECRETARY"]}>
      <EditStudentContent />
    </ProtectedRoute>
  );
}
