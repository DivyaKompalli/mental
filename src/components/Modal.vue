<template>
  <transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <slot name="header">
              <h3>{{ title }}</h3>
              <button class="modal-close" @click="$emit('close')">
                <i class="fas fa-times"></i>
              </button>
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body"></slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="$emit('close')">Close</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },
  watch: {
    show(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
  },
  mounted() {
    document.addEventListener('keydown', this.handleEscape)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape)
    document.body.style.overflow = ''
  },
  methods: {
    handleEscape(e) {
      if (e.key === 'Escape') {
        this.$emit('close')
      }
    },
  },
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  width: 100%;
  max-width: 500px;
  padding: 20px;
}

.modal-container {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  overflow: hidden;
}

.modal-header {
  position: relative;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.modal-default-button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-default-button:hover {
  background-color: #3e8e41;
}

/* Transition effects */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
