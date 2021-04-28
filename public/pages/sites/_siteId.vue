<template>
    <div>
        <h1>sites/_siteId.vue {{siteId}}</h1>
        <v-btn @click="goTo()"></v-btn>
        <!--
        <v-btn @click="deleteSite()">Delteme</v-btn>
        <pre>{{$route.params.siteId}}</pre>
        <pre>{{site}}</pre>

        <div v-if="site">

            <v-text-field
                :value="site.title" @input="site.ref.update({title: $event})"
                label="Name"  
            ></v-text-field>

            <v-btn @click="showSite(site)">Show</v-btn>

        </div>
        -->

        <nuxt-child/>
        
    </div>
</template>


<script>
export default {
    data() {
        return {
            title: null,
            site: null
        }
    },    
    created() {
       // console.log(this.$route);
    },
    db: {
        site() {
            return this.$firebase.firestore().collection("sites").doc( this.$store.state.route.params.siteId )            
        }
    }, 
    computed: {
        siteId() {
            console.log(`'computed siteId' ${this.$store.state.route.params.siteId}`);

            return this.$store.state.route.params.siteId
        }
    },
    methods: {
        goTo() {
            this.$router.push({
                name: 'sites',
                query: {
                    page: 1,
                    user: [ 'Marco', 'Andrea' ],
                    categories: [1,2,3]
                }
            });
        },        
        showSite(e) {
            //site.ref.update({})
            console.log(e);
        },
        async deleteSite() {

            const batch = this.$firebase.firestore().batch();
            //batch.delete( this.$firebase.firestore().collection("sites").doc( id ).collection("users").doc( this.$store.state.user.uid ) )   
            batch.delete( this.$firebase.firestore().collection("sites").doc( this.$route.params.siteId ) )
            await batch.commit()

            await this.$router.replace({ name: 'sites' })

        }
    },
    watch: {
        '$store.state.router.params': (v) => {
            //console.log(v);
        }
    }
}
</script>