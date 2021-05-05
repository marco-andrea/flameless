<template>
<div>
    <h1 class="text--primary">SETTINGS <span class="text-caption">sites/_siteId/content/_contentType/settings.vue</span></h1>

    <v-card
        v-for="contentType in contentTypes"
        :key="contentType.id"
        class="mt-10"
        :loading="loading"
        :disabled="loading"
    >

        <v-simple-table>
            <template v-slot:default>
                
                <thead>
                    <tr>
                        <th>{{contentType.title.toUpperCase()}}</th>
                        <th v-for="capability in capabilitiesList" :key="capability">{{capability}}</th>
                    </tr>
                </thead>
                
                <draggable :value="Object.values(contentType.roles).sort((a, b) => a.order - b.order)" @input="$event.forEach((value, index) => value.order = index )" tag="tbody" draggable=".item">

                    <tr v-for="[role, {capabilities}] of Object.entries(contentType.roles).sort(([,a], [,b]) => a.order - b.order)" :key="role" class="item">
                        <td>{{role.toUpperCase()}}</td>
                        <td v-for="capability in capabilitiesList" :key="capability">
                            <v-checkbox v-model="capabilities[capability]"></v-checkbox>
                        </td>
                    </tr>
                    <tr slot="footer">
                        <td>Add</td>
                    </tr>
                </draggable>
                
            </template>
        </v-simple-table>

    </v-card>
    <v-btn color="primary" @click="save">
        Save
    </v-btn>
    <pre>{{contentTypes}}</pre>
</div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
    components: {
        draggable,
    },
    data() {
        return {
            capabilitiesList: [
                "read",
                "edit",
                "edit_others",
                "delete",
                "delete_others",
                "manage_categories",
            ],
            loading: false,
            valid: null,
            user: null,
            contentTypes: [],
        }
    },
    db: {
        user() {
            const siteId = this.$route.params.siteId
            const userUID = this.$store.state.user.uid
            if (!userUID || !siteId) return
            return this.$firebase.firestore().collection(`sites/${siteId}/users`).doc(userUID)
        },
        contentTypes() {
            const siteId = this.$route.params.siteId
            const {
                role
            } = this.user || {}
            if (!role || !siteId) return
            return this.$firebase.firestore().collection(`sites/${siteId}/content`)
        }

    },
    methods: {

        async save() {

            this.loading = true

            const batch = this.$firebase.firestore().batch()

            for (const [, contentType] of this.contentTypes.entries()) {
                batch.update(contentType.ref, contentType)
            }

            try {
                await batch.commit()
            } catch ({
                code,
                name,
                message
            }) {
                console.error(message);
            }

            this.loading = false

        }
    },
    watch: {}
}
</script>


<style lang="scss">

.sortable-chosen {
    background: #eeeeee;
}
.list-group-item {
  cursor: move;
}
</style>