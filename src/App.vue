<template>
  <div id="app">
    <template v-if="initialized">
      <Navbar v-if="isAuthenticated" />
      <div class="app-layout" :class="{ authenticated: isAuthenticated }">
        <Sidebar
          v-if="isAuthenticated"
          :is-open="isSidebarOpen"
          @toggle="isSidebarOpen = !isSidebarOpen"
        />
        <main class="main-content" :class="{ 'sidebar-open': isSidebarOpen }">
          <router-view v-if="!error" />
          <div v-else class="error-state">
            <h2>Application Error</h2>
            <p>Failed to load application components</p>
            <button @click="reloadApp">Retry</button>
          </div>
        </main>
      </div>
    </template>
    <div v-else class="loading-screen">
      <div class="spinner"></div>
      <p>Initializing application...</p>
    </div>
  </div>
</template>

<script>
import Navbar from './components/NavBar.vue'
import Sidebar from './components/Sidebar.vue'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar,
  },
  data() {
    return {
      initialized: false,
      error: false,
      isAuthenticated: false,
      isSidebarOpen: false,
    }
  },
  async created() {
    try {
      // Wait for initial data to load
      await Promise.all([this.initializeAuth(), this.$store.dispatch('journal/loadEntries')])
      this.initialized = true
    } catch (error) {
      console.error('App initialization failed:', error)
      this.error = true
    }
  },
  methods: {
    ...mapActions('user', ['setCurrentUser', 'clearCurrentUser']),

    initializeAuth() {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            this.isAuthenticated = !!user
            if (user) {
              this.setCurrentUser(user)
              this.isSidebarOpen = window.innerWidth > 768
            } else {
              this.clearCurrentUser()
            }
            resolve()
            unsubscribe()
          },
          (error) => {
            console.error('Auth error:', error)
            resolve() // Still resolve to allow app to continue
          },
        )
      })
    },

    reloadApp() {
      window.location.reload()
    },
  },
}
</script>

<style>
@import './assets/styles/main.css';
</style>
