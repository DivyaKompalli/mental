<template>
  <div class="mood-tracker-view">
    <h1>Mood Tracker</h1>

    <div class="mood-tracker-container">
      <div class="mood-input-section">
        <h2>How are you feeling today?</h2>
        <MoodSelector @mood-selected="handleMoodSelection" />

        <div v-if="selectedMood" class="mood-note-section">
          <textarea
            v-model="moodNote"
            placeholder="Add a note about your mood (optional)"
          ></textarea>
          <button @click="saveMoodEntry" class="save-btn">Save Mood Entry</button>
        </div>
      </div>

      <div class="mood-history-section">
        <h2>Your Mood History</h2>

        <div v-if="moodEntries.length === 0" class="empty-state">
          <i class="fas fa-chart-line"></i>
          <p>No mood entries yet. Track your first mood!</p>
        </div>

        <div v-else>
          <div class="mood-stats">
            <div class="stat-card">
              <h3>Most Common Mood</h3>
              <div class="stat-value">
                <i :class="mostCommonMoodIcon"></i>
                <span>{{ mostCommonMoodLabel }}</span>
              </div>
            </div>

            <div class="stat-card">
              <h3>Entries This Week</h3>
              <div class="stat-value">
                {{ weeklyEntriesCount }}
              </div>
            </div>
          </div>

          <MoodHistoryChart :entries="moodEntries" />

          <div class="mood-entries-list">
            <div
              v-for="entry in moodEntries"
              :key="entry.id"
              class="mood-entry"
              :style="{ borderLeft: `4px solid ${getMoodColor(entry.mood)}` }"
            >
              <div class="entry-mood">
                <i :class="getMoodIcon(entry.mood)"></i>
                <span>{{ getMoodLabel(entry.mood) }}</span>
              </div>
              <div class="entry-date">
                {{ formatDateTime(entry.createdAt) }}
              </div>
              <div v-if="entry.note" class="entry-note">
                {{ entry.note }}
              </div>
              <button @click="deleteMoodEntry(entry.id)" class="delete-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import {
  getMoodIcon,
  getMoodLabel,
  getMoodColor,
  formatDate,
  formatDateTime,
} from '../utils/helpers'
import MoodSelector from '../components/Common/MoodSelector.vue'
import MoodHistoryChart from '../components/Common/MoodHistoryChart.vue'

export default {
  name: 'MoodTracker',
  components: {
    MoodSelector,
    MoodHistoryChart,
  },
  data() {
    return {
      selectedMood: null,
      moodNote: '',
    }
  },
  computed: {
    ...mapState(['moodEntries', 'currentUser']),
    mostCommonMood() {
      if (this.moodEntries.length === 0) return null

      const moodCounts = {}
      this.moodEntries.forEach((entry) => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
      })

      return Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b))
    },
    mostCommonMoodIcon() {
      return getMoodIcon(this.mostCommonMood)
    },
    mostCommonMoodLabel() {
      return getMoodLabel(this.mostCommonMood)
    },
    weeklyEntriesCount() {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      return this.moodEntries.filter((entry) => new Date(entry.createdAt) > oneWeekAgo).length
    },
  },
  created() {
    this.fetchMoodEntries()
  },
  methods: {
    ...mapActions(['fetchMoodEntries', 'addMoodEntry', 'deleteMoodEntry']),
    getMoodIcon,
    getMoodLabel,
    getMoodColor,
    formatDate,
    formatDateTime,
    handleMoodSelection(mood) {
      this.selectedMood = mood
    },
    async saveMoodEntry() {
      try {
        await this.addMoodEntry({
          mood: this.selectedMood,
          note: this.moodNote,
        })
        this.$toast.success('Mood entry saved successfully!')
        this.selectedMood = null
        this.moodNote = ''
      } catch (error) {
        this.$toast.error('Failed to save mood entry')
      }
    },
    async deleteMoodEntry(entryId) {
      try {
        await this.deleteMoodEntry(entryId)
        this.$toast.success('Mood entry deleted successfully!')
      } catch (error) {
        this.$toast.error('Failed to delete mood entry')
      }
    },
    async saveToFirebase(entry) {
      const db = getFirestore()
      try {
        await addDoc(collection(db, 'moodEntries'), entry)
      } catch (error) {
        console.error('Firebase error:', error)
        throw new Error('Failed to save mood entry') // Re-throw with user-friendly message
      }
    },
    // In your component
  },
}
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

const store = useStore()
const toast = useToast()

const selectedMood = ref('')
const moodNote = ref('')
const errorMessage = ref('')

const saveMood = async () => {
  try {
    if (!selectedMood.value) {
      throw new Error('Please select a mood')
    }

    await store.dispatch('addMoodEntry', {
      mood: selectedMood.value,
      note: moodNote.value,
    })

    // Reset form
    selectedMood.value = ''
    moodNote.value = ''
    errorMessage.value = ''

    toast.success('Mood saved successfully!')
  } catch (error) {
    errorMessage.value = error.message
    toast.error(error.message)
  }
}
</script>

<style scoped>
.mood-tracker-view {
  max-width: 1000px;
  margin: 0 auto;
}

.mood-tracker-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.mood-input-section,
.mood-history-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.mood-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.mood-entries-list {
  margin-top: 1.5rem;
}

.mood-entry {
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid;
}

.animation-container {
  margin: 0 auto;
}

@media (min-width: 992px) {
  .mood-tracker-container {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
