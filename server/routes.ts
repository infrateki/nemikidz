import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { eq } from "drizzle-orm";
import { zodMiddleware } from "./middleware";
import {
  insertProgramSchema,
  insertParentSchema,
  insertChildSchema,
  insertEnrollmentSchema,
  insertPaymentSchema,
  insertActivitySchema,
  insertAttendanceSchema,
  insertCommunicationSchema,
  insertInventorySchema
} from "@shared/schema";

export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Dashboard data
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
      const childrenCount = await storage.getActiveChildrenCount();
      const programsCount = await storage.getActiveProgramsCount();
      const monthlyIncome = await storage.getMonthlyIncome();
      const attendanceStats = await storage.getTodayAttendanceStats();
      
      const activePrograms = await storage.getProgramsByStatus('active', 3);
      const upcomingPrograms = await storage.getPrograms(10);
      
      res.json({
        stats: {
          childrenCount,
          activePrograms: programsCount,
          monthlyIncome,
          todayAttendance: attendanceStats
        },
        activePrograms,
        upcomingPrograms
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Error fetching dashboard data" });
    }
  });

  // Programs
  app.get("/api/programs", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const programs = await storage.getPrograms(limit, offset);
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching programs" });
    }
  });
  
  app.get("/api/programs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const program = await storage.getProgram(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Error fetching program" });
    }
  });
  
  app.post("/api/programs", requireAuth, zodMiddleware(insertProgramSchema), async (req, res) => {
    try {
      const program = await storage.createProgram(req.body);
      res.status(201).json(program);
    } catch (error) {
      res.status(500).json({ message: "Error creating program" });
    }
  });
  
  app.put("/api/programs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedProgram = await storage.updateProgram(id, req.body);
      if (!updatedProgram) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(updatedProgram);
    } catch (error) {
      res.status(500).json({ message: "Error updating program" });
    }
  });
  
  app.delete("/api/programs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProgram(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting program" });
    }
  });

  // Parents
  app.get("/api/parents", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const parents = await storage.getParents(limit, offset);
      res.json(parents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching parents" });
    }
  });
  
  app.get("/api/parents/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parent = await storage.getParent(id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      res.json(parent);
    } catch (error) {
      res.status(500).json({ message: "Error fetching parent" });
    }
  });
  
  app.post("/api/parents", requireAuth, zodMiddleware(insertParentSchema), async (req, res) => {
    try {
      const parent = await storage.createParent(req.body);
      res.status(201).json(parent);
    } catch (error) {
      res.status(500).json({ message: "Error creating parent" });
    }
  });
  
  app.put("/api/parents/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedParent = await storage.updateParent(id, req.body);
      if (!updatedParent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      res.json(updatedParent);
    } catch (error) {
      res.status(500).json({ message: "Error updating parent" });
    }
  });
  
  app.delete("/api/parents/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteParent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting parent" });
    }
  });

  // Children
  app.get("/api/children", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      
      const children = parentId 
        ? await storage.getChildrenByParent(parentId)
        : await storage.getChildren(limit, offset);
        
      res.json(children);
    } catch (error) {
      res.status(500).json({ message: "Error fetching children" });
    }
  });
  
  app.get("/api/children/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const child = await storage.getChild(id);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      res.json(child);
    } catch (error) {
      res.status(500).json({ message: "Error fetching child" });
    }
  });
  
  app.post("/api/children", requireAuth, zodMiddleware(insertChildSchema), async (req, res) => {
    try {
      const child = await storage.createChild(req.body);
      res.status(201).json(child);
    } catch (error) {
      res.status(500).json({ message: "Error creating child" });
    }
  });
  
  app.put("/api/children/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedChild = await storage.updateChild(id, req.body);
      if (!updatedChild) {
        return res.status(404).json({ message: "Child not found" });
      }
      res.json(updatedChild);
    } catch (error) {
      res.status(500).json({ message: "Error updating child" });
    }
  });
  
  app.delete("/api/children/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChild(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting child" });
    }
  });

  // Enrollments
  app.get("/api/enrollments", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;
      const childId = req.query.childId ? parseInt(req.query.childId as string) : undefined;
      
      let enrollments;
      if (programId) {
        enrollments = await storage.getEnrollmentsByProgram(programId);
      } else if (childId) {
        enrollments = await storage.getEnrollmentsByChild(childId);
      } else {
        enrollments = await storage.getEnrollments(limit, offset);
      }
      
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching enrollments" });
    }
  });
  
  app.get("/api/enrollments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const enrollment = await storage.getEnrollment(id);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      res.json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching enrollment" });
    }
  });
  
  app.post("/api/enrollments", requireAuth, zodMiddleware(insertEnrollmentSchema), async (req, res) => {
    try {
      const enrollment = await storage.createEnrollment(req.body);
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Error creating enrollment" });
    }
  });
  
  app.put("/api/enrollments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedEnrollment = await storage.updateEnrollment(id, req.body);
      if (!updatedEnrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      res.json(updatedEnrollment);
    } catch (error) {
      res.status(500).json({ message: "Error updating enrollment" });
    }
  });
  
  app.delete("/api/enrollments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEnrollment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting enrollment" });
    }
  });

  // Payments
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const enrollmentId = req.query.enrollmentId ? parseInt(req.query.enrollmentId as string) : undefined;
      
      const payments = enrollmentId
        ? await storage.getPaymentsByEnrollment(enrollmentId)
        : await storage.getPayments(limit, offset);
        
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payments" });
    }
  });
  
  app.get("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment" });
    }
  });
  
  app.post("/api/payments", requireAuth, zodMiddleware(insertPaymentSchema), async (req, res) => {
    try {
      const payment = await storage.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Error creating payment" });
    }
  });
  
  app.put("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedPayment = await storage.updatePayment(id, req.body);
      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: "Error updating payment" });
    }
  });
  
  app.delete("/api/payments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePayment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting payment" });
    }
  });

  // Activities
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;
      
      const activities = programId
        ? await storage.getActivitiesByProgram(programId)
        : await storage.getActivities(limit, offset);
        
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities" });
    }
  });
  
  app.get("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activity" });
    }
  });
  
  app.post("/api/activities", requireAuth, zodMiddleware(insertActivitySchema), async (req, res) => {
    try {
      const activity = await storage.createActivity(req.body);
      res.status(201).json(activity);
    } catch (error) {
      res.status(500).json({ message: "Error creating activity" });
    }
  });
  
  app.put("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedActivity = await storage.updateActivity(id, req.body);
      if (!updatedActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(updatedActivity);
    } catch (error) {
      res.status(500).json({ message: "Error updating activity" });
    }
  });
  
  app.delete("/api/activities/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteActivity(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting activity" });
    }
  });

  // Attendance
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const childId = req.query.childId ? parseInt(req.query.childId as string) : undefined;
      
      let attendanceRecords;
      if (date) {
        attendanceRecords = await storage.getAttendanceByDate(date);
      } else if (childId) {
        attendanceRecords = await storage.getAttendanceByChild(childId);
      } else {
        return res.status(400).json({ message: "Either date or childId parameter is required" });
      }
      
      res.json(attendanceRecords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching attendance records" });
    }
  });
  
  app.get("/api/attendance/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const attendanceRecord = await storage.getAttendance(id);
      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(attendanceRecord);
    } catch (error) {
      res.status(500).json({ message: "Error fetching attendance record" });
    }
  });
  
  app.post("/api/attendance", requireAuth, zodMiddleware(insertAttendanceSchema), async (req, res) => {
    try {
      const attendanceRecord = await storage.createAttendance(req.body);
      res.status(201).json(attendanceRecord);
    } catch (error) {
      res.status(500).json({ message: "Error creating attendance record" });
    }
  });
  
  app.put("/api/attendance/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedAttendance = await storage.updateAttendance(id, req.body);
      if (!updatedAttendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(updatedAttendance);
    } catch (error) {
      res.status(500).json({ message: "Error updating attendance record" });
    }
  });
  
  app.delete("/api/attendance/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAttendance(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting attendance record" });
    }
  });

  // Communications
  app.get("/api/communications", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      
      const communications = parentId
        ? await storage.getCommunicationsByParent(parentId)
        : await storage.getCommunications(limit, offset);
        
      res.json(communications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching communications" });
    }
  });
  
  app.get("/api/communications/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const communication = await storage.getCommunication(id);
      if (!communication) {
        return res.status(404).json({ message: "Communication not found" });
      }
      res.json(communication);
    } catch (error) {
      res.status(500).json({ message: "Error fetching communication" });
    }
  });
  
  app.post("/api/communications", requireAuth, zodMiddleware(insertCommunicationSchema), async (req, res) => {
    try {
      const communication = await storage.createCommunication(req.body);
      res.status(201).json(communication);
    } catch (error) {
      res.status(500).json({ message: "Error creating communication" });
    }
  });
  
  app.put("/api/communications/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedCommunication = await storage.updateCommunication(id, req.body);
      if (!updatedCommunication) {
        return res.status(404).json({ message: "Communication not found" });
      }
      res.json(updatedCommunication);
    } catch (error) {
      res.status(500).json({ message: "Error updating communication" });
    }
  });
  
  app.delete("/api/communications/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCommunication(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting communication" });
    }
  });

  // Inventory
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const inventory = await storage.getInventory(limit, offset);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory" });
    }
  });
  
  app.get("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getInventoryItem(id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory item" });
    }
  });
  
  app.post("/api/inventory", requireAuth, zodMiddleware(insertInventorySchema), async (req, res) => {
    try {
      const item = await storage.createInventoryItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Error creating inventory item" });
    }
  });
  
  app.put("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedItem = await storage.updateInventoryItem(id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating inventory item" });
    }
  });
  
  app.delete("/api/inventory/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInventoryItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting inventory item" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
