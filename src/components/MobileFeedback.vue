<template>
  <transition name="fade">
    <div v-if="isVisible" :class="['mobile-feedback', type]" @click="dismiss">
      <div class="feedback-content">
        <i :class="iconClass"></i>
        <span>{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      isVisible: false,
      message: '',
      type: 'info',
      timeout: null,
    }
  },
  computed: {
    iconClass() {
      return {
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
      }[this.type]
    },
  },
  methods: {
    show(msg, type = 'info', duration = 3000) {
      this.message = msg
      this.type = type
      this.isVisible = true

      // Mobile haptic feedback
      if (navigator.vibrate) {
        const pattern = {
          info: [100],
          success: [100, 50, 100],
          warning: [200, 100, 200],
          error: [300, 100, 300, 100, 300],
        }[type]
        navigator.vibrate(pattern)
      }

      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.isVisible = false
      }, duration)
    },
    dismiss() {
      this.isVisible = false
      clearTimeout(this.timeout)
    },
  },
}
</script>

<style scoped>
.mobile-feedback {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 50px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  max-width: 90%;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mobile-feedback.info {
  background: linear-gradient(135deg, #4285f4, #34a853);
}

.mobile-feedback.success {
  background: linear-gradient(135deg, #34a853, #4285f4);
}

.mobile-feedback.warning {
  background: linear-gradient(135deg, #fb8c00, #f57c00);
}

.mobile-feedback.error {
  background: linear-gradient(135deg, #ea4335, #d23f31);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

@media (max-width: 480px) {
  .mobile-feedback {
    padding: 10px 20px;
    font-size: 14px;
    bottom: 10px;
  }
}
</style>
