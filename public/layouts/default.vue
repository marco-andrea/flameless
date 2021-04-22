<template>
  <v-app>

    <v-app-bar elevate-on-scroll short app>

      <v-app-bar-nav-icon v-if="$vuetify.breakpoint.mobile" @click.stop="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-app-bar-nav-icon>      

      <v-toolbar-title v-text="title" />
      
      <v-spacer />

    </v-app-bar>

    <v-navigation-drawer :permanent="!$vuetify.breakpoint.mobile" v-model="drawer" dark app v-if="true">

      <!-- Header -->
      <v-list-item>
   
        <v-list-item-icon>
            <v-icon color="primary">mdi-fire</v-icon>          
        </v-list-item-icon>        

        <v-list-item-title class="title">Flameless</v-list-item-title>

      </v-list-item>

      <v-divider></v-divider>

      <!-- Add new Company Item -->

      <v-list-item v-for="item in items" :key="item.to" :to="item.to" exact>

        <v-list-item-icon>
          <v-icon>{{item.icon}}</v-icon>
        </v-list-item-icon>

        <v-list-item-title>{{item.title}}</v-list-item-title>

      </v-list-item>

    </v-navigation-drawer>


    <v-main>
      <v-container>        
        <nuxt/>
      </v-container>
    </v-main>

  </v-app>
</template>

<script>
  export default {
    data() {
      return {
        drawer: false,
        miniVariant: false,
        title: 'Flameless',
      }
    },
    computed: {
      
      items() {
        console.log(this.$route);
        return [{
          icon: 'mdi-view-dashboard',
          title: 'Dashboard',
          to: '/'
        },
        {
          icon: 'mdi-pencil',
          title: 'Content',
          to: '/inspire'
        },
        {
          icon: 'mdi-account-multiple',
          title: 'Users',
          to: '/users'
        }]

      }
    }
  }

</script>

<style lang="scss">

.v-list-item--active .v-icon {
  color: inherit;
}

.firebase-emulator-warning {
  display: none;
}

html { 
  overflow-y: auto
}
</style>
