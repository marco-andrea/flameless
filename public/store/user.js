import firebase from 'firebase/app'
import 'firebase/auth'

const getDefaultState = () => ({
  apiKey: null,
  appName: null,
  authDomain: null,
  createdAt: null,
  displayName: null,
  email: null,
  emailVerified: null,
  isAnonymous: null,
  lastLoginAt: null,
  multiFactor: null,
  phoneNumber: null,
  photoURL: null,
  providerData: null,
  redirectEventId: null,
  stsTokenManager: null,
  tenantId: null,
  uid: null,
})

export const state = () => ({
  ...getDefaultState()
})

export const mutations = {
  set(state, user) {
    Object.assign(state, user)
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
    firebase.auth().onAuthStateChanged(user => commit('set', user ? user.toJSON() : getDefaultState()) )
  },
  
}
