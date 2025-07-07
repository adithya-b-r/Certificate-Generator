"use client"

import { useState } from 'react'
import {
  Calendar,
  BookOpen,
  User,
  FileSignature,
  FileSpreadsheet,
  Upload,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'

const Workshops = () => {
  const [formData, setFormData] = useState({
    workshopName: '',
    resourcePerson: '',
    personSignature: null as File | null,
    date: '',
    department: '',
    certificateTemplate: null as File | null
  })

  const [formOpen, setFormOpen] = useState(true)
  const [listOpen, setListOpen] = useState(true)
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const [workshops, setWorkshops] = useState([
    {
      id: 1,
      workshopName: 'Advanced React Techniques',
      resourcePerson: 'Dr. Sarah Johnson',
      date: '2023-05-15',
      department: 'Computer Science',
      certificateTemplate: 'react_certificate.docx',
      signature: 'sarah_signature.png'
    },
    {
      id: 2,
      workshopName: 'Data Science Fundamentals',
      resourcePerson: 'Prof. Michael Chen',
      date: '2023-06-22',
      department: 'Data Science',
      certificateTemplate: 'datascience_certificate.docx',
      signature: 'chen_signature.png'
    },
    {
      id: 3,
      workshopName: 'UI/UX Design Principles',
      resourcePerson: 'Ms. Emily Rodriguez',
      date: '2023-07-10',
      department: 'Design',
      certificateTemplate: 'design_certificate.docx',
      signature: 'emily_signature.png'
    }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.files![0]
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newWorkshop = {
      id: workshops.length + 1,
      workshopName: formData.workshopName,
      resourcePerson: formData.resourcePerson,
      date: formData.date,
      department: formData.department,
      certificateTemplate: formData.certificateTemplate?.name || 'template.docx',
      signature: formData.personSignature?.name || 'signature.png'
    }
    setWorkshops([...workshops, newWorkshop])
    setFormData({
      workshopName: '',
      resourcePerson: '',
      personSignature: null,
      date: '',
      department: '',
      certificateTemplate: null
    })
  }

  const handleDelete = (id: number) => {
    setWorkshops(workshops.filter(workshop => workshop.id !== id))
  }

  const openWorkshopDetails = (workshop: any) => {
    setSelectedWorkshop(workshop)
    setShowModal(true)
  }

  return (
    <section className="text-black space-y-8 p-4 md:p-6">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Workshop Management</h3>
        <p className="text-gray-600">Add workshop details including workshop information, resource person details, certificate template, and participants list.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => setFormOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 md:px-6 md:py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold text-gray-800 text-left">Add New Workshop</h4>
              <p className="text-xs md:text-sm text-gray-500">Enter workshop information</p>
            </div>
          </div>
          <span className="text-gray-500 text-lg md:text-xl">{formOpen ? '-' : '+'}</span>
        </button>

        {formOpen && (
          <form onSubmit={handleSubmit} className="px-4 pb-4 md:px-6 md:pb-6">
            <div className="space-y-4 md:space-y-6 pt-4 md:pt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                    Workshop/Session Name *
                  </label>
                  <input
                    type="text"
                    name="workshopName"
                    value={formData.workshopName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter workshop name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-3 h-3 md:w-4 md:h-4" />
                    Resource Person *
                  </label>
                  <input
                    type="text"
                    name="resourcePerson"
                    value={formData.resourcePerson}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter resource person name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                    Organized Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter department name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileSignature className="w-3 h-3 md:w-4 md:h-4" />
                    Resource Person Signature *
                  </label>
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-3 md:p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'personSignature')}
                      className="hidden"
                      required
                    />
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <Upload className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                      <span className="text-xs md:text-sm text-gray-700">
                        {formData.personSignature ? formData.personSignature.name : 'Click to upload signature image'}
                      </span>
                      <p className="text-xs text-gray-500">Supports only PNG</p>
                    </div>
                  </label>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileSpreadsheet className="w-3 h-3 md:w-4 md:h-4" />
                    Certificate Template (DOCX) *
                  </label>
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-3 md:p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".docx"
                      onChange={(e) => handleFileUpload(e, 'certificateTemplate')}
                      className="hidden"
                      required
                    />
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <Upload className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                      <span className="text-xs md:text-sm text-gray-700">
                        {formData.certificateTemplate ? formData.certificateTemplate.name : 'Click to upload DOCX template'}
                      </span>
                      <p className="text-xs text-gray-500">Microsoft Word document (.docx)</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex w-full justify-center">
                <button
                  type="submit"
                  className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm md:text-base"
                >
                  <Upload className="w-4 h-4 md:w-5 md:h-5" />
                  Upload Workshop Details
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setListOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 md:px-6 md:py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold text-gray-800 text-left">Workshop Records</h4>
              <p className="text-xs md:text-sm text-gray-500">List of all workshops conducted</p>
            </div>
          </div>
          {listOpen ? (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          )}
        </button>

        {listOpen && (
          <div className="overflow-x-auto">
            <table className="w-full hidden md:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workshop Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource Person</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workshops.map(workshop => (
                  <tr key={workshop.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{workshop.workshopName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{workshop.resourcePerson}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{workshop.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(workshop.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openWorkshopDetails(workshop)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(workshop.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden space-y-4 p-4">
              {workshops.map(workshop => (
                <div key={workshop.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{workshop.workshopName}</h4>
                      <p className="text-sm text-gray-500 mt-1">{workshop.resourcePerson}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openWorkshopDetails(workshop)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(workshop.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>{workshop.department}</span>
                    <span>{new Date(workshop.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {workshops.length === 0 && (
              <div className="px-4 py-8 md:px-6 md:py-12 text-center">
                <p className="text-gray-500 text-sm md:text-base">No workshops found. Add a new workshop to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selectedWorkshop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Workshop Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Workshop Name</h4>
                  <p className="mt-1 text-gray-900">{selectedWorkshop.workshopName}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Resource Person</h4>
                  <p className="mt-1 text-gray-900">{selectedWorkshop.resourcePerson}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Department</h4>
                  <p className="mt-1 text-gray-900">{selectedWorkshop.department}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Date</h4>
                  <p className="mt-1 text-gray-900">{new Date(selectedWorkshop.date).toLocaleDateString()}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Certificate Template</h4>
                  <p className="mt-1 text-gray-900">{selectedWorkshop.certificateTemplate}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Signature File</h4>
                  <p className="mt-1 text-gray-900">{selectedWorkshop.signature}</p>
                </div>
              </div>

              <div className="mt-6 w-full">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Workshops