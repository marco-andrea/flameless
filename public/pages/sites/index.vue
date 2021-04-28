<template>
    <v-row justify="center" class="pt-5">
        <h1>sites/index.vue</h1>
        <v-col cols="12" sm="8">

            <v-fade-transition group tag="v-row">
            
                <v-col cols="12" sm="6" lg="4" key="new">

                    <v-hover v-slot="{ hover }" open-delay="0">
                        <v-card v-ripple :elevation="hover ? 4 : 2" class="d-flex" height="250" @click="addSite()">
                        <v-card-text class="align-self-center text-center">
                            <v-icon color="primary" large>mdi-plus</v-icon>
                            <h3 class="primary--text">Add project</h3>
                        </v-card-text>
                        </v-card>
                    </v-hover>

                </v-col>                  
                    
                <v-col cols="12" sm="6" lg="4" v-for="site in sites" :key="site.path">

                    <v-hover v-slot="{ hover }" open-delay="0" v-if="site.siteRef.id">
                        <v-card v-ripple  :elevation="hover ? 4 : 2" height="250" class="d-flex" :to="{ name: 'sites-siteId', params: { siteId: site.siteRef.id } }"><!--@click="deleteSite(site.siteRef.id)"-->
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


<script>
export default { 

    data() {
        return {
            sites: [],
        }
    }, 
    created() {
    },
    methods: {
        addSite() {
            const batch = this.$firebase.firestore().batch();
            const siteRef = this.$firebase.firestore().collection("sites").doc();

            batch.set(siteRef, {title: "New Site"});
            batch.set(siteRef.collection("users").doc(firebase.auth().currentUser.uid), {
                role: "admin",
                siteRef: siteRef,
                userRef: this.$firebase.firestore().collection("users").doc( firebase.auth().currentUser.uid ),
                site_owner: true
            });

            batch.commit()
        },
        deleteSite(id) {
            const batch = this.$firebase.firestore().batch();
            batch.delete( this.$firebase.firestore().collection("sites").doc( id ).collection("users").doc( this.$store.state.user.uid ) )   
            batch.delete( this.$firebase.firestore().collection("sites").doc( id ) )
            batch.commit()
        },            
    },
    db: {
        sites() {

            const user = this.$store.state.user.uid

            if (!user) return false
            
            const userRef = this.$firebase.firestore().collection("users").doc( user )
            const sitesRef = this.$firebase.firestore().collectionGroup('users').where('userRef', '==', userRef)                        

            return sitesRef                
        }
    },
    computed: {
    },
    watch: {     
    },        
}
</script>
