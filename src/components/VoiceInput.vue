<template>
  <div class="voice-input-container">
    <button
      class="voice-input-btn"
      :class="{ recording: isRecording, disabled: !isSupported }"
      @touchstart.prevent="startRecording"
      @touchend.prevent="stopRecording"
      @mousedown.prevent="startRecording"
      @mouseup.prevent="stopRecording"
      @mouseleave="stopRecording"
      :disabled="!isSupported"
    >
      <i class="fas" :class="micIconClass"></i>
    </button>
    <div v-if="isRecording" class="recording-visualizer">
      <div
        v-for="(bar, index) in visualizerBars"
        :key="index"
        class="bar"
        :style="barStyle(bar)"
      ></div>
    </div>
    <div v-if="!isSupported" class="unsupported-message">Voice input not supported</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isRecording: false,
      isSupported: false,
      recognition: null,
      visualizerBars: Array(10).fill(0),
      updateInterval: null,
    }
  },
  computed: {
    micIconClass() {
      return this.isRecording ? 'fa-microphone-slash' : 'fa-microphone'
    },
  },
  mounted() {
    this.checkSupport()
  },
  beforeUnmount() {
    this.stopRecording()
  },
  methods: {
    checkSupport() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.isSupported = !!SpeechRecognition

      if (this.isSupported) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = navigator.language || 'en-US'

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          this.$emit('transcript', transcript)
        }

        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          this.$emit('error', event.error)
        }

        this.recognition.onend = () => {
          if (this.isRecording) {
            this.isRecording = false
            this.stopVisualizer()
          }
        }
      }
    },
    startRecording() {
      if (!this.isSupported || this.isRecording) return

      this.isRecording = true
      this.startVisualizer()

      try {
        this.recognition.start()
        if (navigator.vibrate) navigator.vibrate(50)
      } catch (error) {
        console.error('Failed to start recognition:', error)
        this.isRecording = false
        this.stopVisualizer()
      }
    },
    stopRecording() {
      if (!this.isRecording) return

      try {
        this.recognition.stop()
      } catch (error) {
        console.error('Failed to stop recognition:', error)
      } finally {
        this.isRecording = false
        this.stopVisualizer()
      }
    },
    startVisualizer() {
      this.updateInterval = setInterval(() => {
        this.visualizerBars = this.visualizerBars.map(() => Math.min(Math.random() * 0.8 + 0.2, 1))
      }, 100)
    },
    stopVisualizer() {
      clearInterval(this.updateInterval)
      this.visualizerBars = Array(10).fill(0)
    },
    barStyle(height) {
      return {
        height: `${height * 100}%`,
        backgroundColor: `hsl(${200 + height * 60}, 80%, 50%)`,
      }
    },
  },
}
</script>

<style scoped>
.voice-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px 0;
}

.voice-input-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  touch-action: manipulation;
}

.voice-input-btn.recording {
  background: linear-gradient(135deg, #ea4335, #fbbc05);
  transform: scale(1.05);
}

.voice-input-btn.disabled {
  background: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.recording-visualizer {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 50px;
  gap: 3px;
  margin-top: 10px;
}

.bar {
  width: 4px;
  background: #4285f4;
  border-radius: 2px;
  transition: height 0.2s ease-out;
}

.unsupported-message {
  margin-top: 10px;
  color: #666;
  font-size: 12px;
}

@media (max-width: 480px) {
  .voice-input-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>
