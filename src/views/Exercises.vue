<template>
  <div class="exercises-view">
    <div class="header">
      <h1>Mindfulness Exercises</h1>
      <p class="subtitle">Tools to help calm your mind and reduce stress</p>
    </div>

    <div class="exercise-categories">
      <!-- Breathing Exercise -->
      <div class="exercise-card breathing">
        <div class="card-header">
          <i class="fas fa-wind"></i>
          <h2>Breathing Exercises</h2>
        </div>

        <div class="exercise-options">
          <button
            @click="startExercise('478')"
            :class="{ active: currentExercise === '478' }"
            class="exercise-btn"
          >
            <span class="exercise-icon">🌬️</span>
            <span>4-7-8 Breathing</span>
            <span class="exercise-desc">Calms anxiety quickly</span>
          </button>

          <button
            @click="startExercise('box')"
            :class="{ active: currentExercise === 'box' }"
            class="exercise-btn"
          >
            <span class="exercise-icon">🧊</span>
            <span>Box Breathing</span>
            <span class="exercise-desc">Improves focus</span>
          </button>
        </div>

        <transition name="fade">
          <div v-if="currentExercise" class="exercise-display">
            <div class="animation-container" :style="animationStyle">
              <div class="breath-circle" :class="animationStage"></div>
              <div class="breath-instruction">
                {{ currentInstruction }}
              </div>
            </div>

            <div class="exercise-info">
              <div class="progress-container">
                <div class="progress-bar" :style="progressStyle"></div>
              </div>

              <div class="stats">
                <div class="stat">
                  <i class="fas fa-clock"></i>
                  <span>{{ formattedTime }}</span>
                </div>
                <div class="stat">
                  <i class="fas fa-redo"></i>
                  <span>{{ cycleCount }} cycles</span>
                </div>
              </div>

              <div class="controls">
                <button @click="toggleExercise" class="control-btn" :class="{ pause: isRunning }">
                  {{ isRunning ? 'Pause' : 'Resume' }}
                </button>
                <button @click="stopExercise" class="control-btn stop">Stop</button>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Guided Meditation -->
      <div class="exercise-card meditation">
        <div class="card-header">
          <i class="fas fa-spa"></i>
          <h2>Guided Meditations</h2>
        </div>

        <div class="meditation-options">
          <div
            v-for="meditation in meditations"
            :key="meditation.id"
            class="meditation-option"
            @click="playMeditation(meditation)"
            :class="{ active: currentMeditation?.id === meditation.id }"
          >
            <div class="meditation-icon">
              <i :class="meditation.icon"></i>
            </div>
            <div class="meditation-info">
              <h3>{{ meditation.title }}</h3>
              <p>{{ meditation.description }}</p>
            </div>
            <div class="meditation-meta">
              <span class="duration">{{ meditation.duration }}</span>
              <span class="category">{{ meditation.category }}</span>
            </div>
          </div>
        </div>

        <div v-if="currentMeditation" class="audio-controls">
          <div class="audio-progress">
            <div class="progress-bar" :style="audioProgressStyle"></div>
          </div>
          <div class="audio-buttons">
            <button @click="toggleAudio" class="audio-btn">
              <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
            </button>
            <button @click="stopAudio" class="audio-btn stop">
              <i class="fas fa-stop"></i>
            </button>
            <span class="current-time">{{ formattedAudioTime }}</span>
            <span class="duration">{{ currentMeditation.duration }}</span>
          </div>
        </div>
      </div>

      <!-- Grounding Techniques -->
      <div class="exercise-card grounding">
        <div class="card-header">
          <i class="fas fa-mountain"></i>
          <h2>Grounding Techniques</h2>
        </div>

        <div class="grounding-exercises">
          <div
            class="grounding-technique"
            @click="startGrounding('54321')"
            :class="{ active: currentGrounding === '54321' }"
          >
            <div class="technique-icon">5️⃣</div>
            <div class="technique-content">
              <h3>5-4-3-2-1 Technique</h3>
              <p>Engage your senses to stay present</p>
            </div>
          </div>

          <div
            class="grounding-technique"
            @click="startGrounding('categories')"
            :class="{ active: currentGrounding === 'categories' }"
          >
            <div class="technique-icon">🗂️</div>
            <div class="technique-content">
              <h3>Category Game</h3>
              <p>Focus your mind with categorization</p>
            </div>
          </div>

          <div
            class="grounding-technique"
            @click="startGrounding('body')"
            :class="{ active: currentGrounding === 'body' }"
          >
            <div class="technique-icon">🧘</div>
            <div class="technique-content">
              <h3>Body Scan</h3>
              <p>Bring awareness to each body part</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audio Player -->
    <audio ref="audioPlayer" @ended="onAudioEnd" @timeupdate="updateAudioProgress"></audio>
  </div>
