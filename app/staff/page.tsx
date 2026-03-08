"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
import { Avatar } from "@/components/ui/Avatar";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { staffApi } from "@/lib/services/staff";
import { departmentsApi } from "@/lib/services/departments";
import { formatDate, formatCurrency, debounce, getRoleBadgeColor } from "@/lib/utils";
import { Staff, Department, StaffFormData } from "@/types";

function StaffContent() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasDepartments, setHasDepartments] = useState(true);
  const [departmentOptions, setDepartmentOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "All Departments" },
  ]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    position: "",
    dateHired: new Date().toISOString().split("T")[0],
    departmentId: "",
    salary: undefined,
  });

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "TEACHER", label: "Teacher" },
    { value: "ACCOUNTANT", label: "Accountant" },
    { value: "SECRETARY", label: "Secretary" },
    { value: "COOK", label: "Cook" },
    { value: "OTHER_STAFF", label: "Other Staff" },
  ];

  const roleOptionsForForm = [
    { value: "TEACHER", label: "Teacher" },
    { value: "ACCOUNTANT", label: "Accountant" },
    { value: "SECRETARY", label: "Secretary" },
    { value: "COOK", label: "Cook" },
    { value: "OTHER_STAFF", label: "Other Staff" },
  ];

  const [selectedRole, setSelectedRole] = useState("OTHER_STAFF");

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await departmentsApi.getAll({ limit: 100 });
        if (response?.data?.departments && response.data.departments.length > 0) {
          setHasDepartments(true);
          setDepartmentOptions([
            { value: "", label: "All Departments" },
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

  const fetchStaff = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const response = await staffApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        departmentId: departmentFilter || undefined,
      });
      if (response?.data) {
        setStaffList(response.data.staff || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.pagination?.total || 0,
          pages: response.data?.pagination?.pages || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, roleFilter, departmentFilter]);

  useEffect(() => {
    fetchStaff(search);
  }, [pagination.page, roleFilter, departmentFilter]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchStaff(search);
    }, 300);
    debouncedSearch();
  }, [search]);

  const handleAddStaff = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) return;
    setIsSubmitting(true);
    setError("");
    try {
      await staffApi.create({
        ...formData,
        departmentId: formData.departmentId || undefined,
        phone: formData.phone || undefined,
        password: formData.password || undefined,
        position: formData.position || "Staff",
      });
      setShowAddModal(false);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", password: "", position: "", dateHired: new Date().toISOString().split("T")[0], departmentId: "", salary: undefined });
      fetchStaff(search);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to add staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: keyof StaffFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = field === "salary" || field === "experience" ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading && staffList.length === 0) {
    return <DashboardLayout><PageLoading message="Loading staff..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Staff"
        description="Manage all staff members"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Staff" }]}
        actions={<Button onClick={() => setShowAddModal(true)}><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Staff</Button>}
      />

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div className="w-full md:w-48"><Select options={roleOptions} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} /></div>
            <div className="w-full md:w-48"><Select options={departmentOptions} value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {staffList.length === 0 && !isLoading ? (
            <EmptyState icon={<NoDataIcon />} title="No staff found" description="Get started by adding your first staff member" action={<Button onClick={() => setShowAddModal(true)}>Add Staff</Button>} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar fallback={`${staff.user?.firstName || ""} ${staff.user?.lastName || ""}`} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{staff.user?.firstName} {staff.user?.lastName}</p>
                            <p className="text-sm text-gray-500">{staff.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{staff.position || "N/A"}</TableCell>
                      <TableCell>{staff.department?.name || "N/A"}</TableCell>
                      <TableCell><Badge variant={getRoleBadgeColor(staff.user?.role || "") as any}>{staff.user?.role || "N/A"}</Badge></TableCell>
                      <TableCell>{staff.user?.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => {/* view */}}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Staff Member" size="lg">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          {!hasDepartments && (
            <Alert variant="info">
              <strong>Tip:</strong> No departments found. You can still add staff, but consider <Link href="/departments" className="text-blue-600 hover:underline font-medium">creating departments</Link> first to organize your team.
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={formData.firstName} onChange={handleFormChange("firstName")} required />
            <Input label="Last Name" value={formData.lastName} onChange={handleFormChange("lastName")} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={formData.email} onChange={handleFormChange("email")} required />
            <Input label="Phone" value={formData.phone} onChange={handleFormChange("phone")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Position" value={formData.position} onChange={handleFormChange("position")} placeholder="e.g., Head Teacher" />
            <Select label="Department" options={departmentOptions} value={formData.departmentId || ""} onChange={handleFormChange("departmentId")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Salary (UGX)" type="number" value={formData.salary || ""} onChange={handleFormChange("salary")} />
            <Input label="Date Hired" type="date" value={formData.dateHired} onChange={handleFormChange("dateHired")} />
          </div>
          <Input label="Password" type="password" value={formData.password} onChange={handleFormChange("password")} helperText="Leave blank for default password" />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button onClick={handleAddStaff} disabled={!formData.firstName || !formData.lastName || !formData.email} isLoading={isSubmitting}>Add Staff</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function StaffPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <StaffContent />
    </ProtectedRoute>
  );
}
