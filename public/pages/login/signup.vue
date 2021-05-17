<template>
<v-form
    v-model="valid"
    ref="form"
    @submit.prevent="signup"
    @input.native="errorMessages = { email: [], password: []}"
>
    <v-card-text>

        <v-text-field
            v-model="form.displayName"
            :rules="[v => !!v || 'Name is required']"
            label="Name"
            name="new-name"
            prepend-inner-icon="mdi-account"
            type="text"
            :disabled="loading"
            required
        />

        <v-text-field
            v-model="form.email"
            :error-messages="errorMessages.email"
            :rules="[v => !!v || 'Email is required']"
            label="Email"
            name="new-email"
            prepend-inner-icon="mdi-email"
            type="text"
            :disabled="loading"
            required
        />
        <v-text-field
            v-model="form.password"
            :error-messages="errorMessages.password"
            autocomplete="new-password"
            :rules="[v => !!v || 'Password is required']"
            label="Password"
            name="new-password"
            prepend-inner-icon="mdi-lock"
            type="password"
            :disabled="loading"
            required
        />

        <!--<v-text-field autocomplete="new-password" :rules="[v => !!v || 'Confirm password is required', v => v == form.password || 'Password dont match']" label="Confirm Password" name="new-password" prepend-inner-icon=" " type="password" :disabled="loading"
        required />-->
    </v-card-text>

    <v-card-actions>
        <v-btn
            color="primary"
            block
            depressed
            :loading="loading"
            type="submit"
        >Signup</v-btn>
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
                displayName: null,
                email: null,
                password: null,
            },
            errorMessages: {
                email: [],
                password: [],
            },
        }
    },
    methods: {
        async signup(event) {

            if (!this.$refs['form'].validate()) {
                return;
            }

            this.loading = true

            const {
                displayName,
                email,
                password,
            } = this.form

            try {

               
                
                let {
                    user
                } = await this.$firebase.auth().createUserWithEmailAndPassword(email, password)

                await user.updateProfile({
                    displayName: displayName
                })

                // Refresh token to get updated user fields
                await user.getIdTokenResult(true)

                /*
                const batch = this.$firebase.firestore().batch()
                const userRef = this.$firebase.firestore().collection('users').doc(user.uid)

                batch.set(userRef, {
                    email: user.email,
                    displayName: user.displayName,
                }, {
                    merge: true
                })

                await batch.commit()
                */
                                
                await this.$firebase.firestore().collection('users').doc(user.uid).set({
                    email: user.email,
                    displayName: user.displayName,
                }, {
                    merge: true
                })                

                // TODO: Show message on success
                await new Promise(resolve => setTimeout(resolve, 1000))
                await this.$router.replace(this.$route.query.redirect_to || '/')                

            } catch (e) {

                if (['auth/invalid-email', 'auth/email-already-in-use', 'auth/operation-not-allowed'].includes(e.code)) {
                    this.errorMessages.email = [e.message]
                } else if (['auth/weak-password'].includes(e.code)) {
                    this.errorMessages.password = [e.message]
                } else {

                }

            }
            
            this.loading = false            

        },
    },
    watch: {}
}
</script>

<style lang="css" scoped>
</style>
