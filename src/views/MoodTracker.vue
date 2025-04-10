<template>
  <div class="mood-tracker-container">
    <h2 class="tracker-title">Mood Tracker</h2>

    <div class="input-section">
      <textarea
        v-model="userInput"
        placeholder="How are you feeling today? Share your thoughts..."
        class="mood-textarea"
        ref="textInput"
      ></textarea>

      <VoiceInput @transcript="handleVoiceInput" @error="handleVoiceError" class="voice-input" />

      <div class="action-buttons">
        <button @click="analyzeMood" :disabled="!userInput.trim() || isLoading" class="analyze-btn">
          <span v-if="!isLoading">Analyze Mood</span>
          <span v-else>Analyzing...</span>
        </button>

        <button v-if="userInput.trim()" @click="clearInput" class="clear-btn">Clear</button>
      </div>
    </div>

    <div v-if="analysisResult" class="results-section">
      <div class="sentiment-display" :class="analysisResult.sentiment.toLowerCase()">
        <h3>Your Mood:</h3>
        <div class="sentiment-info">
          <span class="sentiment-label">{{ analysisResult.sentiment }}</span>
          <span class="confidence">({{ analysisResult.confidence }}% confidence)</span>
        </div>

        <div class="suggestions-container">
          <h4>Suggestions:</h4>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in suggestions" :key="index">
              <i class="fas fa-lightbulb suggestion-icon"></i>
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>

      <div class="result-actions">
        <button @click="saveToJournal" class="save-btn">
          <i class="fas fa-book"></i> Save to Journal
        </button>
        <button @click="trySuggestion" class="try-btn">
          <i class="fas fa-play"></i> Try Suggestion
        </button>
      </div>
    </div>

    <MobileFeedback ref="feedback" />
  </div>
</template>

<script>
import { analyzeSentiment, generateSuggestions } from '../services/sentiment'
import VoiceInput from '../components/VoiceInput.vue'
import MobileFeedback from '../components/MobileFeedback.vue'

export default {
  components: {
    VoiceInput,
    MobileFeedback,
  },
  data() {
    return {
      userInput: '',
      analysisResult: null,
      suggestions: [],
      isLoading: false,
      lastAnalysis: null,
    }
  },
  methods: {
    async analyzeMood() {
      if (!this.userInput.trim()) return

      this.isLoading = true
      try {
        // Check if we already analyzed this exact text
        if (this.lastAnalysis && this.lastAnalysis.text === this.userInput) {
          this.analysisResult = this.lastAnalysis.result
          this.suggestions = this.lastAnalysis.suggestions
          return
        }

        const result = await analyzeSentiment(this.userInput)
        this.analysisResult = result
        this.suggestions = generateSuggestions(result.sentiment, result.confidence)

        // Cache the result
        this.lastAnalysis = {
          text: this.userInput,
          result: this.analysisResult,
          suggestions: this.suggestions,
        }

        // Show feedback
        this.$refs.feedback.show(
          `Detected ${result.sentiment.toLowerCase()} mood`,
          result.sentiment === 'NEGATIVE' ? 'warning' : 'info',
        )
      } catch (error) {
        console.error('Analysis failed:', error)
        this.$refs.feedback.show('Analysis failed. Please try again.', 'error')
      } finally {
        this.isLoading = false
      }
    },
    handleVoiceInput(transcript) {
      this.userInput = transcript
      this.$refs.textInput.focus()
      this.$nextTick(() => {
        this.analyzeMood()
      })
    },
    handleVoiceError(error) {
      this.$refs.feedback.show('Voice input failed: ' + error, 'error')
    },
    clearInput() {
      this.userInput = ''
      this.analysisResult = null
      this.lastAnalysis = null
      this.$refs.textInput.focus()
    },
    saveToJournal() {
      if (!this.analysisResult) return

      const entry = {
        text: this.userInput,
        sentiment: this.analysisResult,
        date: new Date().toISOString(),
      }

      this.$store.dispatch('journal/addEntry', entry)
      this.$refs.feedback.show('Entry saved to journal', 'success')
      this.clearInput()
    },
    trySuggestion() {
      if (!this.suggestions.length) return

      // Simple routing based on first suggestion
      const firstSuggestion = this.suggestions[0].toLowerCase()

      if (firstSuggestion.includes('breathing')) {
        this.$router.push('/exercises/breathing')
      } else if (firstSuggestion.includes('journal')) {
        this.$router.push('/journal')
      } else if (firstSuggestion.includes('rage')) {
        this.$router.push('/exercises/rage-room')
      } else {
        this.$router.push('/exercises')
      }
    },
  },
}
</script>

<style scoped>
.mood-tracker-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.tracker-title {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-weight: 600;
}

.input-section {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.mood-textarea {
  width: 100%;
  min-height: 150px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  margin-bottom: 15px;
  transition: border-color 0.3s;
}

.mood-textarea:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.voice-input {
  margin: 10px 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.analyze-btn {
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  flex: 1;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.clear-btn {
  background: #f1f1f1;
  color: #666;
}

.clear-btn:hover {
  background: #e0e0e0;
}

.results-section {
  margin-top: 30px;
  animation: fadeIn 0.5s ease;
}

.sentiment-display {
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
}

.sentiment-display.positive {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-left: 6px solid #4caf50;
}

.sentiment-display.negative {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  border-left: 6px solid #f44336;
}

.sentiment-display.neutral {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-left: 6px solid #2196f3;
}

.sentiment-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0 20px;
}

.sentiment-label {
  font-size: 24px;
  font-weight: 600;
  text-transform: capitalize;
}

.confidence {
  font-size: 14px;
  color: #666;
}

.suggestions-container {
  background: rgba(255, 255, 255, 0.7);
  padding: 15px;
  border-radius: 8px;
}

.suggestions-list {
  padding-left: 20px;
  margin-top: 10px;
}

.suggestions-list li {
  margin-bottom: 10px;
  line-height: 1.5;
}

.suggestion-icon {
  color: #ffc107;
  margin-right: 8px;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.save-btn {
  background: #5c6bc0;
  color: white;
  flex: 1;
}

.save-btn:hover {
  background: #3f51b5;
}

.try-btn {
  background: #26a69a;
  color: white;
  flex: 1;
}

.try-btn:hover {
  background: #00897b;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .mood-tracker-container {
    padding: 15px;
  }

  .action-buttons,
  .result-actions {
    flex-direction: column;
  }

  button {
    width: 100%;
  }

  .mood-textarea {
    min-height: 120px;
  }
}

@media (max-width: 480px) {
  .tracker-title {
    font-size: 22px;
  }

  .sentiment-label {
    font-size: 20px;
  }

  .suggestions-container {
    padding: 10px;
  }
}
</style>
