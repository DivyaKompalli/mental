<template>
  <div class="journal-entry">
    <h2>Journal Entry</h2>
    <div class="entry-form">
      <input v-model="title" type="text" placeholder="Title" />
      <textarea v-model="content" placeholder="Write your thoughts here..."></textarea>
      <div class="actions">
        <button @click="saveEntry" :disabled="!title || !content">Save</button>
        <button @click="clearForm" class="secondary">Clear</button>
      </div>
    </div>
    <div class="entry-list" v-if="entries.length > 0">
      <h3>Your Journal Entries</h3>
      <div class="entry-item" v-for="entry in entries" :key="entry.id">
        <h4>{{ entry.title }}</h4>
        <p>{{ entry.content }}</p>
        <small>{{ formatDate(entry.createdAt) }}</small>
        <button @click="deleteEntry(entry.id)" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../..//firebase'
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { mapState } from 'vuex'

export default {
  name: 'JournalEntry',
  data() {
    return {
      title: '',
      content: '',
      entries: [],
    }
  },
  computed: {
    ...mapState(['currentUser']),
  },
  created() {
    this.fetchEntries()
  },
  methods: {
    async fetchEntries() {
      if (!this.currentUser) return

      const q = query(collection(db, 'journalEntries'), where('userId', '==', this.currentUser.uid))

      onSnapshot(q, (snapshot) => {
        this.entries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      })
    },
    async saveEntry() {
      if (!this.title || !this.content || !this.currentUser) return

      try {
        await addDoc(collection(db, 'journalEntries'), {
          userId: this.currentUser.uid,
          title: this.title,
          content: this.content,
          createdAt: new Date(),
        })
        this.clearForm()
        this.$toast.success('Journal entry saved successfully!')
      } catch (error) {
        console.error('Error saving journal entry:', error)
        this.$toast.error('Failed to save journal entry')
      }
    },
    async deleteEntry(entryId) {
      try {
        await deleteDoc(doc(db, 'journalEntries', entryId))
        this.$toast.success('Entry deleted successfully!')
      } catch (error) {
        console.error('Error deleting entry:', error)
        this.$toast.error('Failed to delete entry')
      }
    },
    clearForm() {
      this.title = ''
      this.content = ''
    },
    formatDate(date) {
      return new Date(date).toLocaleString()
    },
  },
}
</script>

<style scoped>
.journal-entry {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.entry-form input,
.entry-form textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.entry-form textarea {
  height: 200px;
  resize: vertical;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:first-child {
  background-color: #4caf50;
  color: white;
}

.actions button:first-child:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.actions button.secondary {
  background-color: #f0f0f0;
}

.entry-list {
  margin-top: 30px;
}

.entry-item {
  background-color: #f9f9f9;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  position: relative;
}

.entry-item h4 {
  margin-top: 0;
}

.entry-item small {
  color: #666;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
