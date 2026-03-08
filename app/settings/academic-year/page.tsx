"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";

function AcademicYearContent() {
  const [success, setSuccess] = useState("");
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    currentYear: currentYear.toString(),
    term1Start: "",
    term1End: "",
    term2Start: "",
    term2End: "",
    term3Start: "",
    term3End: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    setSuccess("Academic year settings saved locally. Backend integration coming soon.");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Academic Year Settings"
        description="Configure academic year and term dates"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings", href: "/settings" }, { label: "Academic Year" }]}
      />

      {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess("")}>{success}</Alert>}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Academic Year</CardTitle>
            <Badge variant="success">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Academic Year" value={formData.currentYear} onChange={handleChange("currentYear")} placeholder="e.g., 2026" />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>Term 1</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Start Date" type="date" value={formData.term1Start} onChange={handleChange("term1Start")} />
            <Input label="End Date" type="date" value={formData.term1End} onChange={handleChange("term1End")} />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>Term 2</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Start Date" type="date" value={formData.term2Start} onChange={handleChange("term2Start")} />
            <Input label="End Date" type="date" value={formData.term2End} onChange={handleChange("term2End")} />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>Term 3</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Start Date" type="date" value={formData.term3Start} onChange={handleChange("term3Start")} />
            <Input label="End Date" type="date" value={formData.term3End} onChange={handleChange("term3End")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </DashboardLayout>
  );
}

export default function AcademicYearPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <AcademicYearContent />
    </ProtectedRoute>
  );
}
