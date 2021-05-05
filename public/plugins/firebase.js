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

  Object.defineProperties(data, {
    'id': {
      value: snapshot.id
    },
    'path': {
      value: snapshot.ref.path
    },
    'ref': {
      value: snapshot.ref
    },
    'snapshot': {
      value: snapshot
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
  /*
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

    console.log(this.$watch);

    this.$options.computed = {
      ...this.$options.computed,
      ...computed,
    }

  },
  */
  created() {
    
    const {
      db: refs
    } = this.$options

    if (!refs) return

    for (const key in refs) {

      const callbacks = {
        before: refs[key].before instanceof Function ? refs[key].before : () => {},
        resolve: refs[key].resolve instanceof Function ? refs[key].resolve : () => {},
        reject: refs[key].reject instanceof Function ? refs[key].reject : () => {},
      }

      let computed
      
      if ( refs[key] instanceof Function ) {
        computed = refs[key]
      }

      if ( refs[key] instanceof Object && 'ref' in refs[key] && refs[key]['ref'] instanceof Function ) {
        computed = refs[key]['ref']
      }

      if (!computed) return

      // Re-bind properties when computed properties re-evaluate
      //this.$watch(`${key}Query`|fnc, (query) => {
      this.$watch(computed , (query) => {

        if (!query || !(query instanceof Object)) {

          if (this.$firestoreRefs[key]) {
            this.$unbind(key)
          }

          return
        }

        if (
          (
            Object.getPrototypeOf(query) === firebase.firestore.CollectionReference.prototype ||
            Object.getPrototypeOf(query) === firebase.firestore.Query.prototype ||
            Object.getPrototypeOf(query) === firebase.firestore.DocumentReference.prototype
          ) &&
          !(this.$firestoreRefs[key] && this.$firestoreRefs[key].isEqual(query))
        ) {
          console.time(`$bind: ${key} Vue(${this._uid})`)
        
          callbacks.before.call(this);

          return this.$bind(key, query).then((res) => {
            console.log(`${key}:`, res);
            console.timeEnd(`$bind: ${key} Vue(${this._uid})`)
            callbacks.resolve.call(this, res);
          })
          .catch((res) => {
            //console.log(res)
            console.timeEnd(`$bind: ${key} Vue(${this._uid})`)
            callbacks.reject.call(this);
          })

        }

      }, {
        immediate: true
      })

    }

  }
})


/* Database instance from firebase */
export default async (ctx, inject) => { // { app, store, isDev }

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


  
  /*

  //https://stackoverflow.com/questions/16597170/check-if-an-object-has-a-user-defined-prototype/16597314#16597314
    console.log(ctx.app.mixins)

  ctx.app.mixins = [{
      beforeCreate : function () {
        console.log('beforeCreate  mixin hook called')
      }
  }]
  
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
