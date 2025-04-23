import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { Child, Payment, Program, Enrollment, Parent } from '@shared/schema';

// Logo de NEMI (puede ser una URL o Base64)
const LOGO_URL = '/assets/nemi-logo.svg';

// Crear el objeto con los tipos de informes disponibles
export const ReportTypes = {
  CHILDREN: 'children',
  PARENTS: 'parents',
  PROGRAMS: 'programs',
  ENROLLMENTS: 'enrollments',
  PAYMENTS: 'payments',
};

// Opciones de configuración para todos los informes
const pdfOptions = {
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  margin: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
};

// Configuración de los estilos de documentos
const styleConfig = {
  fontSize: 10,
  fontStyle: 'normal',
  headerFontSize: 12,
  headerFontStyle: 'bold',
  titleFontSize: 18,
  titleFontStyle: 'bold',
  subtitleFontSize: 14,
  subtitleFontStyle: 'normal',
  colors: {
    header: [226, 70, 55], // Color indigo (convertido de HSL a RGB)
    body: [60, 60, 60],
    border: [200, 200, 200],
  }
};

/**
 * Función general para generar un PDF
 * @param title Título del informe
 * @param subtitle Subtítulo del informe
 * @param columns Columnas de la tabla
 * @param data Datos para la tabla
 * @param fileName Nombre del archivo PDF a generar
 */
export function generatePDF(
  title: string,
  subtitle: string,
  columns: { header: string; dataKey: string }[],
  data: any[],
  fileName: string
): void {
  // Creamos un nuevo documento PDF
  const doc = new jsPDF({
    orientation: pdfOptions.orientation as any,
    unit: pdfOptions.unit,
    format: pdfOptions.format,
  });

  // Configuramos la información del documento
  doc.setProperties({
    title: title,
    subject: subtitle,
    author: 'NEMI NAVIGATOR',
    creator: 'NEMI NAVIGATOR',
  });

  // Agregamos el título y subtítulo
  doc.setFontSize(styleConfig.titleFontSize);
  doc.setTextColor(styleConfig.colors.header[0], styleConfig.colors.header[1], styleConfig.colors.header[2]);
  doc.text(title, pdfOptions.margin.left, pdfOptions.margin.top);

  doc.setFontSize(styleConfig.subtitleFontSize);
  doc.setTextColor(styleConfig.colors.body[0], styleConfig.colors.body[1], styleConfig.colors.body[2]);
  doc.text(subtitle, pdfOptions.margin.left, pdfOptions.margin.top + 10);

  // Agregamos la fecha del informe
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(styleConfig.fontSize);
  doc.text(`Fecha: ${currentDate}`, pdfOptions.margin.left, pdfOptions.margin.top + 20);

  // Preparamos las columnas y datos para la tabla
  const tableColumns = columns.map(col => ({ 
    header: col.header, 
    dataKey: col.dataKey 
  }));

  // Preparamos los datos para la tabla
  const tableData = data.map(item => {
    const rowData: Record<string, any> = {};
    columns.forEach(col => {
      rowData[col.dataKey] = item[col.dataKey] ?? '';
    });
    return rowData;
  });

  // Agregamos la tabla al documento
  autoTable(doc, {
    startY: pdfOptions.margin.top + 30,
    head: [tableColumns.map(col => col.header)],
    body: tableData.map(item => tableColumns.map(col => item[col.dataKey])),
    theme: 'grid',
    styles: {
      fontSize: styleConfig.fontSize,
      cellPadding: 3,
      lineColor: [styleConfig.colors.border[0], styleConfig.colors.border[1], styleConfig.colors.border[2]],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [styleConfig.colors.header[0], styleConfig.colors.header[1], styleConfig.colors.header[2]],
      textColor: [255, 255, 255],
      fontSize: styleConfig.headerFontSize,
      fontStyle: styleConfig.headerFontStyle,
    },
  });

  // Agregamos el pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`NEMI NAVIGATOR - Página ${i} de ${pageCount}`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
  }

  // Guardamos el PDF
  doc.save(`${fileName}.pdf`);
}

// Generador de informe de niños
export function generateChildrenReport(children: Child[]): void {
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Nombre', dataKey: 'name' },
    { header: 'Fecha de Nacimiento', dataKey: 'birthDate' },
    { header: 'Edad', dataKey: 'age' },
    { header: 'Alergias', dataKey: 'allergies' },
    { header: 'ID de Padre', dataKey: 'parentId' },
  ];

  // Datos formateados
  const formattedData = children.map(child => {
    return {
      ...child,
      birthDate: new Date(child.birthDate).toLocaleDateString('es-ES'),
      // Si hay campos que pueden ser null, aseguramos que se muestren como cadenas vacías
      allergies: child.allergies || 'Ninguna',
    };
  });

  generatePDF(
    'Informe de Niños',
    'Listado completo de niños registrados',
    columns,
    formattedData,
    'reporte-ninos'
  );
}

