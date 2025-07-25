"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Calendar, User, Download, Search, Filter, BookOpen, Users, Award, ChevronDown, ChevronUp, Menu, X } from 'lucide-react'
import { fetchWorkshops } from "@/app/lib/appwrite"
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'

interface Student {
  $id: string
  studentName: string
  USN: string
  branch: string
  year: number
  gender: string
}

interface Workshop {
  $id: string
  workshopName: string
  resourcePerson: string
  organizedDepartment: string
  date: string
  certificateTemplate: string
  textElement: string
  students: Student[]
}

interface TextElement {
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
}

const WorkshopClientInterface = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('All Branches')
  const [expandedWorkshops, setExpandedWorkshops] = useState(new Set<string>())
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [currentGenerating, setCurrentGenerating] = useState('')

  const canvasRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    const getWorkshops = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchWorkshops()

        if (response && Array.isArray(response.documents)) {
          const workshopsData = response.documents as Workshop[]
          setWorkshops(workshopsData)
        } else {
          setWorkshops([])
          setError("Invalid data format received from server")
        }
      } catch (err) {
        console.error("Error fetching workshops:", err)
        setError("Failed to load workshops. Please try again.")
        setWorkshops([])
      } finally {
        setLoading(false)
      }
    }

    getWorkshops()
  }, [])

  const branches = useMemo(() => {
    const branchSet = new Set<string>(['All Branches'])
    workshops.forEach(workshop => {
      workshop.students?.forEach(student => {
        if (student.branch) {
          branchSet.add(student.branch)
        }
      })
    })
    return Array.from(branchSet).sort()
  }, [workshops])

  const getWorkshopAttendees = (workshop: Workshop) => {
    return workshop.students || []
  }

  const getFilteredAttendees = (workshop: Workshop) => {
    const attendees = getWorkshopAttendees(workshop)

    return attendees.filter(student => {
      const matchesBranch = selectedBranch === 'All Branches' || student.branch === selectedBranch
      const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.USN.toLowerCase().includes(searchTerm.toLowerCase())
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

  const generateCertificatePDF = async (workshop: Workshop, student: Student) => {
    try {
      setIsGeneratingPDF(true)
      setCurrentGenerating(`Generating certificate for ${student.studentName}...`)

      const canvasRef = canvasRefs.current[workshop.$id]
      if (!canvasRef) return

      const clone = canvasRef.cloneNode(true) as HTMLDivElement
      clone.style.width = '1000px'
      clone.style.height = '700px'
      clone.style.position = 'fixed'
      clone.style.left = '-10000px'
      clone.style.top = '0'
      document.body.appendChild(clone)

      const nameElements = clone.querySelectorAll('.certificate-name');
      nameElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.textContent = student.studentName;
          el.style.color = '#000000';
        }
      });

      const canvas = await html2canvas(clone, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      document.body.removeChild(clone)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height])
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${student.studentName}_${workshop.workshopName}_certificate.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate certificate. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
      setCurrentGenerating('')
    }
  }

  const generateAllCertificatesPDF = async (workshop: Workshop) => {
    try {
      setIsGeneratingPDF(true)
      setCurrentGenerating(`Generating certificates for ${workshop.workshopName}...`)

      const filteredAttendees = getFilteredAttendees(workshop)
      if (filteredAttendees.length === 0) return

      const pdf = new jsPDF('landscape', 'pt', [1000, 700])
      const textElements = JSON.parse(workshop.textElement) as TextElement

      for (let i = 0; i < filteredAttendees.length; i++) {
        const student = filteredAttendees[i]
        const canvasRef = canvasRefs.current[workshop.$id]
        if (!canvasRef) continue

        const clone = canvasRef.cloneNode(true) as HTMLDivElement
        clone.style.width = '1000px'
        clone.style.height = '700px'
        clone.style.position = 'fixed'
        clone.style.left = '-10000px'
        clone.style.top = '0'
        document.body.appendChild(clone)

        const nameElements = clone.querySelectorAll('.certificate-name');
        nameElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.textContent = student.studentName;
            el.style.color = '#000000';
          }
        });

        const canvas = await html2canvas(clone, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        })

        document.body.removeChild(clone)

        const imgData = canvas.toDataURL('image/png')

        if (i > 0) {
          pdf.addPage([1000, 700], 'landscape')
        }
        pdf.addImage(imgData, 'PNG', 0, 0, 1000, 700)
      }

      pdf.save(`${workshop.workshopName}_certificates.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate certificates. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
      setCurrentGenerating('')
    }
  }

  const totalAttendees = useMemo(() => {
    const uniqueStudentIds = new Set<string>()
    workshops.forEach(workshop => {
      workshop.students?.forEach(student => {
        uniqueStudentIds.add(student.$id)
      })
    })
    return uniqueStudentIds.size
  }, [workshops])

  const totalCertificates = useMemo(() => {
    return workshops.reduce((total, workshop) => {
      const uniqueStudents = new Set(workshop.students?.map(s => s.$id) || [])
      return total + uniqueStudents.size
    }, 0)
  }, [workshops])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-lg font-medium text-gray-900">Loading workshops...</p>
          <p className="text-gray-600">Please wait while we fetch the data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium text-gray-900">Generating PDF</p>
                <p className="text-sm text-gray-600">{currentGenerating}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalCertificates}</p>
                </div>
              </div>
            </div>
          </div>

          {workshops.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
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
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          {workshops.map(workshop => {
            const filteredAttendees = getFilteredAttendees(workshop)
            const totalWorkshopAttendees = getWorkshopAttendees(workshop).length
            const isExpanded = expandedWorkshops.has(workshop.$id)

            const textElements = JSON.parse(workshop.textElement) as TextElement

            return (
              <div key={workshop.$id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div
                  className="p-4 sm:p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleWorkshopExpansion(workshop.$id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 break-words">{workshop.workshopName}</h3>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{formatDate(workshop.date)}</span>
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
                        <p className="text-xs sm:text-sm text-gray-500">Organized Department</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{workshop.organizedDepartment}</p>
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

                {isExpanded && (
                  <div className="p-4 sm:p-6">
                    {filteredAttendees.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <p className="text-sm sm:text-base text-gray-500">
                          {totalWorkshopAttendees === 0
                            ? "No attendees for this workshop"
                            : "No attendees found matching your criteria"
                          }
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                            Attendees ({filteredAttendees.length})
                          </h4>
                          <button
                            onClick={() => generateAllCertificatesPDF(workshop)}
                            disabled={isGeneratingPDF}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download All Certificates</span>
                            <span className="sm:hidden">Download All</span>
                          </button>
                        </div>

                        <div className="mb-4 sm:mb-6">
                          <div
                            ref={(el) => { canvasRefs.current[workshop.$id] = el }}
                            className="h-64 sm:h-80 md:h-96 w-full bg-gray-100 relative overflow-hidden rounded-lg border border-gray-200"
                            style={{
                              backgroundImage: `url(${workshop.certificateTemplate})`,
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center'
                            }}
                          >
                            {/* Mobile version */}
                            <motion.div
                              className="absolute cursor-move text-center md:hidden certificate-name"
                              style={{
                                left: `${textElements.x || 50}%`,
                                top: `${textElements.y || 50}%`,
                                fontSize: `${textElements.fontSize * 0.6}px`,
                                color: textElements.color,
                                fontFamily: textElements.fontFamily,
                                padding: '0.25rem',
                                transform: 'translate(-50%, -50%)',
                                lineHeight: '1.2',
                                width: '90%',
                                maxWidth: '90%',
                                textShadow: '0 0 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span className="whitespace-pre-wrap break-words">
                                {filteredAttendees[0]?.studentName || 'Sample Name'}
                              </span>
                            </motion.div>

                            {/* Tablet version */}
                            <motion.div
                              className="hidden md:block lg:hidden absolute cursor-move text-center certificate-name"
                              style={{
                                left: `${textElements.x || 50}%`,
                                top: `${textElements.y || 50}%`,
                                fontSize: `${textElements.fontSize * 0.85}px`,
                                color: textElements.color,
                                fontFamily: textElements.fontFamily,
                                padding: '0.25rem',
                                transform: 'translate(-50%, -50%)',
                                lineHeight: '1.2',
                                width: '85%',
                                maxWidth: '85%',
                                textShadow: '0 0 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span className="whitespace-pre-wrap break-words">
                                {filteredAttendees[0]?.studentName || 'Sample Name'}
                              </span>
                            </motion.div>

                            {/* Desktop version */}
                            <motion.div
                              className="hidden lg:block absolute cursor-move text-center certificate-name"
                              style={{
                                left: `${textElements.x || 50}%`,
                                top: `${textElements.y || 50}%`,
                                fontSize: `${textElements.fontSize}px`,
                                color: textElements.color,
                                fontFamily: textElements.fontFamily,
                                padding: '0.25rem',
                                transform: 'translate(-50%, -50%)',
                                lineHeight: '1.2',
                                width: '80%',
                                maxWidth: '80%',
                                textShadow: '0 0 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span className="whitespace-pre-wrap break-words">
                                {filteredAttendees[0]?.studentName || 'Sample Name'}
                              </span>
                            </motion.div>

                            {!workshop.certificateTemplate && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-gray-500 text-sm">Certificate template preview</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                          {filteredAttendees.map(student => (
                            <div key={student.$id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0">
                                  {student.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{student.studentName}</h5>
                                  <p className="text-xs sm:text-sm text-gray-600 truncate">{student.USN}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
                                  {student.branch}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Year {student.year}
                                </span>
                              </div>

                              <button
                                onClick={() => generateCertificatePDF(workshop, student)}
                                disabled={isGeneratingPDF}
                                className="w-full flex items-center justify-center gap-1 px-2 sm:px-3 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download Certificate</span>
                              </button>
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

        {workshops.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base text-gray-500 mb-2">No workshops found</p>
            <p className="text-xs sm:text-sm text-gray-400">Workshops will appear here once they are added to the database</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkshopClientInterface