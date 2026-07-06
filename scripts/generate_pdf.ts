import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Note: In this environment, we might not have the compiled constants.ts easily accessible in the script
// So I will define a simplified version of the roadmap content directly to ensure the PDF is generated correctly.

const roadmapContent = [
  {
    area: "Administración",
    courses: [
      {
        title: "Asistente Contable",
        modules: [
          "Módulo 1: Fundamentos Contables (Principios, Facturación, Libros)",
          "Módulo 2: Gestión Administrativa (Conciliaciones, Proveedores, Balances)",
          "Módulo 3: Liquidación de Impuestos y Sueldos (IVA, Monotributo, Haberes)"
        ]
      },
      {
        title: "Asistente de RRHH",
        modules: [
          "Módulo 1: Reclutamiento y Selección (Perfiles, Canales, Entrevistas)",
          "Módulo 2: Desarrollo y Clima (Capacitación, Desempeño, Cultura)",
          "Módulo 3: Administración y Derecho Laboral (Contratos, Legajos, Gremiales)"
        ]
      },
      {
        title: "Administración de PyMEs",
        modules: [
          "Módulo 1: Planificación y Estrategia (FODA, Canvas, Gestión del cambio)",
          "Módulo 2: Finanzas y Comercialización (Costos, Punto de equilibrio, Ventas)",
          "Módulo 3: Operaciones y Aspectos Legales (Calidad, Marco legal, Finanzas)"
        ]
      }
    ]
  },
  {
    area: "Salud",
    courses: [
      {
        title: "Acompañante Terapéutico",
        modules: [
          "Módulo 1: Introducción y Marco Legal (Historia, Ética, Ley Salud Mental)",
          "Módulo 2: Psicopatología y Vínculo (Conceptos, Encuadre, Discapacidad)",
          "Módulo 3: Intervenciones Específicas (Niñez, Tercera edad, Crisis)"
        ]
      },
      {
        title: "Coordinador en Adicciones",
        modules: [
          "Módulo 1: Conceptos y Epidemiología (Definición, Sustancias, Prevención)",
          "Módulo 2: Modelos de Abordaje (Comunidad Terapéutica, Reducción de daños)",
          "Módulo 3: Prevención y Sistema Familiar (Codependencia, Reinserción)"
        ]
      },
      {
        title: "Asistente Odontología",
        modules: [
          "Módulo 1: Fundamentos y Bioseguridad (Anatomía, Esterilización, Ergonomía)",
          "Módulo 2: Instrumental y Materiales (Clasificación, Operatoria)",
          "Módulo 3: Administración y Radiología (Turnos, Historias clínicas, Urgencias)"
        ]
      }
    ]
  },
  {
    area: "Social / Educación",
    courses: [
      {
        title: "Asistente Social",
        modules: [
          "Módulo 1: Introducción al Trabajo Social (Derechos Humanos, Sociología)",
          "Módulo 2: Metodología de Intervención (Diagnóstico, Entrevista, Proyectos)",
          "Módulo 3: Políticas Públicas y Territorio (Sistemas protección, Redes)"
        ]
      },
      {
        title: "Pedagogía Primaria",
        modules: [
          "Módulo 1: Psicopedagogía y Aprendizaje (Teorías cognitivas, Desarrollo)",
          "Módulo 2: Didáctica y Planificación (Estrategias, Unidades didácticas)",
          "Módulo 3: Entornos Digitales y Diversidad (TICs, Educación inclusiva)"
        ]
      }
    ]
  },
  {
    area: "Tecnología",
    courses: [
      {
        title: "Técnico en Computación",
        modules: [
          "Módulo 1: Hardware y Ensamblaje (Componentes, Montaje, Diagnóstico)",
          "Módulo 2: Software y Sistemas (Instalación SO, Seguridad, Backups)",
          "Módulo 3: Redes y Mantenimiento (WiFi, LAN, Cableado, Preventivo)"
        ]
      }
    ]
  }
];

function generatePDF() {
  const doc = new PDFDocument({ margin: 50 });
  const outputDir = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'Hoja_de_Ruta_NextAr.pdf');
  const stream = fs.createWriteStream(outputPath);
  
  doc.pipe(stream);

  // Header
  doc.fillColor('#0F172A').fontSize(24).text('Hoja de Ruta de Contenidos', { align: 'center' });
  doc.fontSize(14).text('Next.ar - Instituto Digital', { align: 'center' });
  doc.moveDown(2);

  roadmapContent.forEach(area => {
    // Area Title
    doc.fillColor('#2563EB').fontSize(18).text(area.area, { underline: true });
    doc.moveDown(0.5);

    area.courses.forEach(course => {
      // Course Title
      doc.fillColor('#0F172A').fontSize(14).text(course.title, { indent: 20 });
      doc.moveDown(0.2);

      // Modules
      course.modules.forEach(module => {
        doc.fillColor('#475569').fontSize(10).text(`• ${module}`, { indent: 40 });
      });
      doc.moveDown(0.8);
    });
    doc.moveDown(1);
  });

  // Footer
  doc.fontSize(8).fillColor('#94A3B8').text(`Generado el ${new Date().toLocaleDateString()} - Next.ar Instituto Digital`, { align: 'center', baseline: 'bottom' });

  doc.end();
  
  stream.on('finish', () => {
    console.log(`PDF generado exitosamente en: ${outputPath}`);
  });
}

generatePDF();
