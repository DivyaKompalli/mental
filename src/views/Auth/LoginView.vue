<template>
  <div class="auth-view">
    <div class="auth-container">
      <!-- <div class="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to continue your mental health journey</p>
      </div> -->
      <Login @login-success="handleLoginSuccess" />
      <div class="auth-footer">
        <p>Don't have an account? <router-link to="/register">Sign up</router-link></p>
      </div>
    </div>
    <div class="auth-image">
      <img src="/src/assets/images/login.jpg" alt="Mental Health" />
    </div>
  </div>
</template>

<script>
import Login from '../../components/Auth/Login.vue'

export default {
  name: 'LoginView',
  components: {
    Login,
  },
  methods: {
    handleLoginSuccess() {
      this.$router.push('/dashboard')
    },
  },
}
</script>

<style scoped>
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
