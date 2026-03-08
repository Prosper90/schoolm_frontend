"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

function ProfileContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePasswordChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.put("/auth/profile", formData);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setIsPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || err.message || "Failed to update password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings", href: "/settings" }, { label: "Profile" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Avatar fallback={user ? `${user.firstName} ${user.lastName}` : "User"} size="xl" className="mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="mt-2 text-xs text-gray-400 uppercase">{user?.role}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess("")}>{success}</Alert>}
            {error && <Alert variant="danger" className="mb-6" onClose={() => setError("")}>{error}</Alert>}

            <Card>
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" value={formData.firstName} onChange={handleChange("firstName")} required />
                  <Input label="Last Name" value={formData.lastName} onChange={handleChange("lastName")} required />
                  <Input label="Email" type="email" value={formData.email} onChange={handleChange("email")} required />
                  <Input label="Phone" value={formData.phone} onChange={handleChange("phone")} />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <form onSubmit={handlePasswordSubmit}>
            {passwordSuccess && <Alert variant="success" className="mt-6 mb-2" onClose={() => setPasswordSuccess("")}>{passwordSuccess}</Alert>}
            {passwordError && <Alert variant="danger" className="mt-6 mb-2" onClose={() => setPasswordError("")}>{passwordError}</Alert>}

            <Card className="mt-6">
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Current Password" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange("currentPassword")} placeholder="Enter current password" required />
                  <div />
                  <Input label="New Password" type="password" value={passwordData.newPassword} onChange={handlePasswordChange("newPassword")} placeholder="Enter new password" required />
                  <Input label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange("confirmPassword")} placeholder="Confirm new password" required />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="submit" variant="outline" isLoading={isPasswordLoading}>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
