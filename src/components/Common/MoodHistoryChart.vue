<template>
  <div class="mood-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import { getMoodColor } from '../../utils/helpers'

export default {
  name: 'MoodHistoryChart',
  props: {
    entries: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      moodChart: null,
    }
  },
  mounted() {
    Chart.register(...registerables)
    this.renderChart()
  },
  watch: {
    entries() {
      this.renderChart()
    },
  },
  methods: {
    renderChart() {
      if (this.moodChart) {
        this.moodChart.destroy()
      }

      const ctx = this.$refs.chartCanvas.getContext('2d')
      const moodData = this.processMoodData()

      this.moodChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: moodData.labels,
          datasets: [
            {
              label: 'Mood Trend',
              data: moodData.values,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const entry = this.entries[context.dataIndex]
                  return `${entry.mood}${entry.note ? ': ' + entry.note : ''}`
                },
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (value) => {
                  const moods = ['sad', 'anxious', 'tired', 'happy', 'angry']
                  return moods[value] || ''
                },
              },
            },
          },
        },
      })
    },
    processMoodData() {
      const moodOrder = { sad: 0, anxious: 1, tired: 2, happy: 3, angry: 4 }
      return {
        labels: this.entries.map((entry) => new Date(entry.createdAt).toLocaleDateString()),
        values: this.entries.map((entry) => moodOrder[entry.mood]),
      }
    },
  },
  beforeUnmount() {
    if (this.moodChart) {
      this.moodChart.destroy()
    }
  },
}
</script>

<style scoped>
.mood-chart-container {
  margin: 30px 0;
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
