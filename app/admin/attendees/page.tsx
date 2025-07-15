"use client"

import { useState, useEffect } from 'react'
import { Calendar, Users, Filter, Check, X, UserCheck, Search, Loader2 } from 'lucide-react'
import { fetchStudents, fetchWorkshops } from '@/app/lib/appwrite'

interface Student {
  $id: string
  studentName: string
  USN: string
  branch: number
  year: number
  gender: string
}

interface Workshop {
  $id: string
  workshopName: string
  date: string
  resourcePerson: string
  organizedDepartment: string
}

interface AttendanceRecord {
  studentId: string
  workshopId: string
  attended: boolean
}

const Attendees = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [branches, setBranches] = useState<string[]>(['All Branches'])
  const [loading, setLoading] = useState(true)
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('')
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [studentsData, workshopsData] = await Promise.all([
          fetchStudents(),
          fetchWorkshops()
        ])

        if (studentsData) {
          const studentsArray = studentsData.map((doc: any) => ({
            $id: doc.$id,
            studentName: doc.studentName,
            USN: doc.USN,
            branch: doc.branch,
            year: doc.year,
            gender: doc.gender
          }))

          setStudents(studentsArray)

          const uniqueBranches = [...new Set(studentsArray
            .map((student: Student) => student.branch)
            .filter((branch: any) => branch !== undefined && branch !== null && branch !== '')
          )].map(branch => String(branch))

          const sortedBranches = ['All Branches', ...uniqueBranches.sort()]
          setBranches(sortedBranches)
        }

        if (workshopsData?.documents) {
          setWorkshops(
            workshopsData.documents.map((doc: any) => ({
              $id: doc.$id,
              workshopName: doc.workshopName,
              date: doc.date,
              resourcePerson: doc.resourcePerson,
              organizedDepartment: doc.organizedDepartment
            }))
          )
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAttendanceChange = (studentId: string, attended: boolean) => {
    if (!selectedWorkshop) return

    setAttendance(prev => {
      const existingRecord = prev.find(
        record => record.studentId === studentId && record.workshopId === selectedWorkshop
      )

      if (existingRecord) {
        return prev.map(record =>
          record.studentId === studentId && record.workshopId === selectedWorkshop
            ? { ...record, attended }
            : record
        )
      } else {
        return [...prev, { studentId, workshopId: selectedWorkshop, attended }]
      }
    })
  }

  const getAttendanceStatus = (studentId: string) => {
    if (!selectedWorkshop) return false
    const record = attendance.find(
      record => record.studentId === studentId && record.workshopId === selectedWorkshop
    )
    return record?.attended || false
  }

  const filteredStudents = students.filter(student => {
    const studentBranch = student.branch || 'Unknown'
    const matchesBranch = selectedBranch === 'All Branches' || studentBranch === selectedBranch
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.USN.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesBranch && matchesSearch
  })

  const getAttendanceStats = () => {
    if (!selectedWorkshop) return { present: 0, absent: 0, total: 0 }

    const total = filteredStudents.length

    const presentCount = filteredStudents.filter(student =>
      getAttendanceStatus(student.$id)
    ).length

    const absentCount = total - presentCount

    return { present: presentCount, absent: absentCount, total }
  }

  const stats = getAttendanceStats()

  if (loading) {
    return (
      <section className="text-black">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading workshops and students...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="text-black">
      <div className="mb-6 md:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Attendance Management</h3>
        <p className="text-sm sm:text-base text-gray-600">Track student attendance for workshops and events</p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-800">Select Workshop</h4>
            <p className="text-xs sm:text-sm text-gray-500">Choose a workshop to manage attendance</p>
          </div>
        </div>

        <select
          value={selectedWorkshop}
          onChange={(e) => setSelectedWorkshop(e.target.value)}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
        >
          <option value="">Select a workshop...</option>
          {workshops.map(workshop => (
            <option key={workshop.$id} value={workshop.$id}>
              {workshop.workshopName} - {new Date(workshop.date).toLocaleDateString()}
            </option>
          ))}
        </select>

        {selectedWorkshop && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-sm sm:text-base text-blue-900 mb-1">
              {workshops.find(w => w.$id === selectedWorkshop)?.workshopName}
            </h5>
            <p className="text-xs sm:text-sm text-blue-700">
              Resource Person: {workshops.find(w => w.$id === selectedWorkshop)?.resourcePerson}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Date: {new Date(workshops.find(w => w.$id === selectedWorkshop)?.date || '').toLocaleDateString()}
            </p>
            <p className="text-xs text-blue-600">
              Department: {workshops.find(w => w.$id === selectedWorkshop)?.organizedDepartment}
            </p>
          </div>
        )}
      </div>

      {selectedWorkshop && (
        <>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-800">Filter Students</h4>
                <p className="text-xs sm:text-sm text-gray-500">Filter by branch and search by name or USN</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Branch Filter</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                >
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Search Students</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or USN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Present</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Absent</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">Student Attendance</h4>
                  <p className="text-xs sm:text-sm text-gray-500">Mark attendance for each student</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-500">No students found matching your criteria</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredStudents.map(student => (
                    <div
                      key={student.$id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${getAttendanceStatus(student.$id)
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white ${getAttendanceStatus(student.$id)
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                          }`}>
                          {student.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm sm:text-base text-gray-900">{student.studentName}</h5>
                          <p className="text-xs sm:text-sm text-gray-600">{student.USN}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {student.branch || 'Unknown'}
                            </span>
                            <span className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Year {student.year}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                        <button
                          onClick={() => handleAttendanceChange(student.$id, true)}
                          className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 ${getAttendanceStatus(student.$id)
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                            }`}
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Present</span>
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.$id, false)}
                          className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 ${!getAttendanceStatus(student.$id)
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                            }`}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredStudents.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                  <button className="flex items-center justify-center gap-1 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                    <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                    Save Attendance
                  </button>
                  <button className="flex items-center justify-center gap-1 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                    Export Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default Attendees