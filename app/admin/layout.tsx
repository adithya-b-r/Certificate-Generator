"use client"

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, UserCheck, Award, ChevronRight, FileText, Menu, X } from 'lucide-react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      href: "/admin/students",
      label: "Students",
      icon: Users,
      description: "Manage students"
    },
    {
      href: "/admin/workshops",
      label: "Workshops",
      icon: Calendar,
      description: "Sessions and Activities"
    },
    {
      href: "/admin/attendees",
      label: "Attendees",
      icon: UserCheck,
      description: "Track participation"
    },
    // {
    //   href: "/admin/certificates",
    //   label: "Certificates",
    //   icon: Award,
    //   description: "Generate & manage certificates"
    // },
    // {
    //   href: "/admin/templates",
    //   label: "Templates",
    //   icon: FileText,
    //   description: "Certificate templates"
    // }
  ]

  return (
    <main className='h-screen flex bg-gray-50'>
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 
        bg-white shadow-xl border-r border-gray-200 
        w-72 flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className='p-6 border-b border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center'>
              <Award className='w-5 h-5 text-white' />
            </div>
            <Link href={"/admin/"}>
            <div className='cursor-default' onClick={() => window.location.href='/admin/'}>
              <h1 className='font-bold text-xl text-gray-900'>CertGen Admin</h1>
              <p className='text-sm text-gray-500'>Certificate Generator</p>
            </div>
            </Link>
          </div>
        </div>

        <nav className='flex-1 p-4'>
          <div className='space-y-2'>
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className='group flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 ease-in-out'
                >
                  <div className='w-10 h-10 bg-gray-100 group-hover:bg-amber-100 rounded-lg flex items-center justify-center transition-colors duration-200'>
                    <Icon className='w-5 h-5 group-hover:text-amber-600' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-sm group-hover:text-amber-600 transition-colors duration-200'>
                      {item.label}
                    </p>
                    <p className='text-xs text-gray-500 group-hover:text-amber-500 transition-colors duration-200'>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className='w-4 h-4 text-gray-400 group-hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all duration-200' />
                </Link>
              )
            })}
          </div>
        </nav>

        <div className='p-4 border-t border-gray-100'>
          <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
            <div className='w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>A</span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900'>Admin User</p>
              <p className='text-xs text-gray-500'>admin@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      <div className='flex-1 flex flex-col lg:ml-0'>
        <header className='lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3 ml-12'>
              <div className='w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center'>
                <Award className='w-4 h-4 text-white' />
              </div>
              <div>
                <h1 className='font-bold text-lg text-gray-900'>CertGen Admin</h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='z-50 p-2 text-black rounded-lg lg:hidden'
            >
              {sidebarOpen ? <X className='w-8 h-8' /> : <Menu className='w-8 h-8' />}
            </button>
          </div>
        </header>

        <div className='flex-1 p-4 sm:p-6 lg:p-8 bg-white overflow-y-scroll w-sm md:w-full'>
          {children}
        </div>
      </div>
    </main>
  )
}