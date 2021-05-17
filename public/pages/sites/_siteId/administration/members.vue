<template>
<div>

    <v-toolbar rounded elevation="1">
        <v-toolbar-title>Members</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn @click="$router.push({query: {...$route.query, item: undefined, action: 'add'} })" color="primary">Add member</v-btn>

        <v-dialog
            :transition="$vuetify.breakpoint.mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
            :value="$route.query.item || $route.query.action"
            :fullscreen="$vuetify.breakpoint.mobile"
            @click:outside="close"
            @keydown.esc="close"
            max-width="500px"
        >

            <v-toolbar dark color="primary" v-if="$vuetify.breakpoint.mobile">
                <v-btn icon dark @click="close">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title v-if="['add', 'edit'].includes($route.query.action)">Edit item</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>

                    <v-btn @click="$refs.form.validate() && save()" dark text>
                        <span v-if="$route.query.action == 'add'">Add</span>
                        <span v-if="$route.query.action == 'edit'">Save</span>
                    </v-btn>

                    <v-btn
                        v-if="$route.query.action == 'delete'"
                        @click="remove"
                        dark
                        text
                    >Delete</v-btn>

                </v-toolbar-items>
            </v-toolbar>

            <v-card tile :loading="memberLoading" :disabled="memberLoading">

                <v-card-title>
                    <span class="headline" v-if="$route.query.action == 'add'">Add member</span>
                    <span class="headline" v-if="$route.query.action == 'edit'">Edit member</span>
                    <span class="headline" v-if="$route.query.action == 'delete'">Are you sure you want to delete this member?</span>
                </v-card-title>

                <v-card-text v-if="['add', 'edit'].includes($route.query.action)" class="py-0">

                    <v-form ref="form" lazy-validation @submit.prevent="submitUser">

                        <v-container class="px-0">
                            <v-row>
                                <v-col cols="12" v-if="$route.query.action == 'add'">

                                    <v-autocomplete
                                        :hide-no-data="!searchUserByEmail || searchUserLoading"
                                        :rules="[v => !!v || 'User is required']"
                                        :search-input.sync="searchUserByEmail"
                                        placeholder="Start typing to Search"
                                        :loading="searchUserLoading"
                                        :items="searchUserResult"
                                        v-model="editedMember.id"
                                        label="Search user"
                                        item-text="email"
                                        item-value="id"
                                        no-filter
                                        required
                                    >

                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12">
                                    <v-select v-model="editedMember.role" :items="roles" label="Role"></v-select>
                                </v-col>
                                <v-col cols="12">
                                    <v-checkbox v-model="editedMember.site_owner" label="Site owner"></v-checkbox>
                                </v-col>

                            </v-row>
                        </v-container>

                    </v-form>

                </v-card-text>

                <v-card-text>
                    <v-container class="px-0">
                        <v-row>
                            <v-col cols=12>
                                <v-alert type="error" :value="!!dialogError">{{dialogError}}</v-alert>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>

                <v-card-actions v-if="!$vuetify.breakpoint.mobile">
                    <v-spacer></v-spacer>

                    <v-btn color="primary" text @click="close">Cancel</v-btn>

                    <v-btn @click="$refs.form.validate() && save()" color="primary" text>
                        <span v-if="$route.query.action == 'add'">Add</span>
                        <span v-if="$route.query.action == 'edit'">Save</span>
                    </v-btn>

                    <v-btn
                        v-if="$route.query.action == 'delete'"
                        color="primary"
                        @click="remove"
                        text
                    >Delete</v-btn>

                    <v-spacer></v-spacer>
                </v-card-actions>

            </v-card>

        </v-dialog>

    </v-toolbar>

    <v-card class="mt-5">

        <v-data-table
            :loading="membersLoading"
            :items-per-page="-1"
            hide-default-footer
            :headers="headers"
            disable-pagination
            :items="members"
            multi-sort
        >

            <!--
            <template v-slot:footer="opt">
                <div class="v-data-footer py-2">

                    <div class="v-data-footer__pagination">1-10 of many</div>
                    <div class="v-data-footer__icons-before">
                        <v-btn
                            depressed
                            icon
                            class="mr-2"

                        >
                            <v-icon>mdi-chevron-left</v-icon>
                        </v-btn>
                    </div>
                    <div class="v-data-footer__icons-after">
                        <v-btn
                            depressed
                            icon
                            class="ml-2"

                        >
                            <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                    </div>

                </div>
            </template>
            -->
            <template v-slot:item.actions="{ item }">
                <v-icon @click="$router.push({query: { ...$route.query, item: item.id, action: 'edit'}})" small class="mr-2">mdi-pencil</v-icon>
                <v-icon @click="$router.push({query: { ...$route.query, item: item.id, action: 'delete'}})" small class="">mdi-delete</v-icon>
            </template>

        </v-data-table>

    </v-card>

