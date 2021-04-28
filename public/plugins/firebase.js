import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

/* Vuefire must be installed as a Vue plugin */
import Vue from 'vue'
import {
  firestorePlugin
} from 'vuefire'


const serialize = (snapshot) => {
  // snapshot.data() DOES NOT contain the `id` of the document. By
  // default, Vuefire adds it as a non enumerable property named id.
  // This allows to easily create copies when updating documents, as using
  // the spread operator won't copy it
  let data = snapshot.data()

  //https://stackoverflow.com/questions/16597170/check-if-an-object-has-a-user-defined-prototype/16597314#16597314
  /*
  const iterate = function(...args) {

    const [obj, path = "", depth = 0] = args
       
    //for (const [property, value] of Object.entries(obj)) {
    Object.entries(obj).forEach(([property, value]) => {
               
        if ( Object.getPrototypeOf(value) === Object.prototype ) {

          //iterate(value, `${path}${depth == 0 ? '' : '.'}${property}`, depth + 1);
        
        } else if ( Object.getPrototypeOf(value) === Array.prototype ) {
                      
          //for (const [i, v] of value.entries()) {
          //  iterate(v, `${path}${depth == 0 ? '' : '.'}${property}[${i}]`, depth + 1);
          //}          
          
        } else if (
          Object.getPrototypeOf(value) === String.prototype ||
          Object.getPrototypeOf(value) === Boolean.prototype
        ) {
          
		
          //enclose(value, property, `${path}${depth == 0 ? '' : '.'}${property}: ${value}`)
          
          console.log(`${property}Query`); // "a 5", "b 7", "c 9"

          Object.defineProperty( value , `${property}Test`, {

            get() {
      
              return "ME"; //snapshot.get(`${path}${depth == 0 ? '' : '.'}${property}`)
              
            },
            set(newValue) {       
              
              console.log(`${path}: ${value}`); 
      
            },
            configurable: true,

          })
          
        } else {

          // ignore
        }
     
    })

  }

  iterate(data, "", 0)
  */

  

  Object.defineProperties(data, {
    'id': {
      value: snapshot.id
    },
    'path': {
      value: snapshot.ref.path
    },
    'ref': {
      value: snapshot.ref
    }
  })

  //console.log(data);
  return data
}

Vue.use(firestorePlugin, {
  serialize
})


// Idea from: https://github.com/vuejs/vuefire/issues/208
Vue.mixin({
  beforeCreate() {

    const {
      db: refs
    } = this.$options

    if (!refs) return

    const computed = {}
    // For $options.$db property register a computed property prefixed with _
    // Merge dynamically created computed properties with component's computed properties
    for (const key in refs) {
      computed[`${key}Query`] = refs[key]
    }

    this.$options.computed = {
      ...this.$options.computed,
      ...computed,
    }

  },
  created() {

    const {
      db: refs
    } = this.$options

    if (!refs) return

    for (const key in refs) {
      // Re-bind properties when computed properties re-evaluate
      this.$watch(`${key}Query`, (query) => {

        if (!query) return
        //console.log(query);
        if (
            Object.getPrototypeOf(query) === firebase.firestore.CollectionReference.prototype ||
            Object.getPrototypeOf(query) === firebase.firestore.Query.prototype ||
            Object.getPrototypeOf(query) === firebase.firestore.DocumentReference.prototype
        ) {
          return this.$bind(key, query)
        }

        if (this.$firestoreRefs[key]) {
          return this.$unbind(key)
        }

      }, {
        immediate: true
      })

    }

  }
})


/* Database instance from firebase */
export default async (ctx, inject) => { // { app, store, isDev }

  /*
  console.log(ctx.app.mixins)

  ctx.app.mixins = [{
      beforeCreate : function () {
        console.log('beforeCreate  mixin hook called')
      }
  }]
  */

  try {

    if (ctx.isDev) { //process.env.NODE_ENV == 'production'
      // Development mode, use emulators
      const response = await fetch('http://localhost:5000/__/firebase/init.json')
      const config = await response.json()
      firebase.initializeApp(config)
      firebase.auth().useEmulator('http://localhost:9099')
      firebase.firestore().useEmulator('localhost', 8080)
      firebase.functions().useEmulator('localhost', 5001)
      firebase.setLogLevel('info')
      window.firebase = firebase
    } else { //process.env.NODE_ENV == 'development'
      // Production mode
      const response = await fetch('/__/firebase/init.json')
      const config = await response.json()
      firebase.initializeApp(config)
    }

    // Sync firebase user with a 'user' store (firebase.auth().onAuthStateChanged)
    ctx.store.dispatch('user/$init')

    // Inject firebase, this.$firebase
    inject('firebase', firebase)

  } catch (err) {
    // catches errors both in fetch and response.json
    console.log(err)
  }

}
