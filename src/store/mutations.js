export default {
  SET_CURRENT_USER(state, user) {
    state.currentUser = user
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_MOOD_ENTRIES(state, entries) {
    state.moodEntries = entries
  },
  ADD_MOOD_ENTRY(state, entry) {
    state.moodEntries.unshift(entry)
  },
  REMOVE_MOOD_ENTRY(state, entryId) {
    state.moodEntries = state.moodEntries.filter((entry) => entry.id !== entryId)
  },
  SET_JOURNAL_ENTRIES(state, entries) {
    state.journalEntries = entries
  },
  ADD_JOURNAL_ENTRY(state, entry) {
    state.journalEntries.unshift(entry)
  },
  REMOVE_JOURNAL_ENTRY(state, entryId) {
    state.journalEntries = state.journalEntries.filter((entry) => entry.id !== entryId)
  },
  ADD_RAGE_SESSION(state, session) {
    state.rageSessions.unshift(session)
  },
  ADD_SCULPTURE(state, sculpture) {
    state.sculptures.unshift(sculpture)
  },
}
