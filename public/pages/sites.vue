<template>
    <nuxt-child/>    
</template>

<script>
export default {
    layout({route}) {
        return 'default' //route.name == 'sites' ? 'blank' : 'default';
    },
    middleware: ['authenticated'],  
}
</script>