import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'

export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, {
      displayName: name,
    })
    return userCredential.user
  } catch (error) {
    throw error
  }
}

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}
