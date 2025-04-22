import Anthropic from '@anthropic-ai/sdk';
import { db } from "./db";
import { 
  users, programs, parents, children, 
  enrollments, payments, activities, 
  attendance, communications, inventory 
} from "@shared/schema";
import { sql, eq, and, or, like, desc } from "drizzle-orm";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper to get database schema info
async function getDatabaseSchema(): Promise<string> {
  const tables = [
    { name: 'users', structure: users },
    { name: 'programs', structure: programs },
    { name: 'parents', structure: parents },
    { name: 'children', structure: children },
    { name: 'enrollments', structure: enrollments },
    { name: 'payments', structure: payments },
    { name: 'activities', structure: activities },
    { name: 'attendance', structure: attendance },
    { name: 'communications', structure: communications },
    { name: 'inventory', structure: inventory },
  ];

  let schemaInfo = "Base de datos del sistema NEMI:\n\n";
  
  for (const table of tables) {
    schemaInfo += `Tabla ${table.name}:\n`;
    // Get column info for each table
    const columnInfo = Object.entries(table.structure).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `  - ${key}: ${(value as any).dataType || 'unknown'}`;
      }
      return `  - ${key}`;
    }).join('\n');
    schemaInfo += columnInfo + '\n\n';
  }
  
  return schemaInfo;
}

// Helper function to execute queries based on user questions
async function runDatabaseQuery(question: string): Promise<string> {
  try {
    // Parse the question to determine which data to fetch
    const lowerQuestion = question.toLowerCase();
    
    // Programs query
    if (lowerQuestion.includes('programa') || lowerQuestion.includes('programas')) {
      const programData = await db.select().from(programs);
      return JSON.stringify(programData, null, 2);
    }
    
    // Children query
    if (lowerQuestion.includes('niño') || lowerQuestion.includes('niños') || 
        lowerQuestion.includes('hijo') || lowerQuestion.includes('hijos')) {
      const childrenData = await db.select().from(children);
      return JSON.stringify(childrenData, null, 2);
    }
    
    // Parents query
    if (lowerQuestion.includes('padre') || lowerQuestion.includes('padres') || 
        lowerQuestion.includes('madre') || lowerQuestion.includes('madres')) {
      const parentData = await db.select().from(parents);
      return JSON.stringify(parentData, null, 2);
    }
    
    // Enrollments query
    if (lowerQuestion.includes('inscripción') || lowerQuestion.includes('inscripciones') || 
        lowerQuestion.includes('matricula') || lowerQuestion.includes('matriculas')) {
      const enrollmentData = await db.select().from(enrollments);
      return JSON.stringify(enrollmentData, null, 2);
    }
    
    // Payments query
    if (lowerQuestion.includes('pago') || lowerQuestion.includes('pagos') || 
        lowerQuestion.includes('cobro') || lowerQuestion.includes('cobros')) {
      const paymentData = await db.select().from(payments);
      return JSON.stringify(paymentData, null, 2);
    }
    
    // Activities query
    if (lowerQuestion.includes('actividad') || lowerQuestion.includes('actividades')) {
      const activityData = await db.select().from(activities);
      return JSON.stringify(activityData, null, 2);
    }
    
    // Attendance query
    if (lowerQuestion.includes('asistencia') || lowerQuestion.includes('asistencias') || 
        lowerQuestion.includes('presente') || lowerQuestion.includes('ausente')) {
      const attendanceData = await db.select().from(attendance);
      return JSON.stringify(attendanceData, null, 2);
    }
    
    // Statistics
    if (lowerQuestion.includes('estadística') || lowerQuestion.includes('estadísticas') || 
        lowerQuestion.includes('total') || lowerQuestion.includes('conteo')) {
      
      // Active children count
      const childrenCount = await db
        .select({ count: sql<number>`count(distinct ${enrollments.childId})` })
        .from(enrollments)
        .innerJoin(payments, eq(payments.enrollmentId, enrollments.id))
        .where(
          or(
            eq(enrollments.status, 'confirmed'),
            eq(payments.status, 'completed')
          )
        );
      
      // Active programs count
      const programsCount = await db
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
      
      // Monthly income
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const firstDayFormatted = firstDayOfMonth.toISOString().split('T')[0];
      const lastDayFormatted = lastDayOfMonth.toISOString().split('T')[0];
      
      const monthlyIncome = await db
        .select({ total: sql<string>`sum(${payments.amount})` })
        .from(payments)
        .where(and(
          sql`${payments.paymentDate}::text >= ${firstDayFormatted}`,
          sql`${payments.paymentDate}::text <= ${lastDayFormatted + ' 23:59:59'}`,
          eq(payments.status, 'completed')
        ));
      
      const stats = {
        activeChildren: childrenCount[0]?.count || 0,
        activePrograms: programsCount[0]?.count || 0,
        monthlyIncome: monthlyIncome[0]?.total || '0.00',
      };
      
      return JSON.stringify(stats, null, 2);
    }
    
    // Default response if no specific query was identified
    return "No se pudo determinar qué datos buscar. Por favor, intenta ser más específico con tu pregunta.";
    
  } catch (error: any) {
    console.error("Error ejecutando consulta: ", error);
    return `Error al ejecutar la consulta en la base de datos: ${error.message || 'Error desconocido'}`;
  }
}

// Main function to process a chat message
export async function processNemiBotQuery(message: string): Promise<string> {
  try {
    // First, attempt to get relevant data from the database
    const dbQueryResult = await runDatabaseQuery(message);
    
    // Get the database schema info
    const schemaInfo = await getDatabaseSchema();
    
    // Context to help the model understand our system
    const systemContext = `
      Eres NEMI Bot, un asistente virtual para el sistema de gestión educativa NEMI.
      Tu tarea es ayudar a los usuarios a obtener información sobre niños, programas, pagos, 
      inscripciones y otras actividades del sistema, basándote en la información de la base de datos.
      
      IMPORTANTE: Si te preguntan sobre algo que no existe en la base de datos, debes indicar claramente 
      que no tienes esa información.
      
      Información del esquema de la base de datos:
      ${schemaInfo}
      
      Cuando respondas preguntas sobre datos, formatea tu respuesta de manera clara y amigable.
      Si recibes datos en formato JSON, conviértelos a una respuesta en lenguaje natural que sea 
      fácil de entender para el usuario.
    `;
    
    // Format the message with database query results
    const formattedMessage = `
      Mensaje del usuario: ${message}
      
      Resultados de la consulta a la base de datos:
      ${dbQueryResult}
      
      Por favor, responde a la consulta del usuario de manera amigable, usando los datos proporcionados.
      No menciones que recibiste datos en JSON. Responde directamente como si conocieras la información.
    `;
    
    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      system: systemContext,
      messages: [
        { role: 'user', content: formattedMessage }
      ]
    });
    
    // Extract text from the response
    if (response.content && response.content.length > 0 && response.content[0].type === 'text') {
      return response.content[0].text;
    }
    
    return "No pude generar una respuesta adecuada. Por favor, intenta reformular tu pregunta.";
    
  } catch (error: any) {
    console.error("Error procesando consulta: ", error);
    return "Lo siento, he tenido un problema al procesar tu consulta. Por favor, intenta nuevamente.";
  }
}