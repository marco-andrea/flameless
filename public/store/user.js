import firebase from 'firebase/app'
import 'firebase/auth'

export const state = () => ({
  user: null,
})

export const mutations = {
  set(state, user) {
    state.user = user
  },
}

export const actions = {
  $start: {
    root: true,
    handler ( store ) {
      console.log('$start user', store);
    }
  },  
  $init({ commit }) {
    firebase.auth().onAuthStateChanged(user => commit('set', user ? user.toJSON() : null) )
  },
  
}
