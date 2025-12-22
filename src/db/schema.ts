import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  role: text("role").notNull().default("student"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const studentsTable = pgTable("students", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  cpf: text("cpf").notNull().unique(),
  phone: text("phone"),
  birthDate: timestamp("birth_date"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  enrollmentNumber: text("enrollment_number").notNull().unique(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const teachersTable = pgTable("teachers", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  cpf: text("cpf").notNull().unique(),
  phone: text("phone"),
  birthDate: timestamp("birth_date"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  specialization: text("specialization"),
  hireDate: timestamp("hire_date").notNull(),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const classroomsTable = pgTable("classrooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
  location: text("location"),
  description: text("description"),
  status: text("status").notNull().default("available"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const coursesTable = pgTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  duration: integer("duration"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  teacherId: text("teacher_id").references(() => teachersTable.id, {
    onDelete: "set null",
  }),
  classroomId: text("classroom_id").references(() => classroomsTable.id, {
    onDelete: "set null",
  }),
  schedule: text("schedule"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  enrollmentDate: timestamp("enrollment_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const attendanceTable = pgTable("attendance", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id")
    .notNull()
    .references(() => enrollmentsTable.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const assignmentsTable = pgTable("assignments", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  dueDate: timestamp("due_date").notNull(),
  maxGrade: numeric("max_grade", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const gradesTable = pgTable("grades", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id")
    .notNull()
    .references(() => enrollmentsTable.id, { onDelete: "cascade" }),
  assignmentId: text("assignment_id").references(() => assignmentsTable.id, {
    onDelete: "set null",
  }),
  grade: numeric("grade", { precision: 5, scale: 2 }).notNull(),
  type: text("type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const materialsTable = pgTable("materials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").default(0),
  unit: text("unit").notNull().default("unidade"),
  price: numeric("price", { precision: 10, scale: 2 }),
  supplier: text("supplier"),
  location: text("location"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const materialMovementsTable = pgTable("material_movements", {
  id: text("id").primaryKey(),
  materialId: text("material_id")
    .notNull()
    .references(() => materialsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull(),
});

export const invoicesTable = pgTable("invoices", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  enrollmentId: text("enrollment_id").references(() => enrollmentsTable.id, {
    onDelete: "set null",
  }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  status: text("status").notNull().default("pending"),
  barcode: text("barcode"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const financialTransactionsTable = pgTable("financial_transactions", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  status: text("status").notNull().default("pending"),
  studentId: text("student_id").references(() => studentsTable.id, {
    onDelete: "set null",
  }),
  teacherId: text("teacher_id").references(() => teachersTable.id, {
    onDelete: "set null",
  }),
  courseId: text("course_id").references(() => coursesTable.id, {
    onDelete: "set null",
  }),
  invoiceId: text("invoice_id").references(() => invoicesTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  referenceMonth: text("reference_month").notNull(),
  referenceYear: integer("reference_year").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
