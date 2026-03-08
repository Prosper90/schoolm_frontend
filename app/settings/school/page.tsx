"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { PageLoading } from "@/components/ui/Loading";
import { useAuthStore } from "@/store/authStore";
import { schoolsApi } from "@/lib/services/schools";
import { School } from "@/types";

function SchoolSettingsContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [school, setSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    primaryColor: "",
    secondaryColor: "",
  });

  useEffect(() => {
    const loadSchool = async () => {
      if (!user?.schoolId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await schoolsApi.getById(user.schoolId);
        if (response?.data) {
          const s = response.data as School;
          setSchool(s);
          setFormData({
            name: s.name || "",
            address: s.address || "",
            phone: s.phone || "",
            email: s.email || "",
            primaryColor: s.primaryColor || "#3B82F6",
            secondaryColor: s.secondaryColor || "#1E40AF",
          });
        }
      } catch (error) {
        console.error("Failed to load school:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSchool();
  }, [user?.schoolId]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await schoolsApi.update(school.id, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        level: "",
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminPassword: "",
      });
      setSuccess("School settings updated successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update school settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <DashboardLayout><PageLoading message="Loading school settings..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="School Settings"
        description="Configure your school information"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings", href: "/settings" }, { label: "School" }]}
      />

      <form onSubmit={handleSubmit}>
        {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess("")}>{success}</Alert>}
        {error && <Alert variant="danger" className="mb-6" onClose={() => setError("")}>{error}</Alert>}

        <Card className="mb-6">
          <CardHeader><CardTitle>School Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="School Name" value={formData.name} onChange={handleChange("name")} required />
              <Input label="Email" type="email" value={formData.email} onChange={handleChange("email")} />
              <Input label="Phone" value={formData.phone} onChange={handleChange("phone")} />
              <div className="md:col-span-2">
                <Textarea label="Address" value={formData.address} onChange={handleChange("address")} rows={3} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={formData.primaryColor} onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
                  <Input value={formData.primaryColor} onChange={handleChange("primaryColor")} placeholder="#3B82F6" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={formData.secondaryColor} onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
                  <Input value={formData.secondaryColor} onChange={handleChange("secondaryColor")} placeholder="#1E40AF" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving}>Save Changes</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}

export default function SchoolSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <SchoolSettingsContent />
    </ProtectedRoute>
  );
}