// Generador de informe de padres
export function generateParentsReport(parents: Parent[]): void {
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Nombre', dataKey: 'name' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Teléfono', dataKey: 'phone' },
    { header: 'Dirección', dataKey: 'address' },
  ];

  const formattedData = parents.map(parent => ({
    ...parent,
    address: parent.address || 'No especificada',
  }));

  generatePDF(
    'Informe de Padres',
    'Listado completo de padres registrados',
    columns,
    formattedData,
    'reporte-padres'
  );
}

// Generador de informe de programas
export function generateProgramsReport(programs: Program[]): void {
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Nombre', dataKey: 'name' },
    { header: 'Inicio', dataKey: 'startDate' },
    { header: 'Fin', dataKey: 'endDate' },
    { header: 'Capacidad', dataKey: 'capacity' },
    { header: 'Precio', dataKey: 'price' },
    { header: 'Estado', dataKey: 'status' },
  ];

  const formattedData = programs.map(program => ({
    ...program,
    startDate: new Date(program.startDate).toLocaleDateString('es-ES'),
    endDate: new Date(program.endDate).toLocaleDateString('es-ES'),
    price: `$${Number(program.price).toFixed(2)}`,
    status: translateStatus(program.status),
  }));

  generatePDF(
    'Informe de Programas',
    'Listado completo de programas',
    columns,
    formattedData,
    'reporte-programas'
  );
}

// Generador de informe de inscripciones
export function generateEnrollmentsReport(enrollments: Enrollment[], 
                                         programsMap: Record<number, string>,
                                         childrenMap: Record<number, string>): void {
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Programa', dataKey: 'programName' },
    { header: 'Niño', dataKey: 'childName' },
    { header: 'Fecha', dataKey: 'enrollmentDate' },
    { header: 'Monto', dataKey: 'amount' },
    { header: 'Estado', dataKey: 'status' },
  ];

  const formattedData = enrollments.map(enrollment => ({
    ...enrollment,
    programName: programsMap[enrollment.programId] || `Programa ${enrollment.programId}`,
    childName: childrenMap[enrollment.childId] || `Niño ${enrollment.childId}`,
    enrollmentDate: new Date(enrollment.enrollmentDate).toLocaleDateString('es-ES'),
    amount: `$${Number(enrollment.amount).toFixed(2)}`,
    status: translateStatus(enrollment.status),
  }));

  generatePDF(
    'Informe de Inscripciones',
    'Listado completo de inscripciones',
    columns,
    formattedData,
    'reporte-inscripciones'
  );
}

// Generador de informe de pagos
export function generatePaymentsReport(payments: Payment[],
                                       enrollmentsMap: Record<number, {programName: string, childName: string}>): void {
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Inscripción', dataKey: 'enrollmentDetails' },
    { header: 'Fecha', dataKey: 'paymentDate' },
    { header: 'Monto', dataKey: 'amount' },
    { header: 'Método', dataKey: 'method' },
    { header: 'Estado', dataKey: 'status' },
  ];

  const formattedData = payments.map(payment => ({
    ...payment,
    enrollmentDetails: enrollmentsMap[payment.enrollmentId] 
      ? `${enrollmentsMap[payment.enrollmentId].programName} - ${enrollmentsMap[payment.enrollmentId].childName}`
      : `Inscripción ${payment.enrollmentId}`,
    paymentDate: new Date(payment.paymentDate).toLocaleDateString('es-ES'),
    amount: `$${Number(payment.amount).toFixed(2)}`,
    method: translatePaymentMethod(payment.method),
    status: translateStatus(payment.status),
  }));

  generatePDF(
    'Informe de Pagos',
    'Listado completo de pagos',
    columns,
    formattedData,
    'reporte-pagos'
  );
}

// Función para traducir estados
function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Activo',
    complete: 'Completado',
    cancelled: 'Cancelado',
    draft: 'Borrador',
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    refunded: 'Reembolsado',
    failed: 'Fallido',
    completed: 'Completado',
  };
  return statusMap[status] || status;
}

// Función para traducir métodos de pago
function translatePaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
    other: 'Otro',
  };
  return methodMap[method] || method;
}