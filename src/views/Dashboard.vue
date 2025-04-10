<template>

  <div class="dashboard">
    <h1>Welcome, {{ userName }}!</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Current Mood</h3>
        <div v-if="latestMood" class="mood-display">
          <i :class="moodIcon(latestMood.mood)"></i>
          <span>{{ moodLabel(latestMood.mood) }}</span>
        </div>
        <div v-else>No mood recorded today</div>
      </div>

      <div class="stat-card">
        <h3>Journal Entries</h3>
        <div>{{ journalCount }}</div>
      </div>

      <div class="stat-card">
        <h3>Streak</h3>
        <div>{{ streakDays }} days</div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-buttons">
        <router-link to="/mood-tracker" class="action-button">
          <i class="fas fa-chart-line"></i>
          <span>Track Mood</span>
        </router-link>
        <router-link to="/journal" class="action-button">
          <i class="fas fa-book"></i>
          <span>Write Journal</span>
        </router-link>
        <router-link to="/exercises" class="action-button">
          <i class="fas fa-spa"></i>
          <span>Breathing Exercise</span>
        </router-link>
      </div>
    </div>

    <div class="recent-entries">
      <h2>Recent Journal Entries</h2>
      <div v-if="recentEntries.length > 0" class="entries-list">
        <div v-for="entry in recentEntries" :key="entry.id" class="entry-item">
          <h3>{{ entry.title }}</h3>
          <p>{{ truncateContent(entry.content) }}</p>
          <small>{{ formatDate(entry.createdAt) }}</small>
        </div>
      </div>
      <div v-else>No recent journal entries</div>
    </div>
  </div>

</template>

<script>
import { mapState } from 'vuex'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'

export default {
  name: 'Dashboard',
  data() {
    return {
      latestMood: null,
      journalCount: 0,
      streakDays: 0,
      recentEntries: [],
    }
  },
  computed: {
    ...mapState(['currentUser']),
    userName() {
      return this.currentUser?.displayName || 'User'
    },
  },
  created() {
    this.fetchDashboardData()
  },
  methods: {
    fetchDashboardData() {
      if (!this.currentUser) return

      // Fetch latest mood
      const moodQuery = query(
        collection(db, 'moodEntries'),
        where('userId', '==', this.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1),
      )

      onSnapshot(moodQuery, (snapshot) => {
        if (!snapshot.empty) {
          this.latestMood = snapshot.docs[0].data()
        }
      })

      // Fetch journal count
      const journalQuery = query(
        collection(db, 'journalEntries'),
        where('userId', '==', this.currentUser.uid),
      )

      onSnapshot(journalQuery, (snapshot) => {
        this.journalCount = snapshot.size
      })

      // Fetch recent journal entries
      const recentEntriesQuery = query(
        collection(db, 'journalEntries'),
        where('userId', '==', this.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(3),
      )

      onSnapshot(recentEntriesQuery, (snapshot) => {
        this.recentEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      })

      // TODO: Implement streak calculation
      this.streakDays = 7 // Placeholder
    },
    moodIcon(mood) {
      const icons = {
        happy: 'fas fa-smile',
        sad: 'fas fa-sad-tear',
        angry: 'fas fa-angry',
        anxious: 'fas fa-flushed',
        tired: 'fas fa-tired',
      }
      return icons[mood] || 'fas fa-question'
    },
    moodLabel(mood) {
      const labels = {
        happy: 'Happy',
        sad: 'Sad',
        angry: 'Angry',
        anxious: 'Anxious',
        tired: 'Tired',
      }
      return labels[mood] || 'Unknown'
    },
    truncateContent(content) {
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
  },
}
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;

  /* Background image styles */
  /* background-image: url(/src/assets/images/WhatsApp\ Image\ 2025-04-10\ at\ 02.02.38_8f3e8900.jpg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; */

}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

/* *{
  background-image: url(/src/assets/images/WhatsApp\ Image\ 2025-04-10\ at\ 02.02.38_8f3e8900.jpg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
} */

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  color: var(--primary);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-dark);
}

.quick-actions {
  margin: 2rem 0;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  text-decoration: none;
  /* background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s; */
}

.action-button{
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s;
}

.action-button {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.action-button i {
  font-size: 2rem;
}

.action-button span{
  color: var(--primary);
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
}

span{
  text-decoration:none;
}

.action-button:hover{
  transform: translateY(-5px);
}

.recent-entries {
  margin-top: 2rem;
}

.entries-list {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.entry-item {
  padding: 1.25rem;
  border-left: 4px solid var(--primary);
}

</style>
