import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/styles/main.css'
import { auth, db } from './firebase' // Import db here
import { onAuthStateChanged } from 'firebase/auth'
import '@fortawesome/fontawesome-free/css/all.css'

// Initialize Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)

// Configure Toast notifications
const toastOptions = {
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
}

const initApp = async () => {
  try {
    // Create Vue app instance
    const app = createApp(App)

    // Configure global error handler
    app.config.errorHandler = (err, vm, info) => {
      console.error('Global Vue error:', err, info)
      app.config.globalProperties.$toast?.error('An unexpected error occurred')
    }

    // Wait for auth state to initialize
    await new Promise((resolve) => {
      const authTimeout = setTimeout(() => {
        console.warn('Auth initialization timeout - proceeding')
        resolve()
      }, 10000) // Increased timeout to 10 seconds

      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          clearTimeout(authTimeout)
          try {
            if (user) {
              store.dispatch('user/setCurrentUser', user) // Updated to namespaced action
            } else {
              store.commit('user/SET_CURRENT_USER', null) // Updated to namespaced mutation
            }
            resolve()
          } catch (error) {
            console.error('Error handling auth state:', error)
            resolve() // Still resolve to allow app to mount
          } finally {
            unsubscribe()
          }
        },
        (error) => {
          console.error('Auth observer error:', error)
          resolve() // Still resolve to allow app to mount
        },
      )
    })

    // Initialize plugins
    app.use(store)
    app.use(router)
    app.use(Toast, toastOptions)
    app.component('font-awesome-icon', FontAwesomeIcon)

    // Mount the app
    app.mount('#app')
  } catch (error) {
    console.error('Application initialization failed:', error)
    showErrorScreen()
  }
}

function showErrorScreen() {
  const appContainer = document.getElementById('app') || document.body
  appContainer.innerHTML = `
    <div class="error-container">
      <h1>Application Error</h1>
      <p>Failed to initialize the application.</p>
      <div class="error-details" style="display: none;">
        <pre id="error-details-content"></pre>
      </div>
      <button onclick="window.location.reload()" class="refresh-btn">
        Refresh Page
      </button>
      <button onclick="document.querySelector('.error-details').style.display = 'block';
                  document.getElementById('error-details-content').textContent = \`\${window.lastError}\`"
              class="details-btn">
        Show Details
      </button>
    </div>
  `
  window.lastError = error?.stack || error?.message || 'Unknown error'
}

// Start the application
initApp()
