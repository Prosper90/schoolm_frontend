"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
import { accountsApi } from "@/lib/services/accounts";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Income, Expense, IncomeHead, ExpenseHead, IncomeFormData, ExpenseFormData } from "@/types";

function AccountsContent() {
  const [activeTab, setActiveTab] = useState<"income" | "expenses">("income");
  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [incomeHeads, setIncomeHeads] = useState<IncomeHead[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<ExpenseHead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [incomePagination, setIncomePagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [expensePagination, setExpensePagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [incomeForm, setIncomeForm] = useState<IncomeFormData>({ incomeHeadId: "", amount: 0, date: new Date().toISOString().split("T")[0], description: "", invoiceNumber: "" });
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({ expenseHeadId: "", amount: 0, date: new Date().toISOString().split("T")[0], description: "", invoiceNumber: "" });

  useEffect(() => {
    const loadHeads = async () => {
      try {
        const [incomeHeadsRes, expenseHeadsRes] = await Promise.all([
          accountsApi.getIncomeHeads().catch(() => null),
          accountsApi.getExpenseHeads().catch(() => null),
        ]);
        if (incomeHeadsRes?.data) {
          const heads = Array.isArray(incomeHeadsRes.data) ? incomeHeadsRes.data : [];
          setIncomeHeads(heads);
        }
        if (expenseHeadsRes?.data) {
          const heads = Array.isArray(expenseHeadsRes.data) ? expenseHeadsRes.data : [];
          setExpenseHeads(heads);
        }
      } catch (error) { console.error("Failed to load heads:", error); }
    };
    loadHeads();
  }, []);

  const fetchIncome = async () => {
    setIsLoading(true);
    try {
      const response = await accountsApi.getAllIncome({ page: incomePagination.page, limit: incomePagination.limit });
      if (response?.data) {
        setIncomeList(response.data.income || []);
        setTotalIncome(response.data.summary?.totalIncome || 0);
        setIncomePagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) { console.error("Failed to fetch income:", error); setIncomeList([]); } finally { setIsLoading(false); }
  };

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await accountsApi.getAllExpenses({ page: expensePagination.page, limit: expensePagination.limit });
      if (response?.data) {
        setExpenseList(response.data.expenses || []);
        setTotalExpense(response.data.summary?.totalExpense || 0);
        setExpensePagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) { console.error("Failed to fetch expenses:", error); setExpenseList([]); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "income") fetchIncome();
    else fetchExpenses();
  }, [activeTab, incomePagination.page, expensePagination.page]);

  const handleRecordIncome = async () => {
    if (!incomeForm.incomeHeadId || !incomeForm.amount || !incomeForm.date) return;
    setIsSubmitting(true);
    setError("");
    try {
      await accountsApi.recordIncome(incomeForm);
      setShowIncomeModal(false);
      setIncomeForm({ incomeHeadId: "", amount: 0, date: new Date().toISOString().split("T")[0], description: "", invoiceNumber: "" });
      fetchIncome();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to record income");
    } finally { setIsSubmitting(false); }
  };

  const handleRecordExpense = async () => {
    if (!expenseForm.expenseHeadId || !expenseForm.amount || !expenseForm.date) return;
    setIsSubmitting(true);
    setError("");
    try {
      await accountsApi.recordExpense(expenseForm);
      setShowExpenseModal(false);
      setExpenseForm({ expenseHeadId: "", amount: 0, date: new Date().toISOString().split("T")[0], description: "", invoiceNumber: "" });
      fetchExpenses();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to record expense");
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm("Delete this income record?")) return;
    try { await accountsApi.deleteIncome(id); fetchIncome(); } catch (error) { console.error("Failed to delete:", error); }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Delete this expense record?")) return;
    try { await accountsApi.deleteExpense(id); fetchExpenses(); } catch (error) { console.error("Failed to delete:", error); }
  };

  const incomeHeadOptions = [{ value: "", label: "Select Income Head" }, ...incomeHeads.map((h) => ({ value: h.id, label: h.name }))];
  const expenseHeadOptions = [{ value: "", label: "Select Expense Head" }, ...expenseHeads.map((h) => ({ value: h.id, label: h.name }))];

  if (isLoading && incomeList.length === 0 && expenseList.length === 0) {
    return <DashboardLayout><PageLoading message="Loading accounts..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Accounts"
        description="Manage income and expenses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Accounts" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setError(""); setShowExpenseModal(true); }}>Record Expense</Button>
            <Button onClick={() => { setError(""); setShowIncomeModal(true); }}>Record Income</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Net Balance</p>
            <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(totalIncome - totalExpense)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === "income" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("income")}>Income</button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === "expenses" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("expenses")}>Expenses</button>
        </div>
      </div>

      {activeTab === "income" ? (
        <Card>
          <CardContent className="p-0">
            {incomeList.length === 0 && !isLoading ? (
              <EmptyState icon={<NoDataIcon />} title="No income records" description="Record your first income" action={<Button onClick={() => setShowIncomeModal(true)}>Record Income</Button>} />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Income Head</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeList.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>{formatDate(income.date)}</TableCell>
                        <TableCell><Badge variant="success">{income.incomeHead?.name || "N/A"}</Badge></TableCell>
                        <TableCell><span className="text-sm text-gray-500">{income.description || "N/A"}</span></TableCell>
                        <TableCell><span className="font-mono text-sm">{income.invoiceNumber || "N/A"}</span></TableCell>
                        <TableCell><span className="font-semibold text-green-600">{formatCurrency(income.amount)}</span></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteIncome(income.id)}>
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {incomePagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <Pagination currentPage={incomePagination.page} totalPages={incomePagination.pages} onPageChange={(page) => setIncomePagination((prev) => ({ ...prev, page }))} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {expenseList.length === 0 && !isLoading ? (
              <EmptyState icon={<NoDataIcon />} title="No expense records" description="Record your first expense" action={<Button onClick={() => setShowExpenseModal(true)}>Record Expense</Button>} />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Expense Head</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseList.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell><Badge variant="danger">{expense.expenseHead?.name || "N/A"}</Badge></TableCell>
                        <TableCell><span className="text-sm text-gray-500">{expense.description || "N/A"}</span></TableCell>
                        <TableCell><span className="font-mono text-sm">{expense.invoiceNumber || "N/A"}</span></TableCell>
                        <TableCell><span className="font-semibold text-red-600">{formatCurrency(expense.amount)}</span></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {expensePagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <Pagination currentPage={expensePagination.page} totalPages={expensePagination.pages} onPageChange={(page) => setExpensePagination((prev) => ({ ...prev, page }))} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showIncomeModal} onClose={() => setShowIncomeModal(false)} title="Record Income" size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Select label="Income Head" options={incomeHeadOptions} value={incomeForm.incomeHeadId} onChange={(e) => setIncomeForm((prev) => ({ ...prev, incomeHeadId: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (UGX)" type="number" value={incomeForm.amount || ""} onChange={(e) => setIncomeForm((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }))} required />
            <Input label="Date" type="date" value={incomeForm.date} onChange={(e) => setIncomeForm((prev) => ({ ...prev, date: e.target.value }))} required />
          </div>
          <Input label="Invoice Number" value={incomeForm.invoiceNumber || ""} onChange={(e) => setIncomeForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))} />
          <Textarea label="Description" value={incomeForm.description || ""} onChange={(e) => setIncomeForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowIncomeModal(false)}>Cancel</Button>
          <Button onClick={handleRecordIncome} disabled={!incomeForm.incomeHeadId || !incomeForm.amount} isLoading={isSubmitting}>Record Income</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Record Expense" size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Select label="Expense Head" options={expenseHeadOptions} value={expenseForm.expenseHeadId} onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseHeadId: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (UGX)" type="number" value={expenseForm.amount || ""} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }))} required />
            <Input label="Date" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))} required />
          </div>
          <Input label="Invoice Number" value={expenseForm.invoiceNumber || ""} onChange={(e) => setExpenseForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))} />
          <Textarea label="Description" value={expenseForm.description || ""} onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
          <Button onClick={handleRecordExpense} disabled={!expenseForm.expenseHeadId || !expenseForm.amount} isLoading={isSubmitting}>Record Expense</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function AccountsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"]}>
      <AccountsContent />
    </ProtectedRoute>
  );
}
