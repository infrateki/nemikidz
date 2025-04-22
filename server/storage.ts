import { 
  users, type User, type InsertUser,
  programs, type Program, type InsertProgram,
  parents, type Parent, type InsertParent,
  children, type Child, type InsertChild,
  enrollments, type Enrollment, type InsertEnrollment,
  payments, type Payment, type InsertPayment,
  activities, type Activity, type InsertActivity,
  attendance, type Attendance, type InsertAttendance,
  communications, type Communication, type InsertCommunication,
  inventory, type Inventory, type InsertInventory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, asc, lte, gte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Programs
  getProgram(id: number): Promise<Program | undefined>;
  getPrograms(limit?: number, offset?: number): Promise<Program[]>;
  getProgramsByStatus(status: string, limit?: number, offset?: number): Promise<Program[]>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, program: Partial<InsertProgram>): Promise<Program | undefined>;
  deleteProgram(id: number): Promise<boolean>;
  
  // Parents
  getParent(id: number): Promise<Parent | undefined>;
  getParents(limit?: number, offset?: number): Promise<Parent[]>;
  createParent(parent: InsertParent): Promise<Parent>;
  updateParent(id: number, parent: Partial<InsertParent>): Promise<Parent | undefined>;
  deleteParent(id: number): Promise<boolean>;
  
  // Children
  getChild(id: number): Promise<Child | undefined>;
  getChildren(limit?: number, offset?: number): Promise<Child[]>;
  getChildrenByParent(parentId: number): Promise<Child[]>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: number, child: Partial<InsertChild>): Promise<Child | undefined>;
  deleteChild(id: number): Promise<boolean>;
  
  // Enrollments
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getEnrollments(limit?: number, offset?: number): Promise<Enrollment[]>;
  getEnrollmentsByProgram(programId: number): Promise<Enrollment[]>;
  getEnrollmentsByChild(childId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;
  deleteEnrollment(id: number): Promise<boolean>;
  
  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPayments(limit?: number, offset?: number): Promise<Payment[]>;
  getPaymentsByEnrollment(enrollmentId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
  
  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(limit?: number, offset?: number): Promise<Activity[]>;
  getActivitiesByProgram(programId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Attendance
  getAttendance(id: number): Promise<Attendance | undefined>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  getAttendanceByChild(childId: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: number): Promise<boolean>;
  
  // Communications
  getCommunication(id: number): Promise<Communication | undefined>;
  getCommunications(limit?: number, offset?: number): Promise<Communication[]>;
  getCommunicationsByParent(parentId: number): Promise<Communication[]>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;
  updateCommunication(id: number, communication: Partial<InsertCommunication>): Promise<Communication | undefined>;
  deleteCommunication(id: number): Promise<boolean>;
  
  // Inventory
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  getInventory(limit?: number, offset?: number): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Statistics & Dashboard Data
  getActiveChildrenCount(): Promise<number>;
  getActiveProgramsCount(): Promise<number>;
  getMonthlyIncome(): Promise<string>;
  getTodayAttendanceStats(): Promise<{ present: number, total: number }>;
  
  // Session Store
  sessionStore: any; // Using any for session store type
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any for session store type
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateUser)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return true;
  }
  
  // Programs
  async getProgram(id: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }
  
  async getPrograms(limit = 100, offset = 0): Promise<Program[]> {
    return await db
      .select()
      .from(programs)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(programs.startDate));
  }
  
  async getProgramsByStatus(status: string, limit = 100, offset = 0): Promise<Program[]> {
    return await db
      .select()
      .from(programs)
      .where(eq(programs.status, status as any))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(programs.startDate));
  }
  
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db
      .insert(programs)
      .values(insertProgram)
      .returning();
    return program;
  }
  
  async updateProgram(id: number, updateProgram: Partial<InsertProgram>): Promise<Program | undefined> {
    const [program] = await db
      .update(programs)
      .set(updateProgram)
      .where(eq(programs.id, id))
      .returning();
    return program;
  }
  
  async deleteProgram(id: number): Promise<boolean> {
    await db
      .delete(programs)
      .where(eq(programs.id, id));
    return true;
  }
  
  // Parents
  async getParent(id: number): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent;
  }
  
  async getParents(limit = 100, offset = 0): Promise<Parent[]> {
    return await db
      .select()
      .from(parents)
      .limit(limit)
      .offset(offset);
  }
  
  async createParent(insertParent: InsertParent): Promise<Parent> {
    const [parent] = await db
      .insert(parents)
      .values(insertParent)
      .returning();
    return parent;
  }
  
  async updateParent(id: number, updateParent: Partial<InsertParent>): Promise<Parent | undefined> {
    const [parent] = await db
      .update(parents)
      .set(updateParent)
      .where(eq(parents.id, id))
      .returning();
    return parent;
  }
  
  async deleteParent(id: number): Promise<boolean> {
    await db
      .delete(parents)
      .where(eq(parents.id, id));
    return true;
  }
  
  // Children
  async getChild(id: number): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }
  
  async getChildren(limit = 100, offset = 0): Promise<Child[]> {
    return await db
      .select()
      .from(children)
      .limit(limit)
      .offset(offset);
  }
  
  async getChildrenByParent(parentId: number): Promise<Child[]> {
    return await db
      .select()
      .from(children)
      .where(eq(children.parentId, parentId));
  }
  
  async createChild(insertChild: InsertChild): Promise<Child> {
    const [child] = await db
      .insert(children)
      .values(insertChild)
      .returning();
    return child;
  }
  
  async updateChild(id: number, updateChild: Partial<InsertChild>): Promise<Child | undefined> {
    const [child] = await db
      .update(children)
      .set(updateChild)
      .where(eq(children.id, id))
      .returning();
    return child;
  }
  
  async deleteChild(id: number): Promise<boolean> {
    await db
      .delete(children)
      .where(eq(children.id, id));
    return true;
  }
  
  // Enrollments
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment;
  }
  
  async getEnrollments(limit = 100, offset = 0): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .limit(limit)
      .offset(offset);
  }
  
  async getEnrollmentsByProgram(programId: number): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.programId, programId));
  }
  
  async getEnrollmentsByChild(childId: number): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.childId, childId));
  }
  
  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(enrollments)
      .values(insertEnrollment)
      .returning();
    return enrollment;
  }
  
  async updateEnrollment(id: number, updateEnrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .update(enrollments)
      .set(updateEnrollment)
      .where(eq(enrollments.id, id))
      .returning();
    return enrollment;
  }
  
  async deleteEnrollment(id: number): Promise<boolean> {
    await db
      .delete(enrollments)
      .where(eq(enrollments.id, id));
    return true;
  }
  
  // Payments
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  
  async getPayments(limit = 100, offset = 0): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .limit(limit)
      .offset(offset);
  }
  
  async getPaymentsByEnrollment(enrollmentId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.enrollmentId, enrollmentId));
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }
  
  async updatePayment(id: number, updatePayment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updatePayment)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }
  
  async deletePayment(id: number): Promise<boolean> {
    await db
      .delete(payments)
      .where(eq(payments.id, id));
    return true;
  }
  
  // Activities
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }
  
  async getActivities(limit = 100, offset = 0): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .limit(limit)
      .offset(offset);
  }
  
  async getActivitiesByProgram(programId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.programId, programId));
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }
  
  async updateActivity(id: number, updateActivity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [activity] = await db
      .update(activities)
      .set(updateActivity)
      .where(eq(activities.id, id))
      .returning();
    return activity;
  }
  
  async deleteActivity(id: number): Promise<boolean> {
    await db
      .delete(activities)
      .where(eq(activities.id, id));
    return true;
  }
  
  // Attendance
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db.select().from(attendance).where(eq(attendance.id, id));
    return attendanceRecord;
  }
  
  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    // Format date as ISO string for comparison
    const formattedDate = date.toISOString().split('T')[0];
    return await db
      .select()
      .from(attendance)
      .where(sql`${attendance.date}::text LIKE ${formattedDate + '%'}`);
  }
  
  async getAttendanceByChild(childId: number): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.childId, childId));
  }
  
  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [attendanceRecord] = await db
      .insert(attendance)
      .values(insertAttendance)
      .returning();
    return attendanceRecord;
  }
  
  async updateAttendance(id: number, updateAttendance: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db
      .update(attendance)
      .set(updateAttendance)
      .where(eq(attendance.id, id))
      .returning();
    return attendanceRecord;
  }
  
  async deleteAttendance(id: number): Promise<boolean> {
    await db
      .delete(attendance)
      .where(eq(attendance.id, id));
    return true;
  }
  
  // Communications
  async getCommunication(id: number): Promise<Communication | undefined> {
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    return communication;
  }
  
  async getCommunications(limit = 100, offset = 0): Promise<Communication[]> {
    return await db
      .select()
      .from(communications)
      .limit(limit)
      .offset(offset);
  }
  
  async getCommunicationsByParent(parentId: number): Promise<Communication[]> {
    return await db
      .select()
      .from(communications)
      .where(eq(communications.parentId, parentId));
  }
  
  async createCommunication(insertCommunication: InsertCommunication): Promise<Communication> {
    const [communication] = await db
      .insert(communications)
      .values(insertCommunication)
      .returning();
    return communication;
  }
  
  async updateCommunication(id: number, updateCommunication: Partial<InsertCommunication>): Promise<Communication | undefined> {
    const [communication] = await db
      .update(communications)
      .set(updateCommunication)
      .where(eq(communications.id, id))
      .returning();
    return communication;
  }
  
  async deleteCommunication(id: number): Promise<boolean> {
    await db
      .delete(communications)
      .where(eq(communications.id, id));
    return true;
  }
  
  // Inventory
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }
  
  async getInventory(limit = 100, offset = 0): Promise<Inventory[]> {
    return await db
      .select()
      .from(inventory)
      .limit(limit)
      .offset(offset);
  }
  
  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const [item] = await db
      .insert(inventory)
      .values(insertItem)
      .returning();
    return item;
  }
  
  async updateInventoryItem(id: number, updateItem: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [item] = await db
      .update(inventory)
      .set(updateItem)
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    await db
      .delete(inventory)
      .where(eq(inventory.id, id));
    return true;
  }
  
  // Statistics & Dashboard Data
  async getActiveChildrenCount(): Promise<number> {
    // Count distinct children who have enrollments with completed payments
    const result = await db
      .select({ count: sql<number>`count(distinct ${enrollments.childId})` })
      .from(enrollments)
      .innerJoin(payments, eq(payments.enrollmentId, enrollments.id))
      .where(
        or(
          eq(enrollments.status, 'confirmed'),
          eq(payments.status, 'completed')
        )
      );
    
    return result[0]?.count || 0;
  }
  
  async getActiveProgramsCount(): Promise<number> {
    // Count programs that have enrollments with confirmed status or completed payments
    const result = await db
      .select({ count: sql<number>`count(distinct ${programs.id})` })
      .from(programs)
      .innerJoin(enrollments, eq(enrollments.programId, programs.id))
      .innerJoin(payments, eq(payments.enrollmentId, enrollments.id))
      .where(
        or(
          eq(enrollments.status, 'confirmed'),
          eq(payments.status, 'completed')
        )
      );
    
    return result[0]?.count || 0;
  }
  
  async getMonthlyIncome(): Promise<string> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const firstDayFormatted = firstDayOfMonth.toISOString().split('T')[0];
    const lastDayFormatted = lastDayOfMonth.toISOString().split('T')[0];
    
    const result = await db
      .select({ total: sql<string>`sum(${payments.amount})` })
      .from(payments)
      .where(and(
        sql`${payments.paymentDate}::text >= ${firstDayFormatted}`,
        sql`${payments.paymentDate}::text <= ${lastDayFormatted + ' 23:59:59'}`,
        eq(payments.status, 'completed')
      ));
    
    return result[0]?.total || '0.00';
  }
  
  async getTodayAttendanceStats(): Promise<{ present: number, total: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formattedDate = today.toISOString().split('T')[0];
    
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendance)
      .where(sql`${attendance.date}::text LIKE ${formattedDate + '%'}`);
    
    const presentResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendance)
      .where(and(
        sql`${attendance.date}::text LIKE ${formattedDate + '%'}`,
        eq(attendance.present, true)
      ));
    
    return {
      present: presentResult[0]?.count || 0,
      total: totalResult[0]?.count || 0
    };
  }
}

export const storage = new DatabaseStorage();
