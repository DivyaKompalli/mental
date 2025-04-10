import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { auth } from '../firebase'

const db = getFirestore()

// Generic save function
export const saveToFirebase = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data)
    return docRef.id
  } catch (error) {
    console.error('Error saving to Firebase:', error)
    throw error
  }
}

// Journal entries
export const addJournalEntry = async (userId, entry) => {
  const docRef = await addDoc(collection(db, 'journalEntries'), {
    userId,
    ...entry,
    createdAt: new Date().toISOString(),
  })
  return docRef.id
}

export const getJournalEntries = async (userId) => {
  const q = query(collection(db, 'journalEntries'), where('userId', '==', userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Mood entries
export const addMoodEntry = async (userId, mood, note = '') => {
  const docRef = await addDoc(collection(db, 'moodEntries'), {
    userId,
    mood,
    note,
    createdAt: new Date().toISOString(),
  })
  return docRef.id
}

export const getMoodEntries = async (userId) => {
  const q = query(collection(db, 'moodEntries'), where('userId', '==', userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
