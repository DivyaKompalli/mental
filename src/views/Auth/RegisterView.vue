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
      <img src="../assets/images/login.jpg" alt="Mental Health" />
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
.auth-view {
  display: flex;
  min-height: 100vh;
}

.auth-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  max-width: 500px;
  margin: 0 auto;
}

/* #4caf50;
  margin-bottom: 10px;
}

.auth-header p {
  color: #666;
}
.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-header h1 {
  color:  */
.auth-footer {
  margin-top: 20px;
  text-align: center;
}

.auth-footer a {
  color: #4caf50;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.auth-image {
  flex: 1;
  /* background-color: #f5f5f5; */
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-image img {
  width: 80%;
  height: 70%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .auth-view {
    flex-direction: column;
  }

  .auth-image {
    display: none;
  }
}
</style>
