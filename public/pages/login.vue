<template>
<v-row align="center" justify="center" class="ma-0">
    <v-col cols="12" sm="8" md="5">

        <v-card class="elevation-2">
            <!--
        <v-card-title color="primary" class="primary title font-weight-regular justify-space-between">
        </v-card-title>
        -->
            <v-tabs fixed-tabs color="primary">
                <v-tab to="/login" exact>Login</v-tab>
                <v-tab to="/login/signup" exact>Signup</v-tab>
                <v-tab to="/login/recover" exact v-if="$route.path == '/login/recover'">Recover</v-tab>
            </v-tabs>
            <nuxt />

        </v-card>

    </v-col>
</v-row>
</template>

<script>
export default {
    layout: 'blank',
    beforeRouteEnter(to, from, next) {
        next(vm => vm.$firebase.auth().signOut())
    },
    data() {
        return {

        }
    },
    methods: {},
}
</script>

<style lang="scss">
/* Change autocomplete styles in WebKit */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
    //-webkit-text-fill-color: white; 

    box-shadow: 0 0 0px 1000px white inset;

    transition: background-color 99999s ease-in-out 0s;

}
</style>
