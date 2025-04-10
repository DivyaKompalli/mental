export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateName = (name) => {
  return name.trim().length >= 2
}

export const validateMoodEntry = (entry) => {
  return entry.mood && entry.mood.trim() !== ''
}

export const validateJournalEntry = (entry) => {
  return entry.title.trim() !== '' && entry.content.trim() !== ''
}

export const validateProfileUpdate = (profile) => {
  return profile.name.trim() !== '' && validateEmail(profile.email)
}
