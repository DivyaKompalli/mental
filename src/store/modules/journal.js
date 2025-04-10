import { db } from '@/services/database'

export default {
  namespaced: true,
  state: {
    entries: [],
    loaded: false,
  },
  mutations: {
    SET_ENTRIES(state, entries) {
      state.entries = entries
    },
    ADD_ENTRY(state, entry) {
      state.entries.unshift(entry) // Add to beginning for chronological order
    },
    SET_LOADED(state) {
      state.loaded = true
    },
  },
  actions: {
    async loadEntries({ commit }) {
      try {
        const entries = await db.collection('journal').orderBy('date', 'desc').get()
        const formattedEntries = entries.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        commit('SET_ENTRIES', formattedEntries)
        commit('SET_LOADED')
      } catch (error) {
        console.error('Failed to load journal entries:', error)
      }
    },
    async addEntry({ commit }, entry) {
      try {
        // Add to Firebase
        const docRef = await db.collection('journal').add({
          ...entry,
          createdAt: new Date().toISOString(),
        })

        // Add to local state
        commit('ADD_ENTRY', {
          id: docRef.id,
          ...entry,
        })

        return docRef.id
      } catch (error) {
        console.error('Failed to add journal entry:', error)
        throw error
      }
    },
    async deleteEntry({ commit, state }, entryId) {
      try {
        await db.collection('journal').doc(entryId).delete()
        commit(
          'SET_ENTRIES',
          state.entries.filter((e) => e.id !== entryId),
        )
      } catch (error) {
        console.error('Failed to delete journal entry:', error)
        throw error
      }
    },
  },
  getters: {
    allEntries: (state) => state.entries,
    recentEntries: (state) => state.entries.slice(0, 5),
    entryCount: (state) => state.entries.length,
    loaded: (state) => state.loaded,
    getEntryById: (state) => (id) => state.entries.find((entry) => entry.id === id),
  },
}
