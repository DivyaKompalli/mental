<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-header">
        <h1>Create Account</h1>
        <p>Start your mental health journey with us</p>
      </div>
      <auth-register @register-success="handleRegisterSuccess" />
      <!-- Fixed usage -->
      <!-- <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div> -->
    </div>
    <div class="auth-image">
      <img src="../assets/images/auth-bg-2.jpg" alt="Mental Health" />
    </div>
  </div>
</template>

<script>
import AuthRegister from '../../components/Auth/Register.vue' // Import remains the same

export default {
  name: 'RegisterView',
  components: {
    AuthRegister, // Component registration remains the same
  },
  methods: {
    handleRegisterSuccess() {
      this.$router.push('/dashboard')
    },
  },
}
</script>

<style scoped>
/* Same styles as LoginView.vue */
</style>