</template>

<script>
export default {
  name: 'ExercisesView',
  data() {
    return {
      currentExercise: null,
      isRunning: false,
      seconds: 0,
      cycleCount: 0,
      timer: null,
      animationStage: 'inhale',
      exerciseInterval: null,
      currentProgress: 0,
      isPlaying: false,
      currentMeditation: null,
      currentGrounding: null,
      audioCurrentTime: 0,
      meditations: [
        {
          id: 1,
          title: 'Body Scan',
          description: 'Release tension by scanning through your body',
          duration: '10:00',
          icon: 'fas fa-body',
          audio: 'body-scan.mp3',
          category: 'Relaxation',
          length: 600, // seconds
        },
        {
          id: 2,
          title: 'Mindfulness',
          description: 'Practice being present in the moment',
          duration: '5:00',
          icon: 'fas fa-brain',
          audio: 'mindfulness.mp3',
          category: 'Focus',
          length: 300,
        },
        {
          id: 3,
          title: 'Loving Kindness',
          description: 'Cultivate compassion for yourself and others',
          duration: '8:00',
          icon: 'fas fa-heart',
          audio: 'loving-kindness.mp3',
          category: 'Compassion',
          length: 480,
        },
        {
          id: 4,
          title: 'Sleep Meditation',
          description: 'Gentle guidance to help you fall asleep',
          duration: '15:00',
          icon: 'fas fa-moon',
          audio: 'sleep.mp3',
          category: 'Sleep',
          length: 900,
        },
      ],
    }
  },
  computed: {
    formattedTime() {
      const mins = Math.floor(this.seconds / 60)
      const secs = this.seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    formattedAudioTime() {
      const mins = Math.floor(this.audioCurrentTime / 60)
      const secs = Math.floor(this.audioCurrentTime % 60)
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    animationStyle() {
      if (this.currentExercise === '478') {
        return {
          animationDuration:
            this.animationStage === 'inhale' ? '4s' : this.animationStage === 'hold' ? '7s' : '8s',
          animationName:
            this.animationStage === 'inhale'
              ? 'scaleUp'
              : this.animationStage === 'exhale'
                ? 'scaleDown'
                : 'none',
        }
      } else {
        return {
          animationDuration: '4s',
          animationName:
            this.animationStage === 'inhale'
              ? 'scaleUp'
              : this.animationStage === 'exhale'
                ? 'scaleDown'
                : 'none',
        }
      }
    },
    currentInstruction() {
      switch (this.animationStage) {
        case 'inhale':
          return 'Breathe In...'
        case 'hold':
          return 'Hold...'
        case 'exhale':
          return 'Breathe Out...'
        default:
          return 'Begin...'
      }
    },
    progressStyle() {
      const totalDuration = this.currentExercise === '478' ? 19 : 16 // 4+7+8 or 4+4+4+4
      let elapsed = 0

      if (this.animationStage === 'hold') {
        elapsed = this.currentExercise === '478' ? 4 : 4
      } else if (this.animationStage === 'exhale') {
        elapsed = this.currentExercise === '478' ? 11 : 8
      }

      const progress = (elapsed / totalDuration) * 100
      return { width: `${progress}%` }
    },
    audioProgressStyle() {
      if (!this.currentMeditation) return { width: '0%' }
      const progress = (this.audioCurrentTime / this.currentMeditation.length) * 100
      return { width: `${progress}%` }
    },
  },
  methods: {
    startExercise(type) {
      this.currentExercise = type
      this.isRunning = true
      this.seconds = 0
      this.cycleCount = 0

      // Start timer
      this.timer = setInterval(() => {
        this.seconds++
      }, 1000)

      this.runExerciseCycle()
    },

    runExerciseCycle() {
      if (!this.isRunning) return

      // 4-7-8 breathing pattern
      if (this.currentExercise === '478') {
        this.animationStage = 'inhale'

        this.exerciseInterval = setTimeout(() => {
          this.animationStage = 'hold'

          this.exerciseInterval = setTimeout(() => {
            this.animationStage = 'exhale'

            this.exerciseInterval = setTimeout(() => {
              this.cycleCount++
              if (this.isRunning) {
                this.runExerciseCycle()
              }
            }, 8000)
          }, 7000)
        }, 4000)
      }
      // Box breathing pattern
      else {
        this.animationStage = 'inhale'

        this.exerciseInterval = setTimeout(() => {
          this.animationStage = 'hold'

          this.exerciseInterval = setTimeout(() => {
            this.animationStage = 'exhale'

            this.exerciseInterval = setTimeout(() => {
              this.animationStage = 'hold'

              this.exerciseInterval = setTimeout(() => {
                this.cycleCount++
                if (this.isRunning) {
                  this.runExerciseCycle()
                }
              }, 4000)
            }, 4000)
          }, 4000)
        }, 4000)
      }
    },

    toggleExercise() {
      this.isRunning = !this.isRunning

      if (this.isRunning) {
        this.runExerciseCycle()
        this.timer = setInterval(() => {
          this.seconds++
        }, 1000)
      } else {
        clearTimeout(this.exerciseInterval)
        clearInterval(this.timer)
      }
    },

    stopExercise() {
      this.isRunning = false
      clearInterval(this.timer)
      clearTimeout(this.exerciseInterval)
      this.currentExercise = null
      this.animationStage = 'inhale'
    },

    playMeditation(meditation) {
      if (this.currentMeditation?.id === meditation.id) {
        this.toggleAudio()
        return
      }

      this.currentMeditation = meditation
      this.$refs.audioPlayer.src = require(`@/assets/audio/${meditation.audio}`)
      this.$refs.audioPlayer.play()
      this.isPlaying = true
    },

    toggleAudio() {
      if (this.$refs.audioPlayer.paused) {
        this.$refs.audioPlayer.play()
        this.isPlaying = true
      } else {
        this.$refs.audioPlayer.pause()
        this.isPlaying = false
      }
    },

    stopAudio() {
      this.$refs.audioPlayer.pause()
      this.$refs.audioPlayer.currentTime = 0
      this.isPlaying = false
      this.currentMeditation = null
    },

    onAudioEnd() {
      this.currentMeditation = null
      this.isPlaying = false
    },

    updateAudioProgress() {
      this.audioCurrentTime = this.$refs.audioPlayer.currentTime
    },

    startGrounding(technique) {
      this.currentGrounding = technique
      // In a real app, you would navigate to a grounding exercise component
      // this.$router.push({ name: 'GroundingExercise', params: { technique } })

      // For demo purposes, show an alert
      let message = ''
      switch (technique) {
        case '54321':
          message =
            '5 things you see, 4 things you touch, 3 things you hear, 2 things you smell, 1 thing you taste'
          break
        case 'categories':
          message = 'Name 5 fruits, 4 countries, 3 animals, 2 colors, 1 book'
          break
        case 'body':
          message =
            'Focus on your toes, feet, ankles, calves, knees, thighs... moving up through your body'
          break
      }

      alert(`Starting ${technique} technique:\n\n${message}`)
    },
  },
  beforeUnmount() {
    this.stopExercise()
    this.stopAudio()
  },
}
</script>

<style scoped>
.exercises-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #4a6fa5;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.exercise-categories {
  display: grid;
  gap: 30px;
}

.exercise-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.exercise-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.card-header i {
  font-size: 1.5rem;
  color: #4a6fa5;
}

.card-header h2 {
  color: #4a6fa5;
  margin: 0;
  font-size: 1.5rem;
}

/* Breathing Exercises */
.exercise-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.exercise-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.exercise-btn:hover {
  background: #e9ecef;
}

.exercise-btn.active {
  background: #4a6fa5;
  color: white;
}

.exercise-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.exercise-desc {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 5px;
}

.exercise-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.animation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 250px;
}

