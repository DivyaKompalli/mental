<template>
  <div class="mood-tracker">
    <!-- <h2>How are you feeling today?</h2> -->
    <div class="mood-options">
      <button
        v-for="mood in moods"
        :key="mood.value"
        @click="selectMood(mood.value)"
        :class="{ active: selectedMood === mood.value }"
      >
        <span :class="mood.icon"></span>
        <p>{{ mood.label }}</p>
      </button>
    </div>
    <div class="mood-note" v-if="selectedMood">
      <textarea v-model="note" placeholder="Add a note about your mood..."></textarea>
      <button @click="saveMoodEntry()">Save</button>
    </div>
  </div>
</template>

<script>
import { db } from '../../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { mapState } from 'vuex'

export default {
  name: 'MoodTracker',
  data() {
    return {
      moods: [
        { value: 'happy', label: 'Happy', icon: 'fas fa-smile' },
        { value: 'sad', label: 'Sad', icon: 'fas fa-sad-tear' },
        { value: 'angry', label: 'Angry', icon: 'fas fa-angry' },
        { value: 'anxious', label: 'Anxious', icon: 'fas fa-flushed' },
        { value: 'tired', label: 'Tired', icon: 'fas fa-tired' },
      ],
      selectedMood: null,
      note: '',
    }
  },
  computed: {
    ...mapState(['currentUser']),
  },
  methods: {
    selectMood(mood) {
      this.selectedMood = mood
    },
    async saveMoodEntry() {
      if (!this.selectedMood) {
        this.$toast.error('Please select a mood before saving.')
        return
      }
      if (!this.currentUser) {
        this.$toast.error('User not authenticated.')
        return
      }

      try {
        const docRef = await addDoc(collection(db, 'moodEntries'), {
          userId: this.currentUser.uid,
          mood: this.selectedMood,
          note: this.note,
          createdAt: serverTimestamp(),
        })
        console.log('Mood entry saved with ID:', docRef.id) // Debugging log
        this.selectedMood = null
        this.note = ''
        this.$toast.success('Mood entry saved successfully!')
      } catch (error) {
        console.error('Error saving mood entry:', error.message) // Detailed error log
        this.$toast.error('Failed to save mood entry. Please try again.')
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
  },
}
</script>

<style scoped>
.mood-tracker {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.mood-options {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.mood-options button {
  background: none;
  border: none;
  cursor: pointer;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.mood-options button.active {
  background-color: #f0f0f0;
  transform: scale(1.1);
}

.mood-options span {
  font-size: 2rem;
  display: block;
  margin-bottom: 5px;
}

.mood-note {
  margin-top: 20px;
}

.mood-note textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  resize: vertical;
}

.mood-note button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
