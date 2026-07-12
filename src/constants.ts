import rrhhImage from './assets/images/asistente_rrhh_1783012149003.jpg';

export const COURSES = [
  {
    id: 'asistente-contable',
    title: 'Asistente Contable',
    hours: 400,
    price: 30000,
    category: 'Administración',
    icon: 'Calculator',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=50&w=500&fm=webp',
    objective: 'Capacitar para el apoyo en tareas contables y administrativas esenciales.',
    summary: 'Principios de contabilidad, gestión de facturas, conciliaciones bancarias y liquidación de impuestos básicos.',
    programUrl: '/docs/programas/asistente-contable.pdf',
    modules: [
      { 
        title: 'Módulo 1: Fundamentos Contables', 
        topics: ['Principios de contabilidad generalmente aceptados', 'Documentación comercial y facturación', 'Libros obligatorios y asientos contables'],
        evaluation: 'Trabajo Práctico + Multiple Choice',
        resources: [
          { title: 'Guía de Lectura - Módulo 1.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf' },
          { title: 'Plantilla de Facturación Excel.xlsx', url: 'https://go.microsoft.com/fwlink/?LinkID=521962', type: 'excel' }
        ],
        assignment: {
          title: 'TP 1: Registración Contable',
          instructions: 'Realizar la registración de las operaciones detalladas en la guía práctica utilizando el libro diario. Debe entregar el archivo en formato Excel o PDF.'
        }
      },
      { 
        title: 'Módulo 2: Gestión Administrativa Financiera', 
        topics: ['Conciliaciones bancarias', 'Gestión de proveedores y clientes', 'Análisis de cuentas y balances básicos'],
        evaluation: 'Trabajo Práctico + Multiple Choice',
        resources: [
          { title: 'Manual de Conciliación Bancaria.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf' }
        ],
        assignment: {
          title: 'TP 2: Conciliación Bancaria',
          instructions: 'Efectuar la conciliación bancaria del mes de Marzo según el extracto y el libro banco provistos en la guía.'
        }
      },
      { 
        title: 'Módulo 3: Liquidación de Impuestos y Sueldos', 
        topics: ['IVA e Ingresos Brutos (Conceptos básicos)', 'Monotributo y Autónomos', 'Liquidación de haberes y cargas sociales'],
        evaluation: 'Trabajo Práctico + Multiple Choice',
        resources: [
          { title: 'Guía de Liquidación de Haberes', url: '#', type: 'pdf' },
          { title: 'Formularios AFIP Modelos', url: '#', type: 'pdf' }
        ],
        assignment: {
          title: 'TP Final: Liquidación Integral',
          instructions: 'Liquidar el sueldo de 3 empleados bajo CCT Comercio y generar el borrador del F.931.'
        }
      }
    ]
  },
  {
    id: 'asistente-rrhh',
    title: 'Asistente de RRHH',
    hours: 400,
    price: 30000,
    category: 'Administración',
    icon: 'Users',
    image: rrhhImage,
    objective: 'Formar asistentes capaces de colaborar en la gestión estratégica del capital humano.',
    summary: 'Selección de personal, capacitación, clima organizacional y conceptos básicos de derecho laboral.',
    modules: [
      { 
        title: 'Módulo 1: Reclutamiento y Selección', 
        topics: ['Descripción de puestos y perfiles', 'Canales de reclutamiento (Tradicionales y Digitales)', 'Entrevistas por competencias'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 2: Desarrollo y Clima Organizacional', 
        topics: ['Plan de capacitación y formación', 'Evaluación del desempeño', 'Cultura y comunicación interna'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 3: Administración y Derecho Laboral', 
        topics: ['Contratos de trabajo y normativa vigente', 'Gestión de legajos y ausentismo', 'Relaciones gremiales y sindicales'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      }
    ]
  },
  {
    id: 'administracion-pymes',
    title: 'Administración de PyMEs',
    hours: 675,
    price: 50000,
    category: 'Administración',
    icon: 'Briefcase',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=50&w=500&fm=webp',
    objective: 'Brindar herramientas de gestión integral para pequeñas y medianas empresas.',
    summary: 'Planeamiento estratégico, finanzas corporativas, marketing para PyMEs y gestión de procesos.',
    modules: [
      { 
        title: 'Módulo 1: Planificación y Estrategia', 
        topics: ['Misión, Visión y Análisis FODA', 'Diseño de modelos de negocio (Canvas)', 'Gestión del cambio en PyMEs'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 2: Finanzas y Comercialización', 
        topics: ['Costos, precios y punto de equilibrio', 'Marketing digital y ventas', 'Atención al cliente y fidelización'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 3: Operaciones y Aspectos Legales', 
        topics: ['Gestión de procesos y calidad', 'Marco legal y societario para PyMEs', 'Financiación y líneas críticas'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      }
    ]
  },
  {
    id: 'acompanante-terapeutico',
    title: 'Acompañante Terapéutico',
    hours: 675,
    price: 50000,
    category: 'Salud',
    icon: 'HeartPulse',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=50&w=500&fm=webp',
    objective: 'Capacitar en el rol del acompañamiento terapéutico en diversos cuadros psicopatológicos.',
    summary: 'Psicología evolutiva, psicopatología, ética profesional y técnicas de intervención en crisis.',
    modules: [
      { 
        title: 'Módulo 1: Introducción y Marco Legal', 
        topics: ['Historia y rol del acompañante terapéutico', 'Ética y deontología profesional', 'Ley de Salud Mental vigente'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 2: Psicopatología y Vínculo', 
        topics: ['Conceptos básicos de psicopatología', 'El encuadre terapéutico y el vínculo', 'Acompañamiento en la discapacidad'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 3: Intervenciones Específicas', 
        topics: ['Acompañamiento en niñez y adolescencia', 'Tercera edad y cuidados paliativos', 'Intervención en crisis y urgencias'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      }
    ]
  },
  {
    id: 'coordinador-adicciones',
    title: 'Coordinador en Adicciones',
    hours: 675,
    price: 50000,
    category: 'Salud',
    icon: 'Shield',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=50&w=500&fm=webp',
    objective: 'Formar coordinadores con herramientas para el abordaje de consumos problemáticos.',
    summary: 'Modelos de prevención, comunidad terapéutica, reducción de daños y abordajes familiares.',
    modules: [
      { 
        title: 'Módulo 1: Conceptos y Epidemiología', 
        topics: ['Definición de adicción y consumos problemáticos', 'Tipos de sustancias y efectos psicoactivos', 'Factores de riesgo y de protección'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 2: Modelos de Abordaje', 
        topics: ['La Comunidad Terapéutica', 'Modelo de Reducción de Daños', 'Abordaje grupal e individual'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 3: Prevención y Sistema Familiar', 
        topics: ['Codependencia y acompañamiento familiar', 'Diseño de programas de prevención comunitaria', 'Reinserción social y laboral'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      }
    ]
  },
  {
    id: 'asistente-social',
    title: 'Asistente Social',
    hours: 675,
    price: 50000,
    category: 'Social',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=50&w=500&fm=webp',
    objective: 'Preparar asistentes para el trabajo en territorio y gestión de programas sociales.',
    summary: 'Políticas públicas, sociología, investigación social y herramientas de diagnóstico comunitario.',
    modules: [
      { 
        title: 'Módulo 1: Introducción al Trabajo Social', 
        topics: ['Surgimiento y evolución del trabajo social', 'Derechos humanos y ciudadanía', 'Sociología y contexto actual'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 2: Metodología de Intervención', 
        topics: ['Herramientas de diagnóstico social', 'La entrevista y el informe social', 'Planificación y gestión de proyectos'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 3: Políticas Públicas y Territorio', 
        topics: ['Sistemas de protección social', 'Intervención comunitaria y redes', 'Gestión de recursos y subsidios sociales'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      }
    ]
  },
  {
    id: 'pedagogia-primaria',
    title: 'Pedagogía Primaria',
    hours: 400,
    price: 30000,
    category: 'Educación',
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=50&w=500&fm=webp',
    objective: 'Introducir conceptos pedagógicos fundamentales para el apoyo escolar.',
    summary: 'Teorías del aprendizaje, didáctica general, psicología del desarrollo y nuevas tecnologías en el aula.',
    modules: [
      { 
        title: 'Módulo 1: Psicopedagogía y Aprendizaje', 
        topics: ['Teorías cognitivas y del desarrollo', 'El sujeto de aprendizaje en primaria', 'Dificultades comunes en el aula'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 2: Didáctica y Planificación', 
        topics: ['Estrategias de enseñanza creativa', 'Planificación de unidades didácticas', 'Evaluación formativa y sumativa'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 3: Entornos Digitales y Diversidad', 
        topics: ['TICs aplicadas a la educación primaria', 'Educación inclusiva y diversidad', 'Taller de recursos pedagógicos'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      }
    ]
  },
  {
    id: 'asistente-odontologia',
    title: 'Asistente Odontología',
    hours: 400,
    price: 30000,
    category: 'Salud',
    icon: 'Stethoscope',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=50&w=500&fm=webp',
    objective: 'Capacitar en la asistencia directa al odontólogo y gestión del consultorio.',
    summary: 'Anatomía dental, instrumental quirúrgico, bioseguridad y administración de historias clínicas.',
    modules: [
      { 
        title: 'Módulo 1: Fundamentos y Bioseguridad', 
        topics: ['Anatomía dentaria básica', 'Protocolos de esterilización y bioseguridad', 'Ergonomía en el consultorio'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 2: Instrumental y Materiales', 
        topics: ['Clasificación del instrumental odontológico', 'Materiales dentales: preparación y uso', 'Asistencia en operatoria dental'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 3: Administración y Radiología', 
        topics: ['Gestión de turnos e historias clínicas', 'Radiología dental básica y revelado', 'Atención al paciente y urgencias'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      }
    ]
  },
  {
    id: 'tecnico-computacion',
    title: 'Técnico en Computación',
    hours: 675,
    price: 50000,
    category: 'Tecnología',
    icon: 'Cpu',
    image: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=50&w=500&fm=webp',
    objective: 'Brindar conocimientos técnicos sólidos para el mantenimiento y reparación de equipos.',
    summary: 'Arquitectura de computadoras, redes, sistemas operativos, mantenimiento preventivo y correctivo.',
    modules: [
      { 
        title: 'Módulo 1: Hardware y Ensamblaje', 
        topics: ['Componentes internos y periféricos', 'Montaje y desmontaje de PCs', 'Diagnóstico de fallas electrónicas'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 2: Software y Sistemas', 
        topics: ['Instalación de Sistemas Operativos', 'Optimización y seguridad informática', 'Gestión de backups y virus'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      },
      { 
        title: 'Módulo 3: Redes y Mantenimiento', 
        topics: ['Configuración de redes WiFi y LAN', 'Crimpeado y normativas de cableado', 'Mantenimiento preventivo avanzado'],
        evaluation: 'Trabajo Práctico + Multiple Choice'
      }
    ]
  }
];
