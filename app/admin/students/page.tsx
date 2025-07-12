"use client"

import { useEffect, useState } from 'react'
import { User, Hash, Users, BookOpen, Calendar, Plus, Upload, FileSpreadsheet, Download, Trash } from 'lucide-react'
import * as XLSX from 'xlsx'

import { addStudent, deleteStudent, fetchStudents } from '@/app/lib/appwrite'

const Students = () => {

  useEffect(() => {
    const getStudents = async () => {
      const data = await fetchStudents()
      if (data) setStudents(data)
    }

    getStudents()
  }, [])


  const [formData, setFormData] = useState({
    studentName: '',
    USN: '',
    gender: '',
    branch: '',
    year: ''
  })

  const [students, setStudents] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [excelOpen, setExcelOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('')

  const [dbUpdate, setDbUpdate] = useState(false);
  const [updateCounter, setUpdateCounter] = useState(0);

  const getUniqueBranches = (students: any[]) => {
    const branches = students.map((student: { branch: any }) => student.branch).filter((branch: any) => branch);
    return [...new Set(branches)].sort();
  };

  const handleDeleteStudent = async (studentId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this student?");
    if (!confirm) return;

    try {
      await deleteStudent(studentId);
      const updatedList = await fetchStudents();
      if (updatedList) setStudents(updatedList);
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };

  const branchDisplayNames = {
    'cse': 'Computer Science & Engineering',
    'ise': 'Information Science & Engineering',
    'ece': 'Electronics & Communication Engineering',
    'eee': 'Electrical & Electronics Engineering',
    'mech': 'Mechanical Engineering',
    'civil': 'Civil Engineering',
    'mca': 'Master of Computer Applications',
    'mba': 'Master of Business Administration',
    'btech': 'Bachelor of Technology',
    'mtech': 'Master of Technology',
    'electronics & communication': 'Electronics & Communication Engineering',
    'computer science': 'Computer Science & Engineering',
    'mechanical engineering': 'Mechanical Engineering',
    'electrical engineering': 'Electrical & Electronics Engineering',
    'information technology': 'Information Technology',
  };

  const getBranchDisplayName = (branch: string) => {
    if (!branch) return '';
    const lowerBranch = branch.toLowerCase();
    return branchDisplayNames[lowerBranch as keyof typeof branchDisplayNames] || branch;
  };

  const uniqueBranches = getUniqueBranches(students);

  const uploadToDB = async () => {
    setDbUpdate(true);
    setUpdateCounter(0);

    const uniqueStudents = students.reduce((acc, curr) => {
      const exists = acc.some(
        (s: { USN: string }) => s.USN.trim().toLowerCase() === curr.USN.trim().toLowerCase()
      );
      return exists ? acc : [...acc, curr];
    }, []);

    let successCount = 0;
    const failedUSNs: string[] = [];

    for (let i = 0; i < uniqueStudents.length; i++) {
      const student = uniqueStudents[i];

      try {
        await addStudent(
          student.studentName,
          student.USN,
          student.gender,
          student.branch,
          Number(student.year)
        );

        successCount++;
        setUpdateCounter((prev) => prev + 1);
      } catch (err) {
        failedUSNs.push(student.USN);
        console.error(`Failed to add ${student.studentName}`, err);
      }
    }

    const successfulUSNs = uniqueStudents
      .filter((s: { USN: string }) => !failedUSNs.includes(s.USN))
      .map((s: { USN: string }) => s.USN.toLowerCase());

    setStudents(prev =>
      prev.filter(s => !successfulUSNs.includes(s.USN.trim().toLowerCase()))
    );

    setDbUpdate(false);
  };


  const searchFilteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.USN.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = selectedBranchFilter
    ? searchFilteredStudents.filter(student => student.branch === selectedBranchFilter)
    : searchFilteredStudents;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    console.log(formData);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = students.some(
      student => student.USN.trim().toLowerCase() === formData.USN.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("Student with this USN already exists.");
      return;
    }

    setStudents(prev => [...prev, { ...formData, id: Date.now() }]);
    handleReset();
  };


  const handleReset = () => {
    setFormData({
      studentName: '',
      USN: '',
      gender: '',
      branch: '',
      year: ''
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const mappedData = jsonData.map((row: any, index: number) => ({
          id: Date.now() + index,
          studentName: row['Student Name'] || row['Name'] || row['student_name'] || '',
          USN: (row['USN'] || row['usn'] || '').trim(),
          gender: row['Gender'] || row['gender'] || '',
          branch: row['Branch'] || row['branch'] || row['Department'] || '',
          year: row['Year'] || row['year'] || row['Academic Year'] || ''
        }));

        const uniqueNewStudents = mappedData.filter(newStudent => {
          return !students.some(
            existing => existing.USN.trim().toLowerCase() === newStudent.USN.toLowerCase()
          );
        });

        setStudents(prev => [...prev, ...uniqueNewStudents]);

        setUploading(false)
        e.target.value = ''
      } catch (error) {
        setUploadError('Error reading Excel file. Please check the format.')
        setUploading(false)
      }
    }
    reader.readAsBinaryString(file)
  }

  const downloadTemplate = () => {
    const template = [
      {
        'Student Name': 'Adithya B R',
        'USN': '4SH24MC009',
        'Gender': 'Male',
        'Branch': 'MCA',
        'Year': '1'
      },
      {
        'Student Name': 'Rahul Sharma',
        'USN': '4SH24MC043',
        'Gender': 'Male',
        'Branch': 'Information Science & Engineering',
        'Year': '2'
      },
      {
        'Student Name': 'Payal Patel',
        'USN': '4SH24EC012',
        'Gender': 'Female',
        'Branch': 'Electronics & Communication',
        'Year': '3'
      },
      {
        'Student Name': 'Aarav Gupta',
        'USN': '4SH24CS105',
        'Gender': 'Male',
        'Branch': 'Computer Science',
        'Year': '4'
      },
      {
        'Student Name': 'Neha Singh',
        'USN': '4SH24ME034',
        'Gender': 'Female',
        'Branch': 'Mechanical Engineering',
        'Year': '2'
      },
      {
        'Student Name': 'Vikram Joshi',
        'USN': '4SH24EE078',
        'Gender': 'Male',
        'Branch': 'Electrical Engineering',
        'Year': '3'
      },
      {
        'Student Name': 'Ananya Reddy',
        'USN': '4SH24CV015',
        'Gender': 'Female',
        'Branch': 'Civil Engineering',
        'Year': '1'
      },
      {
        'Student Name': 'Rohan Malhotra',
        'USN': '4SH24AI022',
        'Gender': 'Male',
        'Branch': 'Artificial Intelligence',
        'Year': '2'
      },
      {
        'Student Name': 'Divya Iyer',
        'USN': '4SH24DS011',
        'Gender': 'Female',
        'Branch': 'Data Science',
        'Year': '3'
      },
      {
        'Student Name': 'Karthik Nair',
        'USN': '4SH24IT087',
        'Gender': 'Male',
        'Branch': 'Information Technology',
        'Year': '4'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students Template')
    XLSX.writeFile(wb, 'students_template.xlsx')
  }

  return (
    <section className="text-black">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Students Management</h3>
        <p className="text-gray-600">Add and manage student information for certificate generation</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => setFormOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 text-left">Add New Student</h4>
              <p className="text-sm text-gray-500">Enter student details below</p>
            </div>
          </div>
          <span className="text-gray-500 text-xl">{formOpen ? '-' : '+'}</span>
        </button>

        {formOpen && (
          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    USN (University Seat Number) *
                  </label>
                  <input
                    type="text"
                    name="USN"
                    value={formData.USN}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., 1AB21CS001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Branch *
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    required
                  >
                    <option value="">Select Branch</option>
                    {uniqueBranches.length > 0 && uniqueBranches.map(branchCode => (
                      <option key={branchCode as string} value={branchCode as string}>
                        {getBranchDisplayName(branchCode as string)}
                      </option>
                    ))}
                    {uniqueBranches.length === 0 && (
                      <>
                        <option value="cse">Computer Science & Engineering</option>
                        <option value="ise">Information Science & Engineering</option>
                        <option value="ece">Electronics & Communication Engineering</option>
                        <option value="eee">Electrical & Electronics Engineering</option>
                        <option value="mech">Mechanical Engineering</option>
                        <option value="civil">Civil Engineering</option>
                        <option value="it">Information Technology</option>
                        <option value="ai">Artificial Intelligence</option>
                        <option value="ds">Data Science</option>
                        <option value="mca">Master of Computer Applications</option>
                        <option value="mba">Master of Business Administration</option>
                        <option value="bca">Bachelor of Computer Applications</option>
                      </>
                    )}
                    <option value="custom">Other (Enter Custom Branch)</option>
                  </select>
                  {formData.branch === 'custom' && (
                    <input
                      type="text"
                      name="customBranch"
                      placeholder="Enter custom branch name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mt-2"
                      onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                    />
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Year *
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => setExcelOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg text-left font-semibold text-gray-800">Import from Excel</h4>
              <p className="text-sm text-gray-500 text-left">Upload Excel file with student data</p>
            </div>
          </div>
          <span className="text-gray-500 text-xl">{excelOpen ? '-' : '+'}</span>
        </button>

        {excelOpen && (
          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
              <p className="text-sm text-gray-600">Download template with correct columns</p>
            </div>

            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-700">
                    {uploading ? 'Uploading...' : 'Click to upload Excel file'}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Supports .xlsx and .xls files</p>
                </div>
              </div>
            </label>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{uploadError}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Expected Excel Format:</h5>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Student Name:</strong> Full name of the student</p>
                <p>• <strong>USN:</strong> University Seat Number</p>
                <p>• <strong>Gender:</strong> Male/Female/Other</p>
                <p>• <strong>Branch:</strong> Department/Branch name</p>
                <p>• <strong>Year:</strong> Academic year (1, 2, 3, or 4)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Students List</h4>
                <p className="text-sm text-gray-500">{students.length} student{students.length > 1 && 's'} added</p>
              </div>
            </div>
            <button
              onClick={() => setStudents([])}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, USN or branch..."
              className="flex-1 sm:flex-initial sm:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {uniqueBranches.length > 0 && (
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Branches ({students.length})</option>
                {uniqueBranches.map(branchCode => {
                  const branchCount = students.filter(s => s.branch === branchCode).length;
                  return (
                    <option key={String(branchCode)} value={String(branchCode)}>
                      {getBranchDisplayName(branchCode as string)} ({branchCount})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="overflow-x-scroll">
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">USN</th>
                  <th className="px-4 py-2">Gender</th>
                  <th className="px-4 py-2">Branch</th>
                  <th className="px-4 py-2">Year</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm">
                    <td className="px-4 py-3 text-gray-900 font-medium rounded-l-lg">{student.studentName}</td>
                    <td className="px-4 py-3 text-gray-700">{student.USN}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 text-blue-800 rounded-full capitalize">{student.gender}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 text-teal-800 rounded-full capitalize">
                        {student.branch}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 text-indigo-800 rounded-full">{student.year}</span>
                    </td>
                    <td className="px-4 py-3 rounded-r-lg">
                      <button
                        onClick={() => handleDeleteStudent(student.$id)}
                        className="text-red-600 hover:text-red-800 flex justify-center items-center"
                        title="Delete Student"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center text-gray-500 mt-6">
                {selectedBranchFilter
                  ? `No students found in ${getBranchDisplayName(selectedBranchFilter)} branch.`
                  : 'No matching students found.'
                }
              </div>
            )}

            <button
              onClick={uploadToDB}
              className="flex items-center justify-center gap-2 mx-auto mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              {dbUpdate ? `Updating Student... [${updateCounter}/${students.length}]` : 'Update Students'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default Students;