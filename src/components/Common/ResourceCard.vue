<template>
  <div class="resource-card">
    <div class="resource-icon">
      <i :class="iconClass"></i>
    </div>
    <div class="resource-content">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <a v-if="link" :href="link" target="_blank" class="resource-link">
        {{ linkText || 'Learn More' }} <i class="fas fa-arrow-right"></i>
      </a>
      <button v-if="action" @click="handleAction" class="resource-action">
        {{ action }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourceCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'info-circle',
    },
    link: {
      type: String,
      default: '',
    },
    linkText: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      default: '',
    },
  },
  computed: {
    iconClass() {
      return `fas fa-${this.icon}`
    },
  },
  methods: {
    handleAction() {
      this.$emit('action')
    },
  },
}
</script>

<style scoped>
.resource-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  transition: transform 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-icon {
  background-color: #4caf50;
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.resource-icon i {
  font-size: 1.5rem;
}

.resource-content {
  padding: 20px;
  flex-grow: 1;
}

.resource-content h3 {
  margin-top: 0;
  color: #2c3e50;
}

.resource-content p {
  color: #666;
  margin-bottom: 15px;
}

.resource-link,
.resource-action {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.resource-link {
  background-color: #e8f5e9;
  color: #4caf50;
}

.resource-link:hover {
  background-color: #c8e6c9;
}

.resource-action {
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.resource-action:hover {
  background-color: #3d8b40;
}

.resource-link i {
  margin-left: 5px;
  font-size: 0.8rem;
}
</style>
