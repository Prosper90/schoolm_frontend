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
import { studentsApi } from "@/lib/services/students";
import { classesApi } from "@/lib/services/classes";
import { formatDate, debounce } from "@/lib/utils";
import { Student, Class } from "@/types";

function StudentsContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "All Classes" },
  ]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await classesApi.getAll({ limit: 100 });
        if (response?.data?.classes) {
          setClassOptions([
            { value: "", label: "All Classes" },
            ...response.data.classes.map((cls: Class) => ({
              value: cls.id,
              label: cls.name + (cls.section ? ` - ${cls.section}` : ""),
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };
    loadClasses();
  }, []);

  const fetchStudents = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const response = await studentsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        classId: classFilter || undefined,
      });
      if (response?.data) {
        setStudents(response.data.students || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.pagination?.total || 0,
          pages: response.data?.pagination?.pages || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, classFilter]);

  useEffect(() => {
    fetchStudents(search);
  }, [pagination.page, classFilter]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchStudents(search);
    }, 300);
    debouncedSearch();
  }, [search]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  if (isLoading && students.length === 0) {
    return (
      <DashboardLayout>
        <PageLoading message="Loading students..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Students"
        description="Manage your school's students"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students" },
        ]}
        actions={
          <Link href="/students/add">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Student
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
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                options={classOptions}
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {students.length === 0 && !isLoading ? (
            <EmptyState
              icon={<NoDataIcon />}
              title="No students found"
              description="Get started by adding your first student"
              action={
                <Link href="/students/add">
                  <Button>Add Student</Button>
                </Link>
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar
                            fallback={`${student.user?.firstName || ""} ${student.user?.lastName || ""}`}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.user?.firstName} {student.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{student.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.admissionNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="primary">{student.class?.name || "Unassigned"}</Badge>
                      </TableCell>
                      <TableCell>{student.gender || "N/A"}</TableCell>
                      <TableCell>
                        {student.isSuspended ? (
                          <Badge variant="danger">Suspended</Badge>
                        ) : student.user?.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="warning">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(student.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/students/${student.id}`}>
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                          </Link>
                          <Link href={`/students/${student.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

export default function StudentsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "SECRETARY"]}>
      <StudentsContent />
    </ProtectedRoute>
  );
}
