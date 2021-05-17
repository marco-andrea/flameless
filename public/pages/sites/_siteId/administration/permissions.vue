<template>
<div>

    <v-toolbar rounded elevation="1">
        <v-toolbar-title>Permissions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="save">Save</v-btn>
    </v-toolbar>

    <v-card
        v-for="(contentType, index) in contentTypes"
        :key="contentType.id"
        class="mt-5"
        :loading="loading"
        :disabled="loading"
    >

        <v-form ref="form" lazy-validation @submit.prevent="addRole(index)">
            <v-simple-table>
                <template v-slot:default>

                    <thead>
                        <tr>
                            <th>{{contentType.title.toUpperCase()}}</th>
                            <th v-for="capability in capabilitiesList" :key="capability">{{capability}}</th>
                            <th></th>
                        </tr>
                    </thead>

                    <draggable
                        :value="Object.values(contentType.roles).sort((a, b) => a.order - b.order)"
                        @input="$event.forEach((value, index) => value.order = index )"
                        tag="tbody"
                        draggable=".item"
                    >
                        <tr v-for="[role, {capabilities}] of Object.entries(contentType.roles).sort(([,a], [,b]) => a.order - b.order)" :key="role" class="item">
                            <td>{{role.toUpperCase()}}</td>
                            <td v-for="capability in capabilitiesList" :key="capability">
                                <v-checkbox v-model="capabilities[capability]"></v-checkbox>
                            </td>
                            <td>
                                <v-btn @click="$delete(contentType.roles, role)" block>Delete</v-btn>
                            </td>
                        </tr>
                        <tr slot="footer">
                            <td>
                                <v-text-field
                                    label="Role"
                                    :value="newRole[contentType.id] ? newRole[contentType.id].id : ''"
                                    @input="newRole[contentType.id] ? $set(newRole[contentType.id], 'id', $event) : $set(newRole, contentType.id, { id: $event, capabilities: {} })"
                                    class=""
                                    required
                                    :rules="[
                                            v => !!v || 'Role is required',
                                            v => /^[a-z]+$/.test(v) || 'Role must be only lower case letters',
                                            v => !Object.keys(contentType.roles).includes(v) || 'Role already exists'
                                            ]"
                                ></v-text-field>
                            </td>
                            <td v-for="capability in capabilitiesList" :key="capability">
                                <v-checkbox v-model="newRole[contentType.id].capabilities[capability]" v-if="newRole[contentType.id]"></v-checkbox>
                                <v-checkbox v-else disabled></v-checkbox>
                            </td>
                            <td>
                                <v-btn color="primary" type="submit" block>Add</v-btn>
                            </td>
                        </tr>
                    </draggable>

                </template>
            </v-simple-table>
        </v-form>

    </v-card>

    <div class="px-0 d-flex flex-row-reverse mt-5">

    </div>
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
            newRole: {},
            capabilitiesList: [
                "read",
                "edit",
                "edit_others",
                "delete",
                "delete_others",
                "manage_categories",
            ],
            loading: false,
            user: null,
            contentTypes: [],
        }
    },
    db: {
        /*
        user() {
            const siteId = this.$route.params.siteId
            const userUID = this.$store.state.user.uid
            if (!userUID || !siteId) return
            return this.$firebase.firestore().collection(`sites/${siteId}/members`).doc(userUID)
        },
        */
        contentTypes() {
            const siteId = this.$route.params.siteId
            const {
                role
            } = this.user || {}
            if (!siteId) return
            return this.$firebase.firestore().collection(`sites/${siteId}/content`)
        }

    },
    methods: {
        logg(evt) {
            console.log(evt)
        },
        addRole(index) {

            if (this.$refs.form[index].validate()) {

                this.$set(this.contentTypes[index].roles, this.newRole[this.contentTypes[index].id].id, {
                    capabilities: this.newRole[this.contentTypes[index].id].capabilities,
                    order: Infinity
                })

                this.$delete(this.newRole, this.contentTypes[index].id)

                this.$refs.form[index].resetValidation()
            }
        },
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
                console.error(message)
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
