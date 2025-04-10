<template>
  <div id="app">
    <Navbar v-if="isAuthenticated" />
    <div class="app-layout" :class="{ authenticated: isAuthenticated }">
      <Sidebar
        v-if="isAuthenticated"
        :is-open="isSidebarOpen"
        @toggle="isSidebarOpen = !isSidebarOpen"
      />
      <main class="main-content" :class="{ 'sidebar-open': isSidebarOpen }">
        <router-view />
      </main>
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
      isAuthenticated: false,
      isSidebarOpen: false,
    }
  },
  created() {
    onAuthStateChanged(auth, (user) => {
      this.isAuthenticated = !!user
      if (user) {
        this.setCurrentUser(user)
        this.isSidebarOpen = window.innerWidth > 768 // Auto-open on desktop
      } else {
        this.clearCurrentUser()
      }
    })
  },
  methods: {
    ...mapActions(['setCurrentUser', 'clearCurrentUser']),
  },
}
</script>

<style>
@import './assets/styles/main.css';
</style>
