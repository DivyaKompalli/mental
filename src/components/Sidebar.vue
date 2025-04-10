<template>
  <aside class="sidebar" :class="{ collapsed: !isOpen }">
    <div class="sidebar-content">
      <div class="profile-section" v-if="isOpen">
        <div class="profile-img-container">
          <img :src="userPhoto" alt="Profile" class="profile-img" />
          <div class="profile-overlay" @click="editProfile">
            <i class="fas fa-camera"></i>
          </div>
        </div>
        <h3 class="user-name">{{ userName }}</h3>
        <p class="user-email">{{ currentUser?.email }}</p>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="sidebar-link"
          active-class="active-link"
          @click="$emit('toggle')"
        >
          <span class="icon" :class="link.iconClass"><i :class="link.icon"></i></span>
          <span class="link-text" v-if="isOpen">{{ link.name }}</span>
          <span class="tooltip" v-if="!isOpen">{{ link.name }}</span>
        </router-link>
      </nav>

      <div class="quick-actions" v-if="isOpen">
        <h4 class="section-title">Quick Mood</h4>
        <button
          v-for="action in quickActions"
          :key="action.mood"
          @click="quickMoodEntry(action.mood)"
          class="action-btn"
          :class="'mood-' + action.mood"
        >
          <span class="icon"><i :class="action.icon"></i></span>
          <span>{{ action.label }}</span>
        </button>
      </div>

      <button
        class="toggle-btn"
        @click="$emit('toggle')"
        :aria-label="isOpen ? 'Collapse sidebar' : 'Expand sidebar'"
      >
        <i :class="isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
      </button>
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex'
import defaultAvatar from '../assets/default-avatar.png'

export default {
  props: {
    isOpen: Boolean,
  },
  data() {
    return {
      navLinks: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          icon: 'fas fa-chart-line',
          iconClass: 'dashboard-icon',
        },
        {
          path: '/mood-tracker',
          name: 'Mood Tracker',
          icon: 'far fa-smile',
          iconClass: 'mood-icon',
        },
        { path: '/journal', name: 'Journal', icon: 'fas fa-book', iconClass: 'journal-icon' },
        {
          path: '/resources',
          name: 'Resources',
          icon: 'fas fa-book-open',
          iconClass: 'resources-icon',
        },
        { path: '/profile', name: 'Profile', icon: 'fas fa-user', iconClass: 'profile-icon' },
        { path: '/rage-room', name: 'Rage Room', icon: 'fas fa-angry', iconClass: 'rage-icon' },
      ],
      quickActions: [
        { mood: 'happy', label: "I'm Happy", icon: 'far fa-smile' },
        { mood: 'sad', label: "I'm Sad", icon: 'far fa-sad-tear' },
        { mood: 'anxious', label: "I'm Anxious", icon: 'far fa-grimace' },
      ],
    }
  },
  computed: {
    ...mapState(['currentUser']),
    userPhoto() {
      return this.currentUser?.photoURL || defaultAvatar
    },
    userName() {
      return this.currentUser?.displayName || 'User'
    },
  },
  methods: {
    async quickMoodEntry(mood) {
      try {
        await this.$store.dispatch('addMoodEntry', { mood })
        this.$toast.success(`Recorded ${mood} mood`)
      } catch (error) {
        this.$toast.error(`Failed: ${error.message}`)
      }
    },
    editProfile() {
      this.$router.push('/profile')
    },
  },
}
</script>

<style scoped lang="scss">
//@import '@/styles/variables.scss';

.sidebar {
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  width: var(--sidebar-width);
  height: calc(100vh - var(--navbar-height));
  background: linear-gradient(180deg, #2c3e50 0%, #1a2530 100%);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  overflow: hidden;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.05);

  &.collapsed {
    width: var(--collapsed-width);
  }
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 60px; // Space for toggle button
}

.toggle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  i {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }
}

.profile-section {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.profile-img-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 15px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

  .profile-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }

  .profile-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;

    i {
      font-size: 1.5rem;
      color: white;
    }
  }

  &:hover .profile-overlay {
    opacity: 1;
  }

  &:hover .profile-img {
    transform: scale(1.05);
  }
}

.user-name {
  font-size: 1.2rem;
  margin-bottom: 5px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}

.user-email {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  word-break: break-word;
}

.sidebar-nav {
  flex: 1;
  padding: 15px 0;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 12px 25px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
  margin: 5px 10px;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(5px);

    .tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }
  }

  .icon {
    margin-right: 15px;
    font-size: 1.1rem;
    min-width: 24px;
    text-align: center;
    transition: all 0.3s ease;

    i {
      width: 24px;
      text-align: center;
    }
  }

  .dashboard-icon i {
    color: #4fc3f7;
  }
  .mood-icon i {
    color: #81c784;
  }
  .journal-icon i {
    color: #ffb74d;
  }
  .resources-icon i {
    color: #ba68c8;
  }
  .profile-icon i {
    color: #64b5f6;
  }
  .rage-icon i {
    color: #e57373;
  }

  .link-text {
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .tooltip {
    position: absolute;
    left: calc(100% + 15px);
    background: #2c3e50;
    color: white;
    padding: 8px 15px;
    border-radius: 6px;
    font-size: 0.9rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transform: translateX(-10px);
    transition: all 0.3s ease;
    pointer-events: none;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 100;

    &::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-right: 5px solid #2c3e50;
    }
  }
}

.active-link {
  background: rgba(76, 175, 80, 0.15) !important;
  color: white !important;
  font-weight: 600;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 40%;
    background: var(--primary);
    border-radius: 2px 0 0 2px;
  }
}

.quick-actions {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .section-title {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 15px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 30px;
      height: 2px;
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.action-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 15px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: white;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .icon {
    margin-right: 12px;
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
  }

  &.mood-happy {
    background: rgba(129, 199, 132, 0.1);

    &:hover {
      background: rgba(129, 199, 132, 0.2);
    }

    .icon {
      color: #81c784;
    }
  }

  &.mood-sad {
    background: rgba(79, 195, 247, 0.1);

    &:hover {
      background: rgba(79, 195, 247, 0.2);
    }

    .icon {
      color: #4fc3f7;
    }
  }

  &.mood-anxious {
    background: rgba(255, 183, 77, 0.1);

    &:hover {
      background: rgba(255, 183, 77, 0.2);
    }

    .icon {
      color: #ffb74d;
    }
  }
}

/* Collapsed state */
.sidebar.collapsed {
  .profile-section,
  .link-text,
  .quick-actions span:not(.icon),
  .section-title {
    opacity: 0;
    width: 0;
    height: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
    visibility: hidden;
  }

  .sidebar-link {
    justify-content: center;
    padding: 15px 0;
    margin: 5px 0;

    .icon {
      margin-right: 0;
      font-size: 1.3rem;
    }
  }

  .quick-actions {
    padding: 10px 0;

    .action-btn {
      justify-content: center;
      padding: 15px 0;

      .icon {
        margin-right: 0;
        font-size: 1.3rem;
      }
    }
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
    z-index: 1000;

    &.collapsed {
      transform: translateX(0);
    }
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;

    &.visible {
      opacity: 1;
      visibility: visible;
    }
  }
}

/* Scrollbar styles */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
