import _cloneDeep from 'lodash/cloneDeep'
import Vue from 'vue'


// Idea from https://github.com/vuejs/vuex-router-sync/blob/master/src/index.ts

const cloneRoute = (to, from) => {

  const clone = {
    name: to.name,
    path: to.path,
    hash: to.hash,
    query: to.query,
    params: to.params,
    fullPath: to.fullPath,
    meta: to.meta,   
  }

  if (from) {
    clone.from = cloneRoute(from)
  }

  return _cloneDeep( clone )
}

const walkState = (object, source) => {

  for (const key in {...object, ...source}) {

    if (key in object && key in source && object[key] != source[key]) {
      
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) ) {
        
        //console.log(`walk ${key}`);
        //recurse
        walkState(object[key], source[key])
                  
      } else {
        //console.log(`update ${key}`); 
        //console.log(`object ${object[key]}`);
        //console.log(`source ${source[key]}`);
        Vue.set(object, key, source[key])  
      }

    } else if (key in object && !(key in source)) {
      //console.log(`delete ${key}`);
      //console.log(object[key]);
      Vue.set(object, key, undefined)
      //Vue.delete(object, key) // Fires changes on unchanged siblings props
    } else if (!(key in object) && key in source) {
      //console.log(`set ${key}`);        
      Vue.set(object, key, source[key])
    } else {
      // skip if value remains the same
    }

  }
  
} 

export default ({ app: { store, router } }) => {
  
  store.registerModule('route', {
    namespaced: true,
    state: cloneRoute( router.currentRoute ),
    mutations: {
      ROUTE_CHANGED: (state, {to, from}) => walkState(state, cloneRoute(to, from) )      
    }
  })

  router.afterEach((to, from) => {

    store.commit('route/ROUTE_CHANGED', { to, from })
    
  })

}