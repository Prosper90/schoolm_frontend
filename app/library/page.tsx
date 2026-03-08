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
import { Alert } from "@/components/ui/Alert";
import { libraryApi } from "@/lib/services/library";
import { studentsApi } from "@/lib/services/students";
import { formatDate } from "@/lib/utils";
import { Book, BookIssue, BookFormData, BookIssueFormData, Student } from "@/types";
import { debounce } from "@/lib/utils";

function LibraryContent() {
  const [activeTab, setActiveTab] = useState<"books" | "issues">("books");
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState("");
  const [showBookModal, setShowBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookPagination, setBookPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [issuePagination, setIssuePagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [bookForm, setBookForm] = useState<BookFormData>({ title: "", author: "", isbn: "", publisher: "", category: "", quantity: 1 });
  const [issueForm, setIssueForm] = useState<BookIssueFormData>({ bookId: "", studentId: "", dueDate: "" });
  const [studentOptions, setStudentOptions] = useState<{ value: string; label: string }[]>([{ value: "", label: "Select Student" }]);
  const [bookOptions, setBookOptions] = useState<{ value: string; label: string }[]>([{ value: "", label: "Select Book" }]);

  const issueStatusOptions = [
    { value: "", label: "All Status" },
    { value: "ISSUED", label: "Issued" },
    { value: "RETURNED", label: "Returned" },
    { value: "OVERDUE", label: "Overdue" },
  ];

  const fetchBooks = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const response = await libraryApi.getBooks({ page: bookPagination.page, limit: bookPagination.limit, search: searchTerm || undefined });
      if (response?.data) {
        setBooks(response.data.books || []);
        setBookPagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) { console.error("Failed to fetch books:", error); setBooks([]); } finally { setIsLoading(false); }
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const response = await libraryApi.getIssues({ page: issuePagination.page, limit: issuePagination.limit, status: issueStatusFilter || undefined });
      if (response?.data) {
        setIssues(response.data.issues || []);
        setIssuePagination((prev) => ({ ...prev, total: response.data?.pagination?.total || 0, pages: response.data?.pagination?.pages || 0 }));
      }
    } catch (error) { console.error("Failed to fetch issues:", error); setIssues([]); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "books") fetchBooks(search);
    else fetchIssues();
  }, [activeTab, bookPagination.page, issuePagination.page, issueStatusFilter]);

  useEffect(() => {
    if (activeTab === "books") {
      const debouncedSearch = debounce(() => {
        setBookPagination((prev) => ({ ...prev, page: 1 }));
        fetchBooks(search);
      }, 300);
      debouncedSearch();
    }
  }, [search]);

  const loadIssueDropdowns = async () => {
    try {
      const [studentsRes, booksRes] = await Promise.all([
        studentsApi.getAll({ limit: 200 }).catch(() => null),
        libraryApi.getBooks({ limit: 200 }).catch(() => null),
      ]);
      if (studentsRes?.data?.students) {
        setStudentOptions([
          { value: "", label: "Select Student" },
          ...studentsRes.data.students.map((s: Student) => ({ value: s.id, label: `${s.user?.firstName} ${s.user?.lastName} (${s.admissionNumber || ""})` })),
        ]);
      }
      if (booksRes?.data?.books) {
        setBookOptions([
          { value: "", label: "Select Book" },
          ...booksRes.data.books.filter((b: Book) => b.available > 0).map((b: Book) => ({ value: b.id, label: `${b.title} (${b.available} available)` })),
        ]);
      }
    } catch (error) { console.error("Failed to load dropdowns:", error); }
  };

  const openAddBookModal = () => {
    setEditingBook(null);
    setBookForm({ title: "", author: "", isbn: "", publisher: "", category: "", quantity: 1 });
    setError("");
    setShowBookModal(true);
  };

  const openEditBookModal = (book: Book) => {
    setEditingBook(book);
    setBookForm({ title: book.title, author: book.author || "", isbn: book.isbn || "", publisher: book.publisher || "", category: book.category || "", quantity: book.quantity });
    setError("");
    setShowBookModal(true);
  };

  const openIssueModal = () => {
    setIssueForm({ bookId: "", studentId: "", dueDate: "" });
    setError("");
    loadIssueDropdowns();
    setShowIssueModal(true);
  };

  const handleBookSubmit = async () => {
    if (!bookForm.title || !bookForm.author) return;
    setIsSubmitting(true);
    setError("");
    try {
      if (editingBook) {
        await libraryApi.updateBook(editingBook.id, bookForm);
      } else {
        await libraryApi.addBook(bookForm);
      }
      setShowBookModal(false);
      fetchBooks(search);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to save book");
    } finally { setIsSubmitting(false); }
  };

  const handleIssueSubmit = async () => {
    if (!issueForm.bookId || !issueForm.studentId || !issueForm.dueDate) return;
    setIsSubmitting(true);
    setError("");
    try {
      await libraryApi.issueBook(issueForm);
      setShowIssueModal(false);
      fetchIssues();
      setActiveTab("issues");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to issue book");
    } finally { setIsSubmitting(false); }
  };

  const handleReturnBook = async (issueId: string) => {
    if (!confirm("Confirm return of this book?")) return;
    try {
      await libraryApi.returnBook(issueId);
      fetchIssues();
    } catch (error) { console.error("Failed to return book:", error); }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try { await libraryApi.deleteBook(id); fetchBooks(search); } catch (error) { console.error("Failed to delete book:", error); }
  };

  if (isLoading && books.length === 0 && issues.length === 0) {
    return <DashboardLayout><PageLoading message="Loading library..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Library"
        description="Manage books and book issues"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Library" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openIssueModal}>Issue Book</Button>
            <Button onClick={openAddBookModal}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Book
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === "books" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("books")}>Books Catalog</button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === "issues" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("issues")}>Issued Books</button>
        </div>
      </div>

      {activeTab === "books" ? (
        <>
          <Card className="mb-6">
            <CardContent className="py-4">
              <Input placeholder="Search books..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              {books.length === 0 && !isLoading ? (
                <EmptyState icon={<NoDataIcon />} title="No books found" description="Add books to the library" action={<Button onClick={openAddBookModal}>Add Book</Button>} />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>ISBN</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell><span className="font-medium">{book.title}</span></TableCell>
                          <TableCell>{book.author || "N/A"}</TableCell>
                          <TableCell><span className="font-mono text-sm">{book.isbn || "N/A"}</span></TableCell>
                          <TableCell>{book.category ? <Badge variant="secondary">{book.category}</Badge> : "N/A"}</TableCell>
                          <TableCell>{book.quantity}</TableCell>
                          <TableCell><Badge variant={book.available > 0 ? "success" : "danger"}>{book.available}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditBookModal(book)}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteBook(book.id)}>
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {bookPagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <Pagination currentPage={bookPagination.page} totalPages={bookPagination.pages} onPageChange={(page) => setBookPagination((prev) => ({ ...prev, page }))} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="py-4">
              <Select options={issueStatusOptions} value={issueStatusFilter} onChange={(e) => setIssueStatusFilter(e.target.value)} className="max-w-xs" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              {issues.length === 0 && !isLoading ? (
                <EmptyState icon={<NoDataIcon />} title="No issued books" description="Issue a book to get started" action={<Button onClick={openIssueModal}>Issue Book</Button>} />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell><span className="font-medium">{issue.book?.title || "N/A"}</span></TableCell>
                          <TableCell>{formatDate(issue.issueDate)}</TableCell>
                          <TableCell>{formatDate(issue.dueDate)}</TableCell>
                          <TableCell>{issue.returnDate ? formatDate(issue.returnDate) : "—"}</TableCell>
                          <TableCell>
                            <Badge variant={issue.status === "RETURNED" ? "success" : issue.status === "OVERDUE" ? "danger" : "warning"}>
                              {issue.status || "ISSUED"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              {(!issue.returnDate && issue.status !== "RETURNED") && (
                                <Button variant="outline" size="sm" onClick={() => handleReturnBook(issue.id)}>Return</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {issuePagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <Pagination currentPage={issuePagination.page} totalPages={issuePagination.pages} onPageChange={(page) => setIssuePagination((prev) => ({ ...prev, page }))} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title={editingBook ? "Edit Book" : "Add Book"} size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Input label="Title" value={bookForm.title} onChange={(e) => setBookForm((prev) => ({ ...prev, title: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Author" value={bookForm.author} onChange={(e) => setBookForm((prev) => ({ ...prev, author: e.target.value }))} required />
            <Input label="ISBN" value={bookForm.isbn} onChange={(e) => setBookForm((prev) => ({ ...prev, isbn: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Publisher" value={bookForm.publisher || ""} onChange={(e) => setBookForm((prev) => ({ ...prev, publisher: e.target.value }))} />
            <Input label="Category" value={bookForm.category || ""} onChange={(e) => setBookForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="e.g., Fiction, Science" />
          </div>
          <Input label="Quantity" type="number" value={bookForm.quantity} onChange={(e) => setBookForm((prev) => ({ ...prev, quantity: Number(e.target.value) || 1 }))} min={1} />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBookModal(false)}>Cancel</Button>
          <Button onClick={handleBookSubmit} disabled={!bookForm.title || !bookForm.author} isLoading={isSubmitting}>{editingBook ? "Update" : "Add"} Book</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} title="Issue Book" size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger" onClose={() => setError("")}>{error}</Alert>}
          <Select label="Book" options={bookOptions} value={issueForm.bookId} onChange={(e) => setIssueForm((prev) => ({ ...prev, bookId: e.target.value }))} required />
          <Select label="Student" options={studentOptions} value={issueForm.studentId} onChange={(e) => setIssueForm((prev) => ({ ...prev, studentId: e.target.value }))} required />
          <Input label="Due Date" type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm((prev) => ({ ...prev, dueDate: e.target.value }))} required />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowIssueModal(false)}>Cancel</Button>
          <Button onClick={handleIssueSubmit} disabled={!issueForm.bookId || !issueForm.studentId || !issueForm.dueDate} isLoading={isSubmitting}>Issue Book</Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}

export default function LibraryPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "SECRETARY"]}>
      <LibraryContent />
    </ProtectedRoute>
  );
}
