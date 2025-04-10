export const formatDate = (date) => {
  if (!date) return ''
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString(undefined, options)
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return new Date(date).toLocaleDateString(undefined, options)
}

export const truncateText = (text, length = 100) => {
  if (!text) return ''
  return text.length > length ? `${text.substring(0, length)}...` : text
}

// Add this function to your helpers.js
export const getMoodLabel = (mood) => {
  const labels = {
    happy: 'Happy',
    sad: 'Sad',
    angry: 'Angry',
    anxious: 'Anxious',
    tired: 'Tired',
  }
  return labels[mood] || 'Unknown'
}

// Make sure you're also exporting other used functions
export const getMoodIcon = (mood) => {
  const icons = {
    happy: 'fa-smile',
    sad: 'fa-sad-tear',
    angry: 'fa-angry',
    anxious: 'fa-flushed',
    tired: 'fa-tired',
  }
  return icons[mood] || 'fa-question'
}

export const getMoodColor = (mood) => {
  const colors = {
    happy: '#4CAF50',
    sad: '#2196F3',
    angry: '#F44336',
    anxious: '#FF9800',
    tired: '#9E9E9E',
  }
  return colors[mood] || '#607D8B'
}
export const getMoodEmoji = (mood) => {
  const emojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😟',
    tired: '😴',
  }
  return emojis[mood] || '❓'
}
