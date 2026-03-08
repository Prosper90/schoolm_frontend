// User Roles
export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "ACCOUNTANT"
  | "SECRETARY"
  | "COOK"
  | "OTHER_STAFF"
  | "STUDENT";

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  schoolId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  schoolName: string;
  schoolEmail: string;
  schoolPhone: string;
  address?: string;
  district?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

// School Types
export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Student Types
export interface Student {
  id: string;
  userId: string;
  schoolId: string;
  classId?: string;
  guardianId?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  admissionNumber?: string;
  rollNumber?: string;
  category?: string;
  religion?: string;
  bloodGroup?: string;
  address?: string;
  totalFeesRequired?: number;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  class?: Class;
  guardian?: Guardian;
  _count?: {
    payments: number;
  };
}

// Teacher Types
export interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  departmentId?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  joiningDate?: string;
  salary?: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  department?: Department;
  subjects?: Subject[];
}

// Staff Types
export interface Staff {
  id: string;
  userId: string;
  schoolId: string;
  departmentId?: string;
  position?: string;
  salary?: number;
  joiningDate?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  department?: Department;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  section?: string;
  schoolId: string;
  teacherId?: string;
  capacity?: number;
  feesAmount?: number;
  createdAt: string;
  updatedAt: string;
  teacher?: Teacher;
  _count?: {
    students: number;
    subjects: number;
  };
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

// Guardian Types
export interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  relationship: string;
  occupation?: string;
  address?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
  };
}

// Department Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    staff: number;
  };
}

// Payment Types
export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentMethod?: string;
  term?: string;
  academicYear?: string;
  receiptNumber?: string;
  notes?: string;
  recordedBy?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
}

// Attendance Types
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  schoolId: string;
  createdAt: string;
  student?: Student;
}

// Exam Types
export interface Exam {
  id: string;
  name: string;
  term: string;
  academicYear: string;
  startDate?: string;
  endDate?: string;
  schoolId: string;
  classId?: string;
  createdAt: string;
  updatedAt: string;
  class?: Class;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  remarks?: string;
  createdAt: string;
  exam?: Exam;
  student?: Student;
  subject?: Subject;
}

// Book/Library Types
export interface Book {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  category?: string;
  quantity: number;
  available: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  userId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
  status?: string;
  book?: Book;
}

// Leave Types
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
}

export interface Leave {
  id: string;
  staffId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  createdAt: string;
  leaveType?: LeaveType;
  staff?: Staff;
}

// Account/Finance Types
export type TransactionType = "INCOME" | "EXPENSE";

export interface Account {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
  date: string;
  recordedBy?: string;
  schoolId: string;
  createdAt: string;
}

export interface IncomeHead {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseHead {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  incomeHeadId: string;
  amount: number;
  date: string;
  description?: string;
  invoiceNumber?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  incomeHead?: IncomeHead;
}

export interface Expense {
  id: string;
  expenseHeadId: string;
  amount: number;
  date: string;
  description?: string;
  invoiceNumber?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  expenseHead?: ExpenseHead;
}

export interface ExamSchedule {
  id: string;
  examId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  createdAt: string;
  exam?: Exam;
  subject?: Subject;
}

export interface SubjectAssignment {
  id: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  subject?: Subject;
  class?: Class;
  teacher?: Staff;
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalClasses: number;
  totalRevenue: number;
  totalExpenses: number;
  pendingFees: number;
  attendanceRate: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface PaginationData<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Protected Route Types
export interface ProtectedRouteConfig {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

// Form Types
export interface StudentFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  classId?: string;
  guardianId?: string;
  admissionNumber?: string;
  rollNumber?: string;
  category?: string;
  religion?: string;
  bloodGroup?: string;
  address?: string;
  totalFeesRequired?: number;
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  departmentId?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  joiningDate?: string;
  salary?: number;
}

export interface PaymentFormData {
  studentId: string;
  amount: number;
  paymentMethod?: string;
  paymentFor?: string;
  term?: string;
  academicYear?: string;
  notes?: string;
}

export interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  position: string;
  dateHired: string;
  departmentId?: string;
  salary?: number;
  qualification?: string;
  experience?: number;
}

export interface SubjectFormData {
  name: string;
  code: string;
  description?: string;
  level: string;
}

export interface GuardianFormData {
  firstName: string;
  lastName: string;
  phone: string;
  relationship: string;
  email?: string;
  occupation?: string;
  address?: string;
}

export interface DepartmentFormData {
  name: string;
  code: string;
  description?: string;
}

export interface SchoolFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  level: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface ClassFormData {
  name: string;
  grade?: string;
  stream?: string;
  level?: string;
  classTeacherId?: string;
  capacity?: number;
  feesAmount?: number;
}

export interface ExamFormData {
  name: string;
  term: string;
  academicYear: string;
  startDate?: string;
  endDate?: string;
  classId?: string;
}

export interface ExamScheduleFormData {
  examId: string;
  classId: string;
  subjectId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface ExamResultFormData {
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  totalMarks?: number;
  grade?: string;
  remarks?: string;
}

export interface AttendanceFormData {
  studentId: string;
  status: AttendanceStatus;
  date?: string;
  remarks?: string;
}

export interface BulkAttendanceFormData {
  classId: string;
  date: string;
  attendanceRecords: {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}

export interface LeaveFormData {
  leaveTypeId?: string;
  leaveType?: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveTypeFormData {
  name: string;
  description?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  category?: string;
  quantity: number;
}

export interface BookIssueFormData {
  bookId: string;
  studentId: string;
  dueDate: string;
}

export interface IncomeFormData {
  incomeHeadId: string;
  amount: number;
  date: string;
  description?: string;
  invoiceNumber?: string;
}

export interface ExpenseFormData {
  expenseHeadId: string;
  amount: number;
  date: string;
  description?: string;
  invoiceNumber?: string;
}

export interface SubjectAssignmentFormData {
  subjectId: string;
  classId: string;
  teacherId: string;
}
