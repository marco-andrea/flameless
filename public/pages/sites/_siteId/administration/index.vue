<template>
    <div>
        <h1>sites/_siteId/settings.vue</h1>
        <pre>{{site}}</pre>
    </div>
</template>

<script>
export default {
    data() {
        return {
            site: null,
            edit: null,
        }
    },
    db:{
        site: {
            ref() {            
                const {
                    siteId,
                } = this.$route.params
                
                if (!siteId) return

                return this.$firebase.firestore().doc(`sites/${siteId}`)
            },
            resolve(res) {
                //console.log(this);
                this.edit = Object.assign({}, res)
            }        
        }
    },
    watch: {
        
    }
}
</script>