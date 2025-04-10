<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/dashboard" class="brand-link">
          <span class="brand-icon">🧠</span>
          <span class="brand-text">MindCare</span>
        </router-link>
      </div>

      <button class="mobile-menu-button" @click="toggleMobileMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <div class="navbar-menu" :class="{ active: isMobileMenuOpen }">
        <div class="nav-links">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="nav-link"
            active-class="active-link"
          >
            <span class="link-icon">{{ link.icon }}</span>
            <span class="link-text">{{ link.name }}</span>
          </router-link>
        </div>

        <button @click="handleLogout" class="logout-btn">
          <span class="logout-icon">🚪</span>
          <span class="logout-text">Logout</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

export default {
  name: 'Navbar',
  data() {
    return {
      isMobileMenuOpen: false,
      navLinks: [
        { path: '/dashboard', name: 'Dashboard', icon: '📊' },
        { path: '/mood-tracker', name: 'Mood', icon: '😊' },
        { path: '/journal', name: 'Journal', icon: '📔' },
        { path: '/exercises', name: 'Exercises', icon: '🧘' },
        { path: '/resources', name: 'Resources', icon: '📚' },
        { path: '/rage-room', name: 'Rage Room', icon: '🔨' },
        { path: '/emotionsculpture', name: 'Sculpture', icon: '🗿' },
      ],
    }
  },
  methods: {
    async handleLogout() {
      try {
        await signOut(auth)
        this.$router.push('/login')
      } catch (error) {
        console.error('Error logging out:', error)
      }
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
    },
  },
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(to right, var(--primary), var(--primary-dark));
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0.75rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #fff;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.brand-link:hover {
  transform: scale(1.05);
}

.brand-icon {
  margin-right: 0.5rem;
  font-size: 1.8rem;
}

.navbar-menu {
  display: flex;
  align-items: center;
  transition: all 0.3s ease-in-out;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #f0f0f0;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-link:hover,
.active-link {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.link-icon {
  margin-right: 0.5rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  margin-left: 1rem;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mobile-menu-button {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;
}

.bar {
  width: 25px;
  height: 3px;
  margin: 4px 0;
  background-color: white;
  transition: 0.3s;
}

@media (max-width: 768px) {
  .mobile-menu-button {
    display: flex;
  }

  .navbar-menu {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: 70%;
    background: var(--primary-dark);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    transition: right 0.3s ease;
  }

  .navbar-menu.active {
    right: 0;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    text-align: center;
  }

  .logout-btn {
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
  }
}
</style>
