<template>
  <v-row justify="center" class="pt-5">
    <v-col cols="12" sm="8">

      <v-row>

        <template v-for="i in 5">
          <v-col cols="12" sm="6" lg="4" :key="i">

          <v-hover v-slot="{ hover }" open-delay="0">
            <v-card  v-ripple :elevation="hover ? 4 : 2" :class="[{ 'on-hover': hover }, 'd-flex']" height="250">
              <v-card-text class="align-self-center text-center">
                <v-icon color="primary" large>mdi-plus</v-icon>
                <h3 class="primary--text">Add project</h3>
              </v-card-text>                    
            </v-card>
          </v-hover>

          </v-col>
        </template>

      </v-row>



    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
.v-card {
  cursor: pointer;
}
</style>

<script>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
/*

db.collectionGroup('users').where('userRef', '==', db.collection() ).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
    });
})

var batch = db.batch();
siteRef = db.collection("sites").doc();
batch.set(siteRef, {title: "New Site"});
batch.set(siteRef.collection("users").doc(firebase.auth().currentUser.uid), {
role: "admin",
userRef: db.collection("users").doc( firebase.auth().currentUser.uid ),
site_owner: true
});

batch.commit()

*/
export default { 
  components: {
    Logo,
    VuetifyLogo
  },
  data() {
    return {
      sites: [],
      cards: [
        { title: 'Pre-fab homes', src: 'https://cdn.vuetifyjs.com/images/cards/house.jpg', flex: 4 },
        { title: 'Favorite road trips', src: 'https://cdn.vuetifyjs.com/images/cards/road.jpg', flex: 4 },
        { title: 'Best airlines', src: 'https://cdn.vuetifyjs.com/images/cards/plane.jpg', flex: 4 },
      ],      
    }
  },  
  methods: {
    clickMe() {
        console.log( this.$firebase )
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        //this.$store.commit('user/add', 'e.target.value')
    }
  },
  computed: {
    user () {
      
      return this.$store.state.user.user
    }
  },
  middleware: ['authenticated'],  
}
</script>
