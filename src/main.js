import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/styles/main.css'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import '@fortawesome/fontawesome-free/css/all.css'

// Initialize Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global Vue error:', err, info)
  // You can add error reporting to a service here
}

// Configure Toast notifications
const toastOptions = {
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
}

app.use(router)
app.use(store)
app.use(Toast, toastOptions)
app.component('font-awesome-icon', FontAwesomeIcon)

// Enhanced Firebase auth initialization
let authInitialized = false
let appMounted = false

const initializeAppWithAuth = () => {
  if (!appMounted) {
    app.mount('#app')
    appMounted = true
  }
}

// Set timeout as fallback if auth state never changes
const authTimeout = setTimeout(() => {
  if (!authInitialized) {
    console.warn('Firebase auth initialization timeout - mounting app anyway')
    initializeAppWithAuth()
  }
}, 5000)

onAuthStateChanged(
  auth,
  (user) => {
    authInitialized = true
    clearTimeout(authTimeout)

    try {
      if (user) {
        store.dispatch('setCurrentUser', user)
      } else {
        store.commit('SET_CURRENT_USER', null)
      }
    } catch (error) {
      console.error('Error handling auth state change:', error)
    }

    if (!appMounted) {
      initializeAppWithAuth()
    }
  },
  (error) => {
    console.error('Auth state observer error:', error)
    if (!appMounted) {
      initializeAppWithAuth()
    }
  },
)
// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'
// import store from './store'
// import Toast from 'vue-toastification'
// import 'vue-toastification/dist/index.css'
// import './assets/styles/main.css'
// import { auth } from './firebase'
// import { onAuthStateChanged } from 'firebase/auth'

// // Font Awesome
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { fas } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// library.add(fas)

// const app = createApp(App)

// // Global error handler
// app.config.errorHandler = (err, vm, info) => {
//   console.error('Global Vue error:', err, info)
//   store.commit('SET_ERROR', err.message)
// }

// // Toast configuration
// const toastOptions = {
//   timeout: 5000,
//   closeOnClick: true,
//   pauseOnFocusLoss: true,
//   pauseOnHover: true,
//   draggable: true,
// }

// app.use(router)
// app.use(store)
// app.use(Toast, toastOptions)
// app.component('font-awesome-icon', FontAwesomeIcon)

// // Firebase auth initialization
// let appMounted = false

// onAuthStateChanged(
//   auth,
//   (user) => {
//     try {
//       if (user) {
//         store.dispatch('setCurrentUser', {
//           uid: user.uid,
//           email: user.email,
//           displayName: user.displayName,
//           photoURL: user.photoURL,
//         })
//       } else {
//         store.commit('SET_CURRENT_USER', null)
//       }
//     } catch (error) {
//       console.error('Auth state error:', error)
//     }

//     if (!appMounted) {
//       app.mount('#app')
//       appMounted = true
//     }
//   },
//   (error) => {
//     console.error('Auth observer error:', error)
//     if (!appMounted) {
//       app.mount('#app')
//       appMounted = true
//     }
//   },
// )
