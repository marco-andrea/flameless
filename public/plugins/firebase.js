import firebase from "firebase/app"
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

/* Vuefire must be installed as a Vue plugin */
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'
Vue.use(firestorePlugin)

/* Database instance from firebase */
export default async ({ app }, inject) => {

    try {

        // Production mode
        if ( process.env.NODE_ENV == 'production' ) {

            const response = await fetch('/__/firebase/init.json')
            const config   = await response.json()
            firebase.initializeApp(config)
        }

        // Development mode, use emulators
        if ( process.env.NODE_ENV == 'development' ) {

            const response = await fetch('http://localhost:5000/__/firebase/init.json')
            const config   = await response.json()
            firebase.initializeApp(config)
            firebase.firestore().useEmulator('localhost', 8080)
            firebase.functions().useEmulator('localhost', 5001)
        }
        
        // Inject firebase, this.$firebase
        inject('firebase', firebase);
 
    } catch(err) {
        // catches errors both in fetch and response.json
        console.log(err);
    }    

}