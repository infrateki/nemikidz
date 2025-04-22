import { pgTable, text, serial, integer, decimal, date, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'staff']);
export const programStatusEnum = pgEnum('program_status', ['active', 'complete', 'cancelled', 'draft']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['pending', 'confirmed', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'transfer', 'card', 'other']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'refunded', 'failed']);
export const communicationTypeEnum = pgEnum('communication_type', ['email', 'sms', 'notification']);
export const communicationStatusEnum = pgEnum('communication_status', ['sent', 'read', 'failed']);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default('staff'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Programs Table
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  capacity: integer("capacity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: programStatusEnum("status").notNull().default('draft'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parents Table
export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  emergencyPhone: text("emergency_phone"),
  neighborhood: text("neighborhood"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Children Table
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: date("birth_date").notNull(),
  age: integer("age"),
  allergies: text("allergies"),
  medicalNotes: text("medical_notes"),
  interests: text("interests"),
  parentId: integer("parent_id").notNull().references(() => parents.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enrollments Table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => programs.id),
  childId: integer("child_id").notNull().references(() => children.id),
  status: enrollmentStatusEnum("status").notNull().default('pending'),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  enrollmentDate: date("enrollment_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments Table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => enrollments.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default('pending'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities Table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => programs.id),
  name: text("name").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance Table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => children.id),
  date: date("date").notNull(),
  present: boolean("present").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communications Table
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => parents.id),
  type: communicationTypeEnum("type").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  date: date("date").notNull(),
  status: communicationStatusEnum("status").notNull().default('sent'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory Table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  category: text("category"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const programsRelations = relations(programs, ({ many }) => ({
  enrollments: many(enrollments),
  activities: many(activities),
}));

export const parentsRelations = relations(parents, ({ many }) => ({
  children: many(children),
  communications: many(communications),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  parent: one(parents, {
    fields: [children.parentId],
    references: [parents.id],
  }),
  enrollments: many(enrollments),
  attendance: many(attendance),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  program: one(programs, {
    fields: [enrollments.programId],
    references: [programs.id],
  }),
  child: one(children, {
    fields: [enrollments.childId],
    references: [children.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [payments.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  program: one(programs, {
    fields: [activities.programId],
    references: [programs.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  child: one(children, {
    fields: [attendance.childId],
    references: [children.id],
  }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  parent: one(parents, {
    fields: [communications.parentId],
    references: [parents.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParentSchema = createInsertSchema(parents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChildSchema = createInsertSchema(children).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

export type InsertParent = z.infer<typeof insertParentSchema>;
export type Parent = typeof parents.$inferSelect;

export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Communication = typeof communications.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
