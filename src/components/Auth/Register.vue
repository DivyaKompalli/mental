<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Create Account</h1>
        <p>Start your mental health journey</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Enter your name"
            class="form-input"
            required
          />
          <div v-if="errors.name" class="error-text">{{ errors.name }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            class="form-input"
            required
          />
          <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Create password (min 6 characters)"
            class="form-input"
            required
          />
          <div v-if="errors.password" class="error-text">{{ errors.password }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            class="form-input"
            required
          />
          <div v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</div>
        </div>

        <button type="submit" class="auth-button" :disabled="loading">
          <span v-if="!loading">Register</span>
          <span v-else class="spinner"></span>
        </button>

        <div v-if="authError" class="auth-error">
          <i class="fas fa-exclamation-circle"></i>
          {{ authError }}
        </div>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { validateEmail, validatePassword } from '@/utils/validators'

export default {
  name: 'AuthRegister',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      errors: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      authError: '',
      loading: false,
    }
  },
  methods: {
    validateForm() {
      let isValid = true

      // Reset errors
      this.errors = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      }

      // Name validation
      if (!this.form.name.trim()) {
        this.errors.name = 'Name is required'
        isValid = false
      }

      // Email validation
      if (!this.form.email) {
        this.errors.email = 'Email is required'
        isValid = false
      } else if (!validateEmail(this.form.email)) {
        this.errors.email = 'Please enter a valid email'
        isValid = false
      }

      // Password validation
      if (!this.form.password) {
        this.errors.password = 'Password is required'
        isValid = false
      } else if (!validatePassword(this.form.password)) {
        this.errors.password = 'Password must be at least 6 characters'
        isValid = false
      }

      // Confirm password validation
      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match'
        isValid = false
      }

      return isValid
    },

    async handleRegister() {
      if (!this.validateForm()) return

      this.loading = true
      this.authError = ''

      try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.form.email,
          this.form.password,
        )

        // 2. Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: this.form.name,
        })

        // 3. Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: this.form.name,
          email: this.form.email,
          createdAt: new Date(),
          lastLogin: new Date(),
          moodHistory: [],
          journalEntries: [],
        })

        // 4. Redirect to dashboard
        this.$router.push('/dashboard')
      } catch (error) {
        this.handleAuthError(error)
      } finally {
        this.loading = false
      }
    },

    handleAuthError(error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.authError = 'This email is already registered'
          break
        case 'auth/invalid-email':
          this.authError = 'Please enter a valid email'
          break
        case 'auth/weak-password':
          this.authError = 'Password should be at least 6 characters'
          break
        default:
          this.authError = 'Registration failed. Please try again.'
          console.error('Registration error:', error)
      }
    },
  },
}
</script>

<style scoped>
/* Add your existing auth styles here */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--light-gray);
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.auth-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  background-color: var(--primary);
  color: white;
}

.auth-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-medium);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  outline: none;
}

.error-text {
  color: var(--danger);
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.auth-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
  position: relative;
}

.auth-button:hover {
  background-color: var(--primary-dark);
}

.auth-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-error {
  margin-top: 1.5rem;
  padding: 0.8rem;
  background-color: #ffebee;
  color: var(--danger);
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-medium);
  padding: 0 2rem 2rem;
}

.auth-footer a {
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
