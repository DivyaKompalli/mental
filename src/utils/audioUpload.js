// src/utils/audioUpload.js
import { storage } from '@/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const uploadAudio = async (userId, audioBlob) => {
  try {
    const storageRef = ref(storage, `voiceEntries/${userId}/${Date.now()}.wav`)
    await uploadBytes(storageRef, audioBlob)
    return await getDownloadURL(storageRef)
  } catch (error) {
    console.error('Error uploading audio:', error)
    throw error
  }
}
