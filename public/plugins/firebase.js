import _debounce from 'lodash/debounce'

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

	return data
}

Vue.use(firestorePlugin, {
	serialize
})


// Idea from: https://github.com/vuejs/vuefire/issues/208
Vue.mixin({
	created() {

		const refs = this.$options.db || {}

		for (const key in refs) {

			let computed

			// If computed its a function
			if (refs[key] instanceof Function) {

				computed = refs[key]

				// If computed its a object and contains the computed function 'ref()'
			} else if (refs[key] instanceof Object && 'ref' in refs[key] && refs[key]['ref'] instanceof Function) {

				computed = refs[key]['ref']

				// Else continue with the next db 
			} else {

				continue
			}

            const options = {
				maxRefDepth: 2
			}

			const callbacks = {
				before: refs[key].before instanceof Function ? refs[key].before : () => {},
				resolve: refs[key].resolve instanceof Function ? refs[key].resolve : () => {},
				reject: refs[key].reject instanceof Function ? refs[key].reject : () => {},
				finally: refs[key].finally instanceof Function ? refs[key].finally : () => {},
			}

			// wait option
			if (refs[key] instanceof Object && 'wait' in refs[key]) {
				options.wait = refs[key].wait
			}

            // debounce 20ms, if computed react to multiple reactive properties, prevent unncessary fires
			const callback = _debounce(function (query) {

				if (!query || !(query instanceof Object)) {

					if (this.$firestoreRefs[key]) {
						this.$unbind(key)
					}

					return
				}

				//https://stackoverflow.com/questions/16597170/check-if-an-object-has-a-user-defined-prototype/16597314#16597314
				//Object.getPrototypeOf(value) === String.prototype ||
				//Object.getPrototypeOf(value) === Boolean.prototype

				if (
					(
						Object.getPrototypeOf(query) === firebase.firestore.CollectionReference.prototype ||
						Object.getPrototypeOf(query) === firebase.firestore.Query.prototype ||
						Object.getPrototypeOf(query) === firebase.firestore.DocumentReference.prototype
					) &&
					// Ignore if query not changed
					!(this.$firestoreRefs[key] && this.$firestoreRefs[key].isEqual(query))
				) {
					//console.time(`$bind: ${key} Vue(${this._uid})`)        

					callbacks.before.call(this)

					//console.log(`${key}:`, options)

					return this.$bind(key, query, options).then((res) => {

							//console.log(`BIND ${key}:`, res)
							callbacks.resolve.call(this, res)

						})
						.catch((err) => {

							//console.error(err)
							callbacks.reject.call(this, err)

						}).finally(() => {

							//console.timeEnd(`$bind: ${key} Vue(${this._uid})`)
							callbacks.finally.call(this)

						})
				}
			}, 20)

			// Re-bind properties when computed properties re-evaluate			
			this.$watch(computed, callback, {
				immediate: true
			}) // end $watch

		} // end for
	} // end create()
}) // end mixin






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