</div>
</template>

<script>
import _debounce from 'lodash/debounce'

export default {
    data() {
        return {
            members: [],
            membersLoading: false,

            member: null,
            memberLoading: false,

            editedMember: {
                id: null,
                role: '',
                site_owner: false,
            },
            defaultMember: {
                id: null,
                role: '',
                site_owner: false,
            },

            headers: [{
                text: 'Name',
                align: 'start',
                sortable: false,
                value: 'userRef.displayName',
            }, {
                text: 'Email',
                value: 'userRef.email',
            }, {
                text: 'Role',
                value: 'role',
            }, {
                text: 'Site Owner',
                value: 'site_owner',
            }, {
                text: 'Actions',
                value: 'actions',
                sortable: false
            }],

            contentTypes: [],

            searchUserResult: [],
            searchUserByEmail: '',
            searchUserByEmailDebounced: '',
            searchUserLoading: false,
            dialogError: false,
            user: null,
        }
    },
    db: {

        user() {
            const siteId = this.$route.params.siteId
            const userUID = this.$store.state.user.uid
            if (!userUID || !siteId) return
            return this.$firebase.firestore().doc(`sites/${siteId}/members/${userUID}`)
        },

        searchUserResult: {
            ref() {

                const email = this.searchUserByEmailDebounced

                if (!email) return

                return this.$firebase.firestore().collection('users').where('email', '==', email).limit(1)

            },
            before() {
                this.searchUserLoading = true
            },
            finally() {
                this.searchUserLoading = false
            },
        },

        member: {

            ref() {
                const siteId = this.$route.params.siteId
                const item = this.$route.query.item
                if (!item) return
                return this.$firebase.firestore().doc(`sites/${siteId}/members/${item}`)
            },
            before() {
                this.memberLoading = true
            },
            finally() {
                this.memberLoading = false
            },
        },

        members: {
            ref() {
                const siteId = this.$route.params.siteId
                if (!siteId) return
                return this.$firebase.firestore().collection(`sites/${siteId}/members`)
            },
            before() {
                this.membersLoading = true
            },
            finally() {
                this.membersLoading = false
            },
            wait: true,
        },
        contentTypes() {
            const siteId = this.$route.params.siteId
            const {
                role = false
            } = this.user || {}
            if (!role || !siteId) return
            return this.$firebase.firestore().collection(`sites/${siteId}/content`).where(`roles.${role}.capabilities.read`, '==', true)
        },
    },
    computed: {
        roles() {
            return this.contentTypes.reduce((list, contentType) => {
                // Get roles list
                const roles = Object.keys(contentType.roles || {})
                // Merge with the previous list (removing duplicates)
                return [...new Set([...list, ...roles])]
            }, [])
        }
    },
    methods: {

        async close() {

            await this.$router.replace({
                query: {
                    ...this.$route.query,
                    item: undefined,
                    action: undefined,
                }
            })
            // Reset user search field
            this.searchUserByEmail = ''
            // Clear dialog form
            this.editedMember = Object.assign({}, this.defaultMember)
            this.dialogError = false

        },

        async save() {

            this.memberLoading = true
            this.dialogError = false

            const {
                id,
                role,
                site_owner
            } = this.editedMember

            const {
                siteId,
            } = this.$route.params

            const {
                item = id,
            } = this.$route.query

            const batch = this.$firebase.firestore().batch()

            const itemRef = this.$firebase.firestore().collection(`sites/${siteId}/members`).doc(item)

            const itemBody = {
                siteRef: this.$firebase.firestore().doc(`sites/${siteId}`),
                userRef: this.$firebase.firestore().doc(`users/${item}`),
                role,
                site_owner
            }

            batch.set(itemRef, itemBody, {
                merge: true
            })

            try {
                await batch.commit()

                this.close()
            } catch ({
                message
            }) {
                console.log(message);
                this.dialogError = message
            }

            this.memberLoading = false

        },

        async remove() {

            this.memberLoading = true
            this.dialogError = false

            const {
                siteId,
            } = this.$route.params

            const {
                item,
            } = this.$route.query

            const batch = this.$firebase.firestore().batch()

            const itemRef = this.$firebase.firestore().collection(`sites/${siteId}/members`).doc(item)

            batch.delete(itemRef)

            try {

                await batch.commit()

                this.close()

            } catch ({
                message
            }) {
                this.dialogError = message
            }

            this.memberLoading = false

        },

    },
    watch: {
        'member': {
            handler(v) {
                this.editedMember = Object.assign({}, this.defaultMember, v || {})
            },
            immediate: true
        },
        'searchUserByEmail': {
            handler: _debounce(function (val) {
                this.searchUserByEmailDebounced = val
            }, 300),
            immediate: true
        }
    }
}
</script>
