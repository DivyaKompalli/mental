<template>
  <div class="password-strength-meter">
    <div class="strength-bar" :class="strengthClass"></div>
    <div class="strength-text">{{ strengthText }}</div>
  </div>
</template>

<script>
export default {
  name: 'PasswordStrengthMeter',
  props: {
    password: {
      type: String,
      required: true,
    },
  },
  computed: {
    strengthScore() {
      if (!this.password) return 0

      let score = 0
      // Length contributes up to 3 points
      if (this.password.length > 10) score += 3
      else if (this.password.length > 7) score += 2
      else if (this.password.length > 5) score += 1

      // Character variety
      if (/[A-Z]/.test(this.password)) score += 1
      if (/[0-9]/.test(this.password)) score += 1
      if (/[^A-Za-z0-9]/.test(this.password)) score += 1

      return Math.min(score, 5) // Cap at 5
    },
    strengthClass() {
      return ['strength-' + this.strengthScore, this.password ? 'has-password' : 'no-password']
    },
    strengthText() {
      if (!this.password) return ''

      const texts = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong']
      return texts[Math.floor((this.strengthScore / 5) * texts.length)]
    },
  },
}
</script>

<style scoped>
.password-strength-meter {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  background-color: #e0e0e0;
  transition: all 0.3s ease;
  width: 0%;
}

.strength-bar.has-password {
  width: 100%;
}

.strength-bar.strength-0 {
  background-color: #ff5252;
  width: 20%;
}

.strength-bar.strength-1 {
  background-color: #ff9800;
  width: 40%;
}

.strength-bar.strength-2 {
  background-color: #ffc107;
  width: 60%;
}

.strength-bar.strength-3 {
  background-color: #4caf50;
  width: 80%;
}

.strength-bar.strength-4 {
  background-color: #2e7d32;
  width: 100%;
}

.strength-text {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #616161;
  text-align: right;
}
</style>
