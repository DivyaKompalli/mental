<template>
  <div class="breathing-exercise">
    <h2>Breathing Exercise</h2>
    <div class="exercise-container">
      <div class="circle" :class="{ inhale: isInhaling, exhale: isExhaling }">
        <span v-if="isInhaling">Breathe In</span>
        <span v-else-if="isExhaling">Breathe Out</span>
        <span v-else>Ready</span>
      </div>
      <div class="controls">
        <button @click="startExercise" v-if="!isRunning">Start</button>
        <button @click="stopExercise" v-else>Stop</button>
        <div class="timer">Time: {{ formattedTime }}</div>
      </div>
    </div>
    <div class="instructions">
      <h3>Instructions:</h3>
      <ol>
        <li>Find a comfortable position</li>
        <li>Follow the breathing circle</li>
        <li>Breathe in for 4 seconds when circle expands</li>
        <li>Breathe out for 6 seconds when circle contracts</li>
        <li>Repeat for desired duration</li>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BreathingExercise',
  data() {
    return {
      isRunning: false,
      isInhaling: false,
      isExhaling: false,
      seconds: 0,
      timer: null,
      breathTimer: null,
    }
  },
  computed: {
    formattedTime() {
      const mins = Math.floor(this.seconds / 60)
      const secs = this.seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
  },
  methods: {
    startExercise() {
      this.isRunning = true
      this.seconds = 0

      // Start the main timer
      this.timer = setInterval(() => {
        this.seconds++
      }, 1000)

      // Start the breathing cycle
      this.startBreathingCycle()
    },
    stopExercise() {
      this.isRunning = false
      this.isInhaling = false
      this.isExhaling = false
      clearInterval(this.timer)
      clearTimeout(this.breathTimer)
    },
    startBreathingCycle() {
      this.isInhaling = true
      this.isExhaling = false

      this.breathTimer = setTimeout(() => {
        this.isInhaling = false
        this.isExhaling = true

        this.breathTimer = setTimeout(() => {
          this.startBreathingCycle()
        }, 6000) // Exhale for 6 seconds
      }, 4000) // Inhale for 4 seconds
    },
  },
  beforeUnmount() {
    this.stopExercise()
  },
}
</script>

<style scoped>
.breathing-exercise {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.exercise-container {
  text-align: center;
  margin: 30px 0;
}

.circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #4caf50;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  transition: all 1s ease;
}

.circle.inhale {
  transform: scale(1.2);
  background-color: #2196f3;
}

.circle.exhale {
  transform: scale(0.8);
  background-color: #ff9800;
}

.controls {
  margin-top: 20px;
}

.controls button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.timer {
  margin-top: 10px;
  font-size: 1.2rem;
}

.instructions {
  margin-top: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.instructions ol {
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
}
</style>
