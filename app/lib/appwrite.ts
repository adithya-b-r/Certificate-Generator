import { Client, Databases, Storage, ID, Query } from "appwrite";

export const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  workshopsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_WORKSHOPS_COLLECTION_ID!,
  studentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID!,
  certGenBucket: process.env.NEXT_PUBLIC_APPWRITE_CERTGEN_STORAGE_ID!,
  devKey: process.env.NEXT_PUBLIC_APPWRITE_DEV_KEY!,
};

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setDevKey(config.devKey);

const databases = new Databases(client);

export const addStudents = async (studentName: string, USN: string, gender: string, branch: number, year: Date) => {
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
        year
      }
    );

    return response;
  } catch (err) {
    console.log("Error Adding Students: " + err);
  }
};