.breath-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #4a6fa5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: all 0.5s ease;
}

.breath-circle.inhale {
  transform: scale(1.5);
  background: #5cb85c;
}

.breath-circle.hold {
  background: #f0ad4e;
}

.breath-circle.exhale {
  transform: scale(1);
  background: #d9534f;
}

.breath-instruction {
  position: absolute;
  bottom: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #4a6fa5;
  margin-top: 15px;
}

.exercise-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.progress-container {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #4a6fa5;
  border-radius: 4px;
  transition: width 0.1s linear;
}

.stats {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}

.stat i {
  color: #4a6fa5;
}

.controls {
  display: flex;
  gap: 15px;
}

.control-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  background: #4a6fa5;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.control-btn:hover {
  background: #3a5a80;
}

.control-btn.pause {
  background: #f0ad4e;
}

.control-btn.stop {
  background: #d9534f;
}

/* Meditation Exercises */
.meditation-options {
  display: grid;
  gap: 15px;
}

.meditation-option {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-radius: 10px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.meditation-option:hover {
  background: #e9ecef;
}

.meditation-option.active {
  background: #4a6fa5;
  color: white;
}

.meditation-option.active .meditation-icon i {
  color: white;
}

.meditation-option.active .meditation-meta span {
  color: rgba(255, 255, 255, 0.8);
}

.meditation-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meditation-icon i {
  font-size: 1.2rem;
  color: #4a6fa5;
}

.meditation-info {
  flex: 1;
}

.meditation-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.meditation-info p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.meditation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.duration {
  font-weight: bold;
}

.category {
  font-size: 0.8rem;
  opacity: 0.7;
}

.audio-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.audio-progress {
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  margin-bottom: 15px;
  overflow: hidden;
}

.audio-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.audio-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #4a6fa5;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-btn.stop {
  background: #d9534f;
}

.current-time,
.duration {
  font-size: 0.9rem;
  font-family: monospace;
}

.current-time {
  margin-left: auto;
}

/* Grounding Exercises */
.grounding-exercises {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.grounding-technique {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  gap: 15px;
  align-items: center;
}

.grounding-technique:hover {
  background: #e9ecef;
}

.grounding-technique.active {
  background: #4a6fa5;
  color: white;
}

.technique-icon {
  font-size: 1.8rem;
}

.technique-content h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.technique-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Animations */
@keyframes scaleUp {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.5);
  }
}

@keyframes scaleDown {
  from {
    transform: scale(1.5);
  }
  to {
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .exercise-display {
    grid-template-columns: 1fr;
  }

  .grounding-exercises {
    grid-template-columns: 1fr;
  }

  .exercise-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 2rem;
  }

  .card-header h2 {
    font-size: 1.3rem;
  }

  .exercise-btn,
  .grounding-technique,
  .meditation-option {
    padding: 15px;
  }
}
</style>
