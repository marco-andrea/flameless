<template>
<v-row justify="center" class="pt-5">

    <v-col cols="12" sm="8">

        <v-fade-transition group tag="div" class="row">

            <v-col
                cols="12"
                sm="6"
                lg="4"
                key="new"
            >

                <v-hover v-slot="{ hover }" open-delay="0">
                    <v-form ref="form" @submit.prevent="addSite">
                        <v-card
                            :elevation="hover ? 4 : 2"
                            class=""
                            height="250"
                            :loading="newSiteLoading"
                            :disabled="newSiteLoading"
                        >
                            <v-card-text class="new-site-card fill-height d-flex flex-column justify-space-around">

                                <div class="">
                                    <v-text-field
                                        color="primary"
                                        label="Site title"
                                        v-model="newSiteTitle"
                                        :rules="[v => newSiteTitle.length > 0 || 'This field is required']"
                                        required
                                        class="text-center"
                                    ></v-text-field>
                                </div>
                                <div class="">
                                    <v-btn
                                        text
                                        block
                                        color="primary"
                                        type="submit"
                                    >Add site</v-btn>
                                </div>

                            </v-card-text>

                        </v-card>
                    </v-form>
                </v-hover>

            </v-col>

            <v-col
                cols="12"
                sm="6"
                lg="4"
                v-for="site in sites"
                :key="site.path"
            >

                <v-hover v-slot="{ hover }" open-delay="0" v-if="typeof site.siteRef == 'object' && site.siteRef != null">
                    <v-card
                        v-ripple
                        :elevation="hover ? 4 : 2"
                        height="250"
                        class="d-flex"
                        :to="{
                            name: 'sites-siteId-content-contentType', 
                            params: {
                                siteId: site.siteRef.id,
                                contentType: 'pages',
                            }
                        }"
                    >
                        <!--@click="deleteSite(site.siteRef.id)"-->
                        <v-card-text class="align-self-center text-center">
                            <h3 class="primary--text">{{site.siteRef.title}}</h3>
                        </v-card-text>
                    </v-card>
                </v-hover>
                <v-hover v-slot="{ hover }" open-delay="0" v-else>
                    <v-card :elevation="hover ? 4 : 2" height="250">
                        <v-skeleton-loader class="mx-auto" type="article, actions"></v-skeleton-loader>
                    </v-card>
                </v-hover>

            </v-col>

        </v-fade-transition>

    </v-col>
</v-row>
</template>

<style lang="scss">
.new-site-card * {
    text-align: center !important
}
</style>

<script>
export default {

    data() {
        return {
            newSiteTitle: '',
            newSiteLoading: false,
            sites: [],
        }
    },
    created() {},
    methods: {
        async addSite() {

            if (!this.$refs.form.validate()) {
                return
            }

            this.newSiteLoading = true

            const batch = this.$firebase.firestore().batch()
            const siteRef = this.$firebase.firestore().collection("sites").doc()

            batch.set(siteRef, {
                title: this.newSiteTitle,
            })
            batch.set(siteRef.collection("members").doc(this.$firebase.auth().currentUser.uid), {
                role: "admin",
                siteRef: siteRef,
                userRef: this.$firebase.firestore().collection("users").doc(this.$firebase.auth().currentUser.uid),
                site_owner: true
            })

            try {
                await batch.commit()

                await this.$router.push({
                    name: 'sites-siteId-content-contentType',
                    params: {
                        siteId: siteRef.id,
                        contentType: 'pages',
                    }
                })

                this.newSiteTitle = ''

            } catch (error) {
                console.error(error)
            }

            this.newSiteLoading = false

        },
        deleteSite(id) {
            const batch = this.$firebase.firestore().batch()
            batch.delete(this.$firebase.firestore().collection("sites").doc(id).collection("members").doc(this.$store.state.user.uid))
            batch.delete(this.$firebase.firestore().collection("sites").doc(id))
            batch.commit()
        },
    },
    db: {
        sites() {

            const user = this.$store.state.user.uid
            if (!user) return

            const userRef = this.$firebase.firestore().collection("users").doc(user)
            const sitesRef = this.$firebase.firestore().collectionGroup('members').where('userRef', '==', userRef)

            return sitesRef
        }
    },
    computed: {
        siteList() {
            //return this.sites.filter(site => typeof site.siteRef == 'object' &&)
        }
    },
    watch: {},
}
</script>
