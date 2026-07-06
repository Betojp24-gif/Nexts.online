import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  MessageSquare,
  BookOpen,
  Calendar,
  Search
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { motion } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COURSES } from '../constants';

const data = [
  { name: 'Lun', inscritos: 12 },
  { name: 'Mar', inscritos: 18 },
  { name: 'Mie', inscritos: 15 },
  { name: 'Jue', inscritos: 22 },
  { name: 'Vie', inscritos: 30 },
  { name: 'Sab', inscritos: 25 },
  { name: 'Dom', inscritos: 20 },
];

export default function InstructorDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 1250,
    completionRate: 68,
    avgGrade: 8.4,
    questionsPending: 12
  });

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-sans text-gray-900">Panel del Instructor</h1>
            <p className="text-gray-500">Gestión de rendimiento y seguimiento de alumnos.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <Calendar size={16} /> Últimos 30 días
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Exportar Reporte
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Alumnos Activos', value: stats.totalStudents, icon: Users, color: '#3b82f6' },
            { label: 'Tasa de Finalización', value: `${stats.completionRate}%`, icon: TrendingUp, color: '#22c55e' },
            { label: 'Promedio General', value: `${stats.avgGrade} / 10`, icon: Award, color: '#f59e0b' },
            { label: 'Preguntas Pendientes', value: stats.questionsPending, icon: MessageSquare, color: '#ef4444' }
          ].map((item, id) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: id * 0.1 }}
              className="bg-card-bg p-5 rounded-[12px] border border-app-border shadow-sm border-l-4"
              style={{ borderLeftColor: item.color }}
            >
              <div className="metric-title text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                {item.label}
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-primary">{item.value}</h3>
                <item.icon size={20} className="text-text-muted opacity-40" />
              </div>
            </motion.div>
          ))}
        </div>


        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-8">Tendencia de Inscripciones</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInsc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                  <Area type="monotone" dataKey="inscritos" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorInsc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-8">Cursos Populares</h3>
            <div className="space-y-6">
              {COURSES.slice(0, 4).map((course, i) => (
                <div key={course.id} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{course.title}</span>
                    <span className="text-xs font-medium text-gray-400">85% Completado</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${85 - i * 10}%` }}
                      className={`h-full bg-${i === 0 ? 'blue' : i === 1 ? 'indigo' : 'purple'}-500 rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              Ver todos los cursos
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Alumnos Recientes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar alumno..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="pb-4 px-4 font-black">Alumno</th>
                  <th className="pb-4 px-4 font-black">Curso</th>
                  <th className="pb-4 px-4 font-black">Progreso</th>
                  <th className="pb-4 px-4 font-black">Calificación</th>
                  <th className="pb-4 px-4 font-black">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Lucas Rossi', course: 'Asistente Contable', progress: 45, grade: '-', status: 'Cursando' },
                  { name: 'Martina Paz', course: 'RRHH', progress: 100, grade: 9, status: 'Finalizado' },
                  { name: 'Julián Sosa', course: 'Técnico Computación', progress: 12, grade: '-', status: 'Cursando' },
                  { name: 'Sofía Méndez', course: 'Admin. PyMEs', progress: 85, grade: '-', status: 'Examen Pendiente' }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-4 font-bold text-gray-900">{row.name}</td>
                    <td className="py-5 px-4 text-gray-600">{row.course}</td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${row.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 font-bold">{row.progress}%</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 font-mono font-bold text-gray-900 text-center">{row.grade}</td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        row.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 
                        row.status === 'Cursando' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
