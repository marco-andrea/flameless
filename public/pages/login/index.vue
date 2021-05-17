<template lang="html">
  <v-form v-model="valid" ref="form" @submit.prevent="login" @input.native="errorMessages = { email: [], password: []}">
    <v-card-text>
      <v-text-field
        v-model="form.email"
        :error-messages="errorMessages.email"
        :rules="[v => !!v || 'Email is required']"
        label="Email" name="email"
        prepend-inner-icon="mdi-email"
        type="text"
        :disabled="loading"
        
        required
      />
      <v-text-field v-model="form.password" :error-messages="errorMessages.password" :rules="[v => !!v || 'Password is required']" label="Password" name="password" prepend-inner-icon="mdi-lock" type="password" :disabled="loading" required />
      <!--<nuxt-link nuxt to="/login/recover" class="caption grey--text text--darken-1">Forgot password?</nuxt-link>-->
    </v-card-text>

    <v-card-actions>
      <v-btn color="primary" text to="/login/recover">Forgot password?</v-btn>
      <v-spacer></v-spacer>
      <v-btn 
        color="primary"
        depressed
        :loading="loading"
        type="submit"
        
      >Login</v-btn>
    </v-card-actions>  

  </v-form>
</template>

<script>
export default {
  //transition: 'bounce',
  data() {
    return {
      loading: false,
      valid: null,
      form: {
        email: '',
        password: '',
      },
      errorMessages: {
        email: [],
        password: [],
      },
    }
  },
  methods: {
    async login(event) {

      if (! this.$refs['form'].validate() ) {
        return;
      }

      this.loading = true

      try {

        await this.$firebase.auth().signInWithEmailAndPassword(this.form.email, this.form.password)
        await this.$router.replace(this.$route.query.redirect_to || '/')

      } catch (e) {

        if (['auth/invalid-email', 'auth/user-disabled', 'auth/user-not-found'].includes(e.code)) {
          this.errorMessages.email = [e.message]
        } else if (['auth/wrong-password'].includes(e.code)) {
          this.errorMessages.password = [e.message]
        } else {

        }

      }
      
      this.loading = false

    },
  },
  watch: {
  }
}
</script>

<style lang="css" scoped>
</style>
