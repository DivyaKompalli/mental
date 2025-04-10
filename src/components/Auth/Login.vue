<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to continue your mental health journey</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="form-input"
            required
          />
        </div>

        <button type="submit" class="auth-button" :class="{ loading: loading }" :disabled="loading">
          <span v-if="!loading">Sign In</span>
          <span v-else class="spinner"></span>
        </button>

        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>

        <!-- <div class="auth-footer">
          <p>Don't have an account? <router-link to="/register">Create one</router-link></p>
        </div> -->
      </form>
    </div>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'

export default {
  name: 'AuthLogin',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: '',
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$router.push('/dashboard')
      } catch (err) {
        this.error = this.formatFirebaseError(err.message)
      } finally {
        this.loading = false
      }
    },
    formatFirebaseError(message) {
      // Format Firebase error messages to be more user-friendly
      if (message.includes('wrong-password')) {
        return 'Incorrect password. Please try again.'
      }
      if (message.includes('user-not-found')) {
        return 'No account found with this email.'
      }
      return 'Login failed. Please try again.'
    },
  },
}
</script>

<style scoped>
/* ===== Layout Styles ===== */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /* min-height: 100vh; */
  /* background-color: var(--light-gray); */
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* ===== Header Styles ===== */
.auth-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  background-color: var(--primary);
  color: white;
}

.auth-header h1 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.auth-header p {
  opacity: 0.9;
  font-size: 0.95rem;
}

/* ===== Form Styles ===== */
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

/* ===== Button Styles ===== */
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

.loading {
  color: transparent;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* ===== Error Message ===== */
.error-message {
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

.error-message i {
  font-size: 1rem;
}

/* ===== Footer Links ===== */
.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-medium);
}

.auth-footer a {
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* ===== Responsive Adjustments ===== */
@media (max-width: 480px) {
  .auth-card {
    border-radius: 0;
    box-shadow: none;
  }

  .auth-header {
    padding: 1.5rem 1rem;
  }

  .auth-form {
    padding: 1.5rem;
  }
}
</style>

