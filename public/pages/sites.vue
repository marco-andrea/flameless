<template>
    <div>
        <h1>sites.vue</h1>
        <pre>{{$store.state.route}}</pre>
        <pre>{{$route.query}}</pre>
        
        <nuxt-child/>        
    </div>
</template>

<script>
export default {
    layout({route}) {
        return route.name == 'sites' ? 'blank' : 'default';
    },
    middleware: ['authenticated'],  
}
</script>