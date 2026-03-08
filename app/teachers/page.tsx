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
import { staffApi } from "@/lib/services/staff";
import { departmentsApi } from "@/lib/services/departments";
import { formatDate, debounce } from "@/lib/utils";
import { Staff, Department } from "@/types";

function TeachersContent() {
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "All Departments" },
  ]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await departmentsApi.getAll({ limit: 100 });
        if (response?.data?.departments) {
          setDepartmentOptions([
            { value: "", label: "All Departments" },
            ...response.data.departments.map((dept: Department) => ({
              value: dept.id,
              label: dept.name,
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };
    loadDepartments();
  }, []);

  const fetchTeachers = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const response = await staffApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        role: "TEACHER",
        departmentId: departmentFilter || undefined,
      });
      if (response?.data) {
        setTeachers(response.data.staff || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.pagination?.total || 0,
          pages: response.data?.pagination?.pages || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, departmentFilter]);

  useEffect(() => {
    fetchTeachers(search);
  }, [pagination.page, departmentFilter]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchTeachers(search);
    }, 300);
    debouncedSearch();
  }, [search]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  if (isLoading && teachers.length === 0) {
    return (
      <DashboardLayout>
        <PageLoading message="Loading teachers..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Teachers"
        description="Manage your school's teaching staff"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Teachers" },
        ]}
        actions={
          <Link href="/teachers/add">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Teacher
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                options={departmentOptions}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardContent className="p-0">
          {teachers.length === 0 && !isLoading ? (
            <EmptyState
              icon={<NoDataIcon />}
              title="No teachers found"
              description="Get started by adding your first teacher"
              action={
                <Link href="/teachers/add">
                  <Button>Add Teacher</Button>
                </Link>
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar
                            fallback={`${teacher.user?.firstName || ""} ${teacher.user?.lastName || ""}`}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {teacher.user?.firstName} {teacher.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{teacher.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher.department?.name || "Not assigned"}
                      </TableCell>
                      <TableCell>{teacher.position || "Teacher"}</TableCell>
                      <TableCell>
                        {teacher.user?.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="danger">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {teacher.joiningDate ? formatDate(teacher.joiningDate) : formatDate(teacher.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/teachers/${teacher.id}`}>
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function TeachersPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "SECRETARY"]}>
      <TeachersContent />
    </ProtectedRoute>
  );
}
