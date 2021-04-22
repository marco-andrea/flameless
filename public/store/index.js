export const state = () => ({
    counter: 0
})

export const mutations = {
    increment(state) {
        state.counter++
    }
}

export const plugins = [
    // Emulate $init hook on all vuex modules
    store => {
        //console.log("plugins init");
        //store.dispatch('$start', store)
    }
    /*
    store => Object.entries({...store._modules, ...store._modulesNamespaceMap}).forEach( ([k, module]) => {   
        if (module._rawModule.hasOwnProperty('actions') && module._rawModule.actions.hasOwnProperty('$init')) {
            module.context.dispatch('$init', { store })
        }
    })
    */

]
