<template>
  <div class="profile-view">
    <div class="profile-header">
      <h1>My Profile</h1>
    </div>

    <div class="profile-container">
      <div class="profile-info">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img :src="user.photoURL || defaultAvatar" alt="Profile" class="avatar" />
            <button @click="triggerFileInput" class="edit-avatar-btn">
              <i class="fas fa-camera"></i>
            </button>
            <input
              type="file"
              ref="fileInput"
              @change="handleAvatarUpload"
              accept="image/*"
              style="display: none"
            />
          </div>
          <h2>{{ user.displayName || 'User' }}</h2>
          <p>{{ user.email }}</p>
        </div>

        <div class="profile-stats">
          <div class="stat-item">
            <i class="fas fa-chart-line"></i>
            <div>
              <h3>{{ moodEntriesCount }}</h3>
              <p>Mood Entries</p>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-book"></i>
            <div>
              <h3>{{ journalEntriesCount }}</h3>
              <p>Journal Entries</p>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-calendar-check"></i>
            <div>
              <h3>{{ streakDays }}</h3>
              <p>Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-form">
        <h2>Account Settings</h2>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>Name</label>
            <input v-model="formData.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="formData.email" type="email" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input
              v-model="formData.newPassword"
              type="password"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div class="form-group">
            <label>Current Password</label>
            <input v-model="formData.currentPassword" type="password" required />
          </div>
          <button type="submit" :disabled="isUpdating" class="save-btn">
            {{ isUpdating ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { uploadFile } from '../services/storage'
import { auth } from '../firebase'
import {
  updateEmail,
  updatePassword,
  updateProfile as updateAuthProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'

export default {
  name: 'Profile',
  data() {
    return {
      defaultAvatar: 'https://via.placeholder.com/150',
      formData: {
        name: '',
        email: '',
        newPassword: '',
        currentPassword: '',
      },
      isUpdating: false,
    }
  },
  computed: {
    ...mapState(['currentUser', 'moodEntries', 'journalEntries']),
    user() {
      return this.currentUser || {}
    },
    moodEntriesCount() {
      return this.moodEntries.length
    },
    journalEntriesCount() {
      return this.journalEntries.length
    },
    streakDays() {
      // TODO: Implement actual streak calculation
      return 7
    },
  },
  created() {
    if (this.currentUser) {
      this.formData.name = this.currentUser.displayName || ''
      this.formData.email = this.currentUser.email || ''
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    async handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        const filePath = `avatars/${this.currentUser.uid}/${file.name}`
        const downloadURL = await uploadFile(file, filePath)

        await updateAuthProfile(auth.currentUser, {
          photoURL: downloadURL,
        })

        this.$toast.success('Avatar updated successfully!')
      } catch (error) {
        this.$toast.error('Failed to update avatar')
      }
    },
    async updateProfile() {
      if (!this.validateForm()) return

      this.isUpdating = true

      try {
        const user = auth.currentUser
        const credential = EmailAuthProvider.credential(user.email, this.formData.currentPassword)

        // Reauthenticate user
        await reauthenticateWithCredential(user, credential)

        // Update email if changed
        if (this.formData.email !== user.email) {
          await updateEmail(user, this.formData.email)
        }

        // Update password if provided
        if (this.formData.newPassword) {
          await updatePassword(user, this.formData.newPassword)
        }

        // Update profile
        await updateAuthProfile(user, {
          displayName: this.formData.name,
        })

        this.$toast.success('Profile updated successfully!')
      } catch (error) {
        this.$toast.error(error.message)
      } finally {
        this.isUpdating = false
      }
    },
    validateForm() {
      if (!this.formData.name || !this.formData.email || !this.formData.currentPassword) {
        this.$toast.error('Please fill in all required fields')
        return false
      }

      if (this.formData.newPassword && this.formData.newPassword.length < 6) {
        this.$toast.error('Password must be at least 6 characters')
        return false
      }

      return true
    },
  },
}
</script>

<style scoped>
.profile-view {
  padding: 20px;
  margin-left: 250px;
  align-items: center;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.profile-info {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.stat-item i {
  font-size: 1.5rem;
  color: #4caf50;
}

.stat-item h3 {
  margin: 0;
  font-size: 1.5rem;
}

.stat-item p {
  margin: 0;
  color: #666;
}

.profile-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.save-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
}
</style>
