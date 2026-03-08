"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

function ToggleSwitch({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${checked ? "bg-blue-600" : "bg-gray-200"}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function NotificationsContent() {
  const [success, setSuccess] = useState("");
  const [settings, setSettings] = useState({
    emailPaymentReceipts: true,
    emailAttendanceAlerts: true,
    emailExamResults: false,
    emailLeaveUpdates: true,
    emailSystemUpdates: false,
    smsPaymentReminders: false,
    smsAttendanceAlerts: false,
  });

  const handleToggle = (key: keyof typeof settings) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSuccess("Notification preferences saved. Backend integration coming soon.");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Notification Settings"
        description="Configure how you receive notifications"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings", href: "/settings" }, { label: "Notifications" }]}
      />

      {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess("")}>{success}</Alert>}

      <Card className="mb-6">
        <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
        <CardContent>
          <ToggleSwitch label="Payment Receipts" description="Receive email when a payment is recorded" checked={settings.emailPaymentReceipts} onChange={handleToggle("emailPaymentReceipts")} />
          <ToggleSwitch label="Attendance Alerts" description="Get notified about student attendance issues" checked={settings.emailAttendanceAlerts} onChange={handleToggle("emailAttendanceAlerts")} />
          <ToggleSwitch label="Exam Results" description="Receive email when exam results are published" checked={settings.emailExamResults} onChange={handleToggle("emailExamResults")} />
          <ToggleSwitch label="Leave Updates" description="Get notified about leave application status changes" checked={settings.emailLeaveUpdates} onChange={handleToggle("emailLeaveUpdates")} />
          <ToggleSwitch label="System Updates" description="Receive emails about system maintenance and updates" checked={settings.emailSystemUpdates} onChange={handleToggle("emailSystemUpdates")} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>SMS Notifications</CardTitle></CardHeader>
        <CardContent>
          <ToggleSwitch label="Payment Reminders" description="Send SMS reminders for pending fee payments" checked={settings.smsPaymentReminders} onChange={handleToggle("smsPaymentReminders")} />
          <ToggleSwitch label="Attendance Alerts" description="Send SMS to guardians for absent students" checked={settings.smsAttendanceAlerts} onChange={handleToggle("smsAttendanceAlerts")} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </DashboardLayout>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
