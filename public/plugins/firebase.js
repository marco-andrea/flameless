import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'    

/* Vuefire must be installed as a Vue plugin */
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'
Vue.use(firestorePlugin)

/*
Vue.mixin({
  data() {
    return {
      my_global_config: 'This'
    }
  },
  beforeCreate : function () {
    console.log('beforeCreate  mixin hook called')
  }
})
*/

/* Database instance from firebase */
export default async (ctx, inject) => { // { app, store, isDev }

    /*
    console.log(ctx.app.mixins);

    ctx.app.mixins = [{
        beforeCreate : function () {
          console.log('beforeCreate  mixin hook called')
        }
    }]
    */

    try {
        
        if ( ctx.isDev ) { //process.env.NODE_ENV == 'production'
            // Development mode, use emulators
            const response = await fetch('http://localhost:5000/__/firebase/init.json')
            const config   = await response.json()
            firebase.initializeApp(config)
            firebase.auth().useEmulator('http://localhost:9099')
            firebase.firestore().useEmulator('localhost', 8080)
            firebase.functions().useEmulator('localhost', 5001)
            firebase.setLogLevel('info')
        } else { //process.env.NODE_ENV == 'development'
            // Production mode
            const response = await fetch('/__/firebase/init.json')
            const config   = await response.json()
            firebase.initializeApp(config)
        }

        // Sync firebase user with a 'user' store (firebase.auth().onAuthStateChanged)
        ctx.store.dispatch('user/$init')
        
        // Inject firebase, this.$firebase
        inject('firebase', firebase);
 
    } catch(err) {
        // catches errors both in fetch and response.json
        console.log(err);
    }    

}