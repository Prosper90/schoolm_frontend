"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { PageLoading } from "@/components/ui/Loading";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { classesApi } from "@/lib/services/classes";
import { attendanceApi } from "@/lib/services/attendance";
import { formatDate } from "@/lib/utils";
import { Class, Student, AttendanceStatus } from "@/types";

interface AttendanceStudent {
  id: string;
  name: string;
  admissionNumber: string;
  status: AttendanceStatus | null;
}

function AttendanceContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Select Class" },
  ]);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await classesApi.getAll({ limit: 100 });
        if (response?.data?.classes) {
          setClassOptions([
            { value: "", label: "Select Class" },
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

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          classesApi.getStudents(selectedClass),
          attendanceApi.getByClass(selectedClass, selectedDate).catch(() => null),
        ]);

        const studentsList = studentsRes?.data?.students || studentsRes?.data || [];
        const attendanceRecords = attendanceRes?.data?.attendance || [];

        const mapped: AttendanceStudent[] = (Array.isArray(studentsList) ? studentsList : []).map((s: any) => {
          const record = attendanceRecords.find((a: any) => a.studentId === s.id);
          return {
            id: s.id,
            name: s.user ? `${s.user.firstName} ${s.user.lastName}` : `Student ${s.id}`,
            admissionNumber: s.admissionNumber || "N/A",
            status: record?.status || null,
          };
        });
        setStudents(mapped);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedDate]);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  };

  const markAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSave = async () => {
    const unmarked = students.filter((s) => !s.status);
    if (unmarked.length > 0) {
      setError(`Please mark attendance for all students. ${unmarked.length} student(s) unmarked.`);
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await attendanceApi.bulkMark({
        classId: selectedClass,
        date: selectedDate,
        attendanceRecords: students.map((s) => ({
          studentId: s.id,
          status: s.status!,
        })),
      });
      setSuccess("Attendance saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to save attendance");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: AttendanceStatus | null) => {
    switch (status) {
      case "PRESENT": return <Badge variant="success">Present</Badge>;
      case "ABSENT": return <Badge variant="danger">Absent</Badge>;
      case "LATE": return <Badge variant="warning">Late</Badge>;
      case "EXCUSED": return <Badge variant="info">Excused</Badge>;
      default: return <Badge variant="secondary">Not Marked</Badge>;
    }
  };

  const stats = {
    total: students.length,
    present: students.filter((s) => s.status === "PRESENT").length,
    absent: students.filter((s) => s.status === "ABSENT").length,
    late: students.filter((s) => s.status === "LATE").length,
    excused: students.filter((s) => s.status === "EXCUSED").length,
    unmarked: students.filter((s) => !s.status).length,
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Mark Attendance"
        description="Record daily student attendance"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Attendance" }]}
      />

      {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess("")}>{success}</Alert>}
      {error && <Alert variant="danger" className="mb-6" onClose={() => setError("")}>{error}</Alert>}

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <Select label="Class" options={classOptions} value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} />
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => markAll("PRESENT")} disabled={!selectedClass || students.length === 0}>Mark All Present</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-sm text-gray-500">Total</p></CardContent></Card>
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.present}</p><p className="text-sm text-gray-500">Present</p></CardContent></Card>
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.absent}</p><p className="text-sm text-gray-500">Absent</p></CardContent></Card>
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.late}</p><p className="text-sm text-gray-500">Late</p></CardContent></Card>
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-cyan-600">{stats.excused}</p><p className="text-sm text-gray-500">Excused</p></CardContent></Card>
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-gray-400">{stats.unmarked}</p><p className="text-sm text-gray-500">Unmarked</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{selectedClass ? `Attendance for ${formatDate(selectedDate)}` : "Select a class"}</CardTitle>
          {selectedClass && students.length > 0 && <Button onClick={handleSave} isLoading={isSaving}>Save Attendance</Button>}
        </CardHeader>
        <CardContent className="p-0">
          {!selectedClass ? (
            <div className="py-12 text-center text-gray-500">Please select a class to mark attendance</div>
          ) : isLoading ? (
            <PageLoading message="Loading students..." />
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No students found in this class</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar fallback={student.name} size="sm" />
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant={student.status === "PRESENT" ? "success" : "outline"} onClick={() => updateStatus(student.id, "PRESENT")}>P</Button>
                        <Button size="sm" variant={student.status === "ABSENT" ? "danger" : "outline"} onClick={() => updateStatus(student.id, "ABSENT")}>A</Button>
                        <Button size="sm" variant={student.status === "LATE" ? "warning" : "outline"} onClick={() => updateStatus(student.id, "LATE")}>L</Button>
                        <Button size="sm" variant={student.status === "EXCUSED" ? "secondary" : "outline"} onClick={() => updateStatus(student.id, "EXCUSED")}>E</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <AttendanceContent />
    </ProtectedRoute>
  );
}
