"use client"

import React, { useState, useMemo } from 'react'
import { 
  Calendar, 
  User, 
  Download, 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Menu,
  X
} from 'lucide-react'

const WorkshopClientInterface = () => {
  // Sample workshop data
  const workshops = [
    {
      id: '1',
      name: 'Web Development Fundamentals',
      date: '2024-03-15',
      description: 'Introduction to HTML, CSS, and JavaScript',
      resourcePerson: 'Dr. Sarah Johnson',
      department: 'Computer Science'
    },
    {
      id: '2',
      name: 'React & Modern JavaScript',
      date: '2024-03-22',
      description: 'Building interactive web applications',
      resourcePerson: 'Prof. Michael Chen',
      department: 'Computer Science'
    },
    {
      id: '3',
      name: 'Database Design Workshop',
      date: '2024-03-29',
      description: 'SQL and database optimization techniques',
      resourcePerson: 'Ms. Emily Rodriguez',
      department: 'Information Technology'
    }
  ]

  // Sample students data
  const students = [
    { id: '1', name: 'Arjun Kumar', usn: '1AB21CS001', branch: 'CSE' },
    { id: '2', name: 'Riya Sharma', usn: '1AB21CS002', branch: 'CSE' },
    { id: '3', name: 'Rahul Verma', usn: '1AB21IS003', branch: 'ISE' },
    { id: '4', name: 'Sneha Patel', usn: '1AB21EC004', branch: 'ECE' },
    { id: '5', name: 'Vikram Singh', usn: '1AB21CS005', branch: 'CSE' },
    { id: '6', name: 'Ananya Reddy', usn: '1AB21IS006', branch: 'ISE' },
    { id: '7', name: 'Karthik Nair', usn: '1AB21EC007', branch: 'ECE' },
    { id: '8', name: 'Meera Gupta', usn: '1AB21CS008', branch: 'CSE' }
  ]

  // Sample attendance data
  const attendanceData = [
    { studentId: '1', workshopId: '1', attended: true },
    { studentId: '2', workshopId: '1', attended: true },
    { studentId: '3', workshopId: '1', attended: true },
    { studentId: '5', workshopId: '1', attended: true },
    { studentId: '8', workshopId: '1', attended: true },
    
    { studentId: '1', workshopId: '2', attended: true },
    { studentId: '2', workshopId: '2', attended: true },
    { studentId: '4', workshopId: '2', attended: true },
    { studentId: '6', workshopId: '2', attended: true },
    { studentId: '7', workshopId: '2', attended: true },
    { studentId: '8', workshopId: '2', attended: true },
    
    { studentId: '2', workshopId: '3', attended: true },
    { studentId: '3', workshopId: '3', attended: true },
    { studentId: '4', workshopId: '3', attended: true },
    { studentId: '6', workshopId: '3', attended: true }
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('All Branches')
  const [expandedWorkshops, setExpandedWorkshops] = useState(new Set(['1']))
  const [filtersVisible, setFiltersVisible] = useState(false)

  const branches = ['All Branches', 'CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI', 'DS']

  // Get attendees for a specific workshop
  const getWorkshopAttendees = (workshopId: string) => {
    const attendeeIds = attendanceData
      .filter(record => record.workshopId === workshopId && record.attended)
      .map(record => record.studentId)
    
    return students.filter(student => attendeeIds.includes(student.id))
  }

  // Filter attendees based on search and branch
  const getFilteredAttendees = (workshopId: string) => {
    const attendees = getWorkshopAttendees(workshopId)
    
    return attendees.filter(student => {
      const matchesBranch = selectedBranch === 'All Branches' || student.branch === selectedBranch
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.usn.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesBranch && matchesSearch
    })
  }

  const toggleWorkshopExpansion = (workshopId: string) => {
    const newExpanded = new Set(expandedWorkshops)
    if (newExpanded.has(workshopId)) {
      newExpanded.delete(workshopId)
    } else {
      newExpanded.add(workshopId)
    }
    setExpandedWorkshops(newExpanded)
  }

  const handleDownloadCertificate = (studentName: string, workshopName: string) => {
    // Simulate certificate download
    alert(`Downloading certificate for ${studentName} - ${workshopName}`)
  }

  const totalAttendees = useMemo(() => {
    return workshops.reduce((total, workshop) => {
      return total + getWorkshopAttendees(workshop.id).length
    }, 0)
  }, [workshops])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Workshop Certificates</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Access and download certificates for completed workshops and sessions.</p>
              </div>
            </div>
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Workshops</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{workshops.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Attendees</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalAttendees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Certificates Available</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalAttendees}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Mobile Responsive */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
            {/* Filter Header - Mobile Toggle */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 sm:border-b-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Filter Options</h3>
              </div>
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="sm:hidden p-2 text-gray-600 hover:text-gray-800"
              >
                {filtersVisible ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Filter Content */}
            <div className={`${filtersVisible ? 'block' : 'hidden'} sm:block p-3 sm:p-4`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name or USN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-4 py-2 sm:py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-sm sm:text-base"
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workshops List - Mobile Optimized */}
        <div className="space-y-4 sm:space-y-6">
          {workshops.map(workshop => {
            const filteredAttendees = getFilteredAttendees(workshop.id)
            const totalWorkshopAttendees = getWorkshopAttendees(workshop.id).length
            const isExpanded = expandedWorkshops.has(workshop.id)

            return (
              <div key={workshop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Workshop Header - Mobile Responsive */}
                <div 
                  className="p-4 sm:p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleWorkshopExpansion(workshop.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 break-words">{workshop.name}</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 break-words">{workshop.description}</p>
                        
                        {/* Workshop Details - Responsive Stack */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{new Date(workshop.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{workshop.resourcePerson}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{totalWorkshopAttendees} attendees</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-500">Department</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{workshop.department}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendees List - Mobile Optimized */}
                {isExpanded && (
                  <div className="p-4 sm:p-6">
                    {filteredAttendees.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <p className="text-sm sm:text-base text-gray-500">No attendees found matching your criteria</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                            Attendees ({filteredAttendees.length})
                          </h4>
                          <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download All Certificates</span>
                            <span className="sm:hidden">Download All</span>
                          </button>
                        </div>

                        {/* Attendees Grid - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                          {filteredAttendees.map(student => (
                            <div key={student.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{student.name}</h5>
                                  <p className="text-xs sm:text-sm text-gray-600 truncate">{student.usn}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
                                  {student.branch}
                                </span>
                                <button
                                  onClick={() => handleDownloadCertificate(student.name, workshop.name)}
                                  className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors flex-shrink-0 cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span className="hidden sm:inline">Download Certificate</span>
                                  <span className="sm:hidden">Download Certificate</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {workshops.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base text-gray-500">No workshops found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkshopClientInterface