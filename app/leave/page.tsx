"use client";

import { useEffect, useState } from "react";
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
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { leaveApi } from "@/lib/services/leave";
import { formatDate } from "@/lib/utils";
import { Leave, LeaveStatus } from "@/types";

const LEAVE_TYPE_OPTIONS = [
  { value: "", label: "Select Leave Type" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Annual Leave", label: "Annual Leave" },
  { value: "School Issue", label: "School Issue" },
  { value: "Maternity Leave", label: "Maternity Leave" },
  { value: "Paternity Leave", label: "Paternity Leave" },
  { value: "Study Leave", label: "Study Leave" },
  { value: "Others", label: "Others" },
];

function LeaveContent() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [customLeaveType, setCustomLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const response = await leaveApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: (statusFilter as LeaveStatus) || undefined,
      });
      if (response?.data) {
        setLeaves(response.data.leaves || []);
        setPagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) { console.error("Failed to fetch leaves:", error); setLeaves([]); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, [pagination.page, statusFilter]);

  const openApplyModal = () => {
    setSelectedLeaveType("");
    setCustomLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setError("");
    setShowApplyModal(true);
  };

  const getLeaveTypeName = () => {
    if (selectedLeaveType === "Others") return customLeaveType.trim();
    return selectedLeaveType;
  };

  const isFormValid = () => {
    const typeName = getLeaveTypeName();
    return typeName && startDate && endDate && reason.trim();
  };

  const handleApply = async () => {
    const leaveType = getLeaveTypeName();
    if (!leaveType || !startDate || !endDate || !reason.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await leaveApi.apply({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      setShowApplyModal(false);
      fetchLeaves();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to apply for leave");
    } finally { setIsSubmitting(false); }
  };

  const handleStatusUpdate = async (id: string, status: LeaveStatus) => {
    try {
      await leaveApi.updateStatus(id, status);
      fetchLeaves();
    } catch (error) { console.error("Failed to update leave status:", error); }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "APPROVED": return <Badge variant="success">Approved</Badge>;
      case "REJECTED": return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  if (isLoading && leaves.length === 0) {
    return <DashboardLayout><PageLoading message="Loading leave records..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Leave Management"
        description="Manage staff leave applications"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Leave" }]}
        actions={
          <Button onClick={openApplyModal}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Apply for Leave
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="py-4">
          <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {leaves.length === 0 && !isLoading ? (
            <EmptyState icon={<NoDataIcon />} title="No leave records" description="No leave applications found" action={<Button onClick={openApplyModal}>Apply for Leave</Button>} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <span className="font-medium">
                          {leave.staff?.user?.firstName} {leave.staff?.user?.lastName}
                        </span>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{leave.leaveType?.name || "N/A"}</Badge></TableCell>
                      <TableCell>{formatDate(leave.startDate)}</TableCell>
                      <TableCell>{formatDate(leave.endDate)}</TableCell>
                      <TableCell><span className="text-sm text-gray-500 max-w-xs truncate block">{leave.reason || "N/A"}</span></TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          {leave.status === "PENDING" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(leave.id, "APPROVED")}>
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(leave.id, "REJECTED")}>
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </Button>
                            </>
                          )}
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

      {/* Apply for Leave Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Leave" size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Select
            label="Leave Type"
            options={LEAVE_TYPE_OPTIONS}
            value={selectedLeaveType}
            onChange={(e) => { setSelectedLeaveType(e.target.value); setCustomLeaveType(""); }}
            required
          />
          {selectedLeaveType === "Others" && (
            <Input
              label="Specify Leave Type"
              value={customLeaveType}
              onChange={(e) => setCustomLeaveType(e.target.value)}
              placeholder="Enter leave type..."
              required
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          <Textarea label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowApplyModal(false)}>Cancel</Button>
          <Button onClick={handleApply} disabled={!isFormValid()} isLoading={isSubmitting}>Submit Application</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function LeavePage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "ACCOUNTANT", "SECRETARY"]}>
      <LeaveContent />
    </ProtectedRoute>
  );
}
