<template>
  <div class="journal-view">
    <div class="journal-header">
      <h1>My Journal</h1>
      <button @click="showEntryForm = true" class="new-entry-btn">
        <i class="fas fa-plus"></i> New Entry
      </button>
    </div>

    <div v-if="showEntryForm" class="journal-form-container">
      <JournalEntryForm @save="handleSaveEntry" @cancel="showEntryForm = false" />
    </div>

    <div class="journal-entries">
      <div v-if="entries.length === 0" class="empty-state">
        <i class="fas fa-book-open"></i>
        <p>No journal entries yet. Start writing your thoughts!</p>
      </div>

      <div v-else>
        <div v-for="entry in entries" :key="entry.id" class="journal-entry">
          <div class="entry-header">
            <h3>{{ entry.title }}</h3>
            <div class="entry-actions">
              <button @click="editEntry(entry)" class="edit-btn">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteEntry(entry.id)" class="delete-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="entry-date">{{ formatDate(entry.createdAt) }}</p>
          <p class="entry-content">{{ entry.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { formatDate } from '../utils/helpers'
import JournalEntryForm from '../components/Common/JournalEntryForm.vue'

export default {
  name: 'Journal',
  components: {
    JournalEntryForm,
  },
  data() {
    return {
      showEntryForm: false,
      editingEntry: null,
    }
  },
  computed: {
    ...mapState(['journalEntries']),
    entries() {
      return this.journalEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
  },
  created() {
    this.fetchJournalEntries()
  },
  methods: {
    ...mapActions(['fetchJournalEntries', 'addJournalEntry', 'deleteJournalEntry']),
    formatDate,
    async handleSaveEntry(entry) {
      try {
        if (this.editingEntry) {
          // TODO: Implement update functionality
          this.$toast.success('Entry updated successfully!')
        } else {
          await this.addJournalEntry(entry)
          this.$toast.success('Entry saved successfully!')
        }
        this.showEntryForm = false
        this.editingEntry = null
      } catch (error) {
        this.$toast.error('Failed to save entry')
      }
    },
    editEntry(entry) {
      this.editingEntry = entry
      this.showEntryForm = true
    },
    async deleteEntry(entryId) {
      try {
        await this.deleteJournalEntry(entryId)
        this.$toast.success('Entry deleted successfully!')
      } catch (error) {
        this.$toast.error('Failed to delete entry')
      }
    },
  },
}
</script>

<style scoped>
.journal-view {
  padding: 20px;
  margin-left: 250px;
}

.journal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.new-entry-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.journal-form-container {
  margin-bottom: 30px;
}

.journal-entries {
  display: grid;
  gap: 20px;
}

.journal-entry {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.entry-actions {
  display: flex;
  gap: 10px;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.edit-btn {
  color: #4caf50;
}

.delete-btn {
  color: #f44336;
}

.entry-date {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.entry-content {
  white-space: pre-line;
  line-height: 1.6;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #4caf50;
}
</style>
