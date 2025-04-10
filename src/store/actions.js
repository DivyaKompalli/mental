import { registerUser, loginUser, logoutUser } from '../services/auth'
import {
  addJournalEntry,
  getJournalEntries,
  addMoodEntry,
  getMoodEntries,
  saveToFirebase,
} from '../services/database'

export default {
  async setCurrentUser({ commit }, user) {
    commit('SET_CURRENT_USER', user)
  },

  async register({ commit }, { email, password, name }) {
    commit('SET_LOADING', true)
    const user = await registerUser(email, password, name)
    commit('SET_CURRENT_USER', user)
    commit('SET_LOADING', false)
    return user
  },

  async login({ commit }, { email, password }) {
    commit('SET_LOADING', true)
    const user = await loginUser(email, password)
    commit('SET_CURRENT_USER', user)
    commit('SET_LOADING', false)
    return user
  },

  async logout({ commit }) {
    await logoutUser()
    commit('SET_CURRENT_USER', null)
    commit('SET_MOOD_ENTRIES', [])
    commit('SET_JOURNAL_ENTRIES', [])
  },

  async fetchJournalEntries({ commit, state }) {
    if (!state.currentUser) return
    const entries = await getJournalEntries(state.currentUser.uid)
    commit('SET_JOURNAL_ENTRIES', entries)
  },

  async addJournalEntry({ commit, state }, entry) {
    if (!state.currentUser) return
    const id = await addJournalEntry(state.currentUser.uid, entry)
    commit('ADD_JOURNAL_ENTRY', { id, ...entry })
    return id
  },

  async fetchMoodEntries({ commit, state }) {
    if (!state.currentUser) return
    const entries = await getMoodEntries(state.currentUser.uid)
    commit('SET_MOOD_ENTRIES', entries)
  },

  async addMoodEntry({ commit, state }, { mood, note = '' }) {
    if (!state.currentUser) throw new Error('User not authenticated')
    if (!mood) throw new Error('Mood is required')

    const completeEntry = {
      mood,
      note,
      userId: state.currentUser.uid,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    commit('ADD_MOOD_ENTRY', completeEntry)

    try {
      await saveToFirebase('moodEntries', completeEntry)
      return completeEntry
    } catch (error) {
      commit('REMOVE_MOOD_ENTRY', completeEntry.id)
      throw error
    }
  },
  async addRageSession({ commit, state }, sessionData) {
    if (!state.currentUser) throw new Error('User not authenticated')

    const sessionWithUser = {
      ...sessionData,
      userId: state.currentUser.uid,
      id: Date.now().toString(),
    }

    // If using Firebase:
    const docRef = await addDoc(collection(db, 'rageSessions'), sessionWithUser)

    commit('ADD_RAGE_SESSION', { id: docRef.id, ...sessionWithUser })
    return docRef.id
  },
  async addSculpture({ commit }, sculptureData) {
    const id = Date.now().toString()
    commit('ADD_SCULPTURE', { id, ...sculptureData })
    // Optional: Save to Firebase
    await addDoc(collection(db, 'sculptures'), sculptureData)
    return id
  },
}
