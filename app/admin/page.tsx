"use client"

import { Calendar, Users, FileText, BookOpen } from 'lucide-react'

const Admin = () => {
  // Sample data for stats
  const stats = [
    { title: "Total Certificates", value: "134", icon: <FileText className="w-5 h-5" /> },
    { title: "Total Students", value: "73", icon: <Users className="w-5 h-5" /> },
    { title: "Workshops Conducted", value: "4", icon: <BookOpen className="w-5 h-5" /> },
    { title: "Current Month", value: "July 2025", icon: <Calendar className="w-5 h-5" /> },
  ]

  return (
    <section className="text-black">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="max-w-2xl">Manage your certificate generation system efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Admin