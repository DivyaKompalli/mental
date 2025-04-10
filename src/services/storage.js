import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath)
    await deleteObject(fileRef)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

export const getFileUrl = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath)
    return await getDownloadURL(fileRef)
  } catch (error) {
    console.error('Error getting file URL:', error)
    throw error
  }
}
