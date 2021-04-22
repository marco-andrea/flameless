<template lang="html">
  <v-form v-model="valid" ref="form" @submit.prevent="sendPasswordReset" @input.native="errorMessages = { email: [], password: []}">
    <v-window v-model="step">
      <v-window-item :value="1">

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
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" depressed :loading="loading" type="submit">Reset Password</v-btn>
        </v-card-actions>        
      </v-window-item>

      <v-window-item :value="2">
        <v-card-text class="text-center">
          Password reset email sent.
        </v-card-text>
      </v-window-item>

    </v-window>
  </v-form>
</template>

<script>
export default {
  //transition: 'bounce',
  data() {
    return {
      step: 1,
      loading: false,
      valid: null,
      form: {
        email: null,
      },
      errorMessages: {
        email: [],
      },
    }
  },
  methods: {
    async sendPasswordReset(event) {

      if (! this.$refs['form'].validate() ) {
        return;
      }

      this.loading = true

      try {
        
        await this.$firebase.auth().sendPasswordResetEmail(this.form.email, {
          url: window.location.origin
        })
        
        //await new Promise( (resolve, reject) => setTimeout(resolve, 3000) )
        this.step = 2

      } catch (e) {
        this.errorMessages.email = [e.message]
      } finally {
        this.loading = false
      }

    },
  },
  watch: {
  }
}
</script>

<style lang="css" scoped>
</style>
