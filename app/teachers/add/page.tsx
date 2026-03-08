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
import { Alert } from "@/components/ui/Alert";
import { staffApi } from "@/lib/services/staff";
import { departmentsApi } from "@/lib/services/departments";
import { Department } from "@/types";

function AddTeacherContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasDepartments, setHasDepartments] = useState(true);
  const [departmentOptions, setDepartmentOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "No Department (optional)" },
  ]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    departmentId: "",
    position: "Teacher",
    qualification: "",
    experience: "",
    dateHired: new Date().toISOString().split("T")[0],
    salary: "",
  });

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await departmentsApi.getAll({ limit: 100 });
        if (response?.data?.departments && response.data.departments.length > 0) {
          setHasDepartments(true);
          setDepartmentOptions([
            { value: "", label: "No Department (optional)" },
            ...response.data.departments.map((dept: Department) => ({
              value: dept.id,
              label: dept.name,
            })),
          ]);
        } else {
          setHasDepartments(false);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };
    loadDepartments();
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error("First name, last name, and email are required");
      }

      await staffApi.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password || undefined,
        position: formData.position,
        dateHired: formData.dateHired,
        departmentId: formData.departmentId || undefined,
        salary: formData.salary ? Number(formData.salary) : undefined,
        qualification: formData.qualification || undefined,
        experience: formData.experience ? Number(formData.experience) : undefined,
      });
      router.push("/teachers");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to add teacher");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Add New Teacher"
        description="Register a new teacher in the system"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Teachers", href: "/teachers" },
          { label: "Add Teacher" },
        ]}
      />

      {!hasDepartments && (
        <Alert variant="info" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <strong>Tip:</strong> No departments found. You can still add a teacher, but consider <Link href="/departments" className="text-blue-600 hover:underline font-medium">creating departments</Link> first to better organize your staff.
            </div>
            <Link href="/departments">
              <Button size="sm" variant="outline">Go to Departments</Button>
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
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" value={formData.firstName} onChange={handleChange("firstName")} required />
              <Input label="Last Name" value={formData.lastName} onChange={handleChange("lastName")} required />
              <Input label="Email" type="email" value={formData.email} onChange={handleChange("email")} required />
              <Input label="Phone" value={formData.phone} onChange={handleChange("phone")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Position" value={formData.position} onChange={handleChange("position")} placeholder="e.g., Senior Teacher" />
              <Select label="Department" options={departmentOptions} value={formData.departmentId} onChange={handleChange("departmentId")} />
              <Input label="Qualification" value={formData.qualification} onChange={handleChange("qualification")} placeholder="e.g., B.Ed, M.Sc" />
              <Input label="Years of Experience" type="number" value={formData.experience} onChange={handleChange("experience")} />
              <Input label="Salary (UGX)" type="number" value={formData.salary} onChange={handleChange("salary")} />
              <Input label="Date Hired" type="date" value={formData.dateHired} onChange={handleChange("dateHired")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Password" type="password" value={formData.password} onChange={handleChange("password")} helperText="Leave blank to use default password" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Add Teacher</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}

export default function AddTeacherPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <AddTeacherContent />
    </ProtectedRoute>
  );
}
