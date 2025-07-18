import { Client, Databases, Storage, ID, Query } from "appwrite";

export const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  workshopsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_WORKSHOPS_COLLECTION_ID!,
  storageId: process.env.NEXT_PUBLIC_APPWRITE_CERTGEN_STORAGE_ID!,

  studentsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID!,
  certGenBucket: process.env.NEXT_PUBLIC_APPWRITE_CERTGEN_STORAGE_ID!,

  devKey: process.env.NEXT_PUBLIC_APPWRITE_DEV_KEY!,
};

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setDevKey(config.devKey);

const databases = new Databases(client);
const storage = new Storage(client);

export const addStudent = async (
  studentName: string,
  USN: string,
  gender: string,
  branch: number,
  year: number
) => {
  try {
    const response = await databases.createDocument(
      config.databaseId,
      config.studentsCollectionId,
      ID.unique(),
      {
        studentName,
        USN,
        gender,
        branch,
        year,
      }
    );

    return response;
  } catch (err) {
    console.log("Error Adding Students: " + err);
  }
};

export const deleteStudent = async (studentId: string) => {
  try {
    const res = await databases.deleteDocument(
      config.databaseId,
      config.studentsCollectionId,
      studentId
    );
    return res;
  } catch (err) {
    console.log("Error Deleting Student: " + err);
  }
};

export const fetchStudents = async () => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.studentsCollectionId
    );

    return response.documents;
  } catch (err) {
    console.log("Error Fetching Students: " + err);
  }
};

export const addWorkshop = async (
  workshopName: string,
  resourcePerson: string,
  date: string,
  department: string,
  certificateTemplate: File,
  textElement: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily: string;
  }
) => {
  try {
    const uploaded = await storage.createFile(
      config.storageId,
      ID.unique(),
      certificateTemplate
    );

    const fileId = uploaded.$id;
    const fileUrl = storage.getFileView(config.storageId, fileId);

    const response = await databases.createDocument(
      config.databaseId,
      config.workshopsCollectionId,
      ID.unique(),
      {
        workshopName,
        resourcePerson,
        date,
        organizedDepartment: department,
        certificateTemplate: fileUrl,
        textElement: JSON.stringify(textElement),
      }
    );

    return response;
  } catch (err) {
    console.log("Error Adding Workshop: " + err);
  }
};

export const fetchWorkshops = async () => {
  try {
    const res = await databases.listDocuments(
      config.databaseId,
      config.workshopsCollectionId
    );

    return { documents: res.documents };
  } catch (error) {
    // console.error("Error fetching submissions:", error);
    return { documents: [], error };
  }
};

export const deleteWorkshop = async (workshopId: string) => {
  try {
    const res = await databases.deleteDocument(
      config.databaseId,
      config.workshopsCollectionId,
      workshopId
    );
    return res;
  } catch (err) {
    console.log("Error Deleting Student: " + err);
  }
};

export const setWorkshopAttendance = async (
  workshopId: string,
  attendingStudentIds: string[]
) => {
  try {
    const response = await databases.updateDocument(
      config.databaseId,
      config.workshopsCollectionId,
      workshopId,
      {
        students: attendingStudentIds,
      }
    );

    return response;
  } catch (err) {
    console.log("Error setting workshop attendance: " + err);
    throw err;
  }
};
