<template>
<div>

    <v-toolbar rounded elevation="1">

        <v-toolbar-title>{{ $route.params.contentType.toUpperCase() }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" :to="{ query: {...$route.query, item: undefined, action: 'add'} }" exact>New Item</v-btn>

        <v-dialog
            :value="$route.query.item || $route.query.action"
            :fullscreen="$vuetify.breakpoint.mobile"
            :transition="$vuetify.breakpoint.mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
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

                    <v-btn
                        dark
                        text
                        @click="$refs.form.validate() && save()"
                        v-if="$route.query.action == 'add'"
                    >Add</v-btn>
                    <v-btn
                        dark
                        text
                        @click="$refs.form.validate() && save()"
                        v-if="$route.query.action == 'edit'"
                    >Save</v-btn>
                    <v-btn
                        dark
                        text
                        @click="remove"
                        v-if="$route.query.action == 'delete'"
                    >Delete</v-btn>

                </v-toolbar-items>
            </v-toolbar>

            <v-card tile :loading="editItemLoading" :disabled="editItemLoading">

                <template>

                    <v-card-title>
                        <span class="headline" v-if="$route.query.action == 'add'">Add item</span>
                        <span class="headline" v-if="$route.query.action == 'edit'">Edit item</span>
                        <span class="headline" v-if="$route.query.action == 'delete'">Are you sure you want to delete this item?</span>
                    </v-card-title>

                    <v-card-text v-if="$route.query.action == 'add' || $route.query.action == 'edit'">
                        <v-form ref="form" @submit.prevent="$refs.form.validate() && save()">
                            <v-container class="px-0">
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field v-model="editedItem.title" label="Title"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="editedItem.content" label="Content"></v-textarea>
                                    </v-col>

                                    <v-col cols="12">
                                        <v-autocomplete
                                            placeholder="Start typing to Search"
                                            :items="membersList"
                                            v-model="editedItem.author"
                                            label="Author"
                                            item-text="displayName"
                                            item-value="id"
                                            return-object
                                        >
                                        </v-autocomplete>

                                    </v-col>

                                    <v-btn class="d-none" type="submit"></v-btn>

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
                        <v-btn
                            color="primary"
                            text
                            @click="$refs.form.validate() && save()"
                            v-if="$route.query.action == 'add'"
                        >Add</v-btn>
                        <v-btn
                            color="primary"
                            text
                            @click="$refs.form.validate() && save()"
                            v-if="$route.query.action == 'edit'"
                        >Save</v-btn>
                        <v-btn
                            color="primary"
                            text
                            @click="remove"
                            v-if="$route.query.action == 'delete'"
                        >Delete</v-btn>
                        <v-spacer></v-spacer>
                    </v-card-actions>

                </template>

            </v-card>

        </v-dialog>

    </v-toolbar>

    <v-card class="mt-5">

        <v-data-table
            :headers="headers"
            :items="items"
            :options="options"
            :loading="loading"
            :items-per-page="-1"
            @update:options="onChangeOptions($event)"
            class="elevation-0"
            hide-default-footer
            disable-pagination
            disable-filtering
            multi-sort
        >

            <template v-slot:top>
            </template>

            <template v-slot:item.createdAt="{ item }">
                <span>{{item.createdAt ? item.createdAt.toDate().toLocaleString() : ''}}</span>
            </template>

            <template v-slot:item.updatedAt="{ item }">
                <span>{{item.updatedAt ? item.updatedAt.toDate().toLocaleString() : ''}}</span>
            </template>

            <template v-slot:item.actions="{ item }">

                <v-btn icon :to="{ query: { ...$route.query, item: item.id, action: 'edit' } }" exact>
                    <v-icon small>mdi-pencil</v-icon>
                </v-btn>

                <v-btn icon :to="{ query: { ...$route.query, item: item.id, action: 'delete' } }" exact>
                    <v-icon small>mdi-delete</v-icon>
                </v-btn>

            </template>

            <template v-slot:footer="opt">
                <div class="v-data-footer py-2">

                    <div class="v-data-footer__select">
                        Rows per page:
                        <v-select
                            dense
                            hide-details
                            :items="[5, 10, 15]"
                            v-model="limit"
                        ></v-select>
                    </div>
                    <div class="v-data-footer__pagination">{{limit}} of many</div>

                    <div class="v-data-footer__icons-before">
                        <v-btn
                            depressed
                            icon
                            class="mr-2"
                            @click="prevPage()"
                            :disabled="hasAfter.length == 0"
                        >
                            <v-icon>mdi-chevron-left</v-icon>
                        </v-btn>
                    </div>
                    <div class="v-data-footer__icons-after">
                        <v-btn
                            depressed
                            icon
                            class="ml-2"
                            @click="nextPage()"
                            :disabled="hasBefore.length == 0"
                        >
                            <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                    </div>

                </div>
            </template>

        </v-data-table>

    </v-card>
</div>
</template>

<script>
export default {
    data() {
        return this.$data || {
            editItemLoading: false,
            item: null,
            editedItem: {
                title: '',
                content: '',
                author: {}
            },
            defaultItem: {
                title: '',
                content: '',
                author: {}
            },
            items: [],
            limit: 5,
            loading: true,
            headers: [{
                    text: 'Id',
                    sortable: false,
                    value: 'id'
                },
                {
                    text: 'Title',
                    align: 'start',
                    sortable: true,
                    value: 'title',
                },
                {
                    text: 'Content',
                    sortable: true,
                    value: 'content'
                },
                {
                    text: 'CreatedAt',
                    sortable: false,
                    value: 'createdAt'
                },
                {
                    text: 'UpdatedAt',
                    sortable: true,
                    value: 'updatedAt'
                },
                {
                    text: 'Author',
                    sortable: true,
                    value: 'author.displayName'
                },
                {
                    text: 'Actions',
                    value: 'actions',
                    sortable: false
                },
            ],
            startAfterDoc: null,
            endBeforeDoc: null,
            hasAfter: [],
            hasBefore: [],
            dialogError: false,
            members: [],
        }
    },
    computed: {

        membersList() {
            return this.members.filter(m => m.userRef instanceof Object).map(m => m.userRef)
        },

        query() {

            const {
                siteId,
                contentType,
            } = this.$route.params

            const {
                sortBy,
                sortDesc
            } = this.options

            let query = this.$firebase.firestore().collection(`sites/${siteId}/content/${contentType}/items`)
            let queryStr = `this.$firebase.firestore().collection('sites/${siteId}/content/${contentType}/items')`

            for (const [i, field] of sortBy.entries()) {
                query = query.orderBy(field, sortDesc[i] ? 'desc' : 'asc')
                queryStr += `.orderBy('${field}', '${sortDesc[i] ? 'desc' : 'asc'}')`
            }

            query = query.orderBy('createdAt', 'desc')
            queryStr += `.orderBy('createdAt', 'desc')`

            //console.log(queryStr)

            return query
        },

        options() {

            const {
                sortBy = [],
                    sortDesc = [],
            } = this.$route.query

            return {
                sortBy: typeof sortBy == 'string' ? [sortBy] : sortBy,
                // v-data-table sortDesc must be boolean not string 'true'
                sortDesc: typeof sortDesc == 'string' ? [sortDesc == 'true'] : sortDesc.map(v => v == 'true'),
            }
        }

    },
    db: {
        item: {
            ref() {
                const {
                    siteId,
                    contentType,
                } = this.$route.params

                const {
                    item = false,
                } = this.$route.query

                if (item) {
                    return this.$firebase.firestore().doc(`sites/${siteId}/content/${contentType}/items/${item}`)
                }
            },
            before() {
                this.editItemLoading = true
            },
            resolve(res) {
                this.editItemLoading = false
                this.editedItem = Object.assign({}, this.defaultItem, res || {})
            },
        },

        startAfterDoc() {

            const {
                siteId,
                contentType,
            } = this.$route.params

            const {
                startAfter = false,
            } = this.$route.query

            if (startAfter) {
                return this.$firebase.firestore().doc(`sites/${siteId}/content/${contentType}/items/${startAfter}`)
            }
        },

        endBeforeDoc() {

            const {
                siteId,
                contentType,
            } = this.$route.params

            const {
                endBefore = false,
            } = this.$route.query

            if (endBefore) {
                return this.$firebase.firestore().doc(`sites/${siteId}/content/${contentType}/items/${endBefore}`)
            }
        },

        hasAfter() {
            const item = this.items[0]
            const query = this.query

            if (item && !item.snapshot.metadata.hasPendingWrites) {
                return query.endBefore(item.snapshot).limitToLast(1)
            }
        },

        hasBefore() {
            const item = this.items[this.items.length - 1]
            const query = this.query

            if (item && !item.snapshot.metadata.hasPendingWrites) {
                return query.startAfter(item.snapshot).limit(1)
            }
        },

        items: {
            ref() {

                const {
                    startAfter = false,
                        endBefore = false
                } = this.$route.query

                const {
                    limit,
                    startAfterDoc,
                    endBeforeDoc
                } = this

                let query = this.query

                let queryStr = ''

                // Wait to load startAfter or endBefore Doc                
                if ((startAfter && !startAfterDoc) || (endBefore && !endBeforeDoc)) {
                    return
                }

                // https://stackoverflow.com/questions/54074135/how-to-paginate-to-previous-page-using-angularfire-firestore-and-firebase/58826997#58826997
                if (startAfterDoc) {

                    query = query.startAfter(startAfterDoc.snapshot).limit(limit)
                    queryStr += `.startAfter(doc).limit(${limit})`

                } else if (endBeforeDoc) {

                    query = query.endBefore(endBeforeDoc.snapshot).limitToLast(limit)
                    queryStr += `.endBefore( endBeforeDoc.snapshot ).limitToLast(${limit})`

                } else {
                    query = query.limit(limit)
                    queryStr += `.limit(${limit})`
                }

                //console.log(queryStr);

                return query

            },
            before() {
                this.loading = true
            },
            resolve(res) {
                this.loading = false
            },
            reset: false,
        },
        members: {
            ref() {
                const siteId = this.$route.params.siteId
                if (!siteId) return
                return this.$firebase.firestore().collection(`sites/${siteId}/members`)
            },
            wait: true,
        }
    },

    mounted() {

    },

    methods: {

        nextPage() {
            this.$router.push({
                query: {
                    ...this.$route.query,
                    startAfter: this.items[this.items.length - 1].id,
                    endBefore: undefined,
                }
            })
        },

        prevPage() {
            this.$router.push({
                query: {
                    ...this.$route.query,
                    endBefore: this.items[0].id,
                    startAfter: undefined,
                }
            })
        },

        onChangeOptions(opt) {

            const {
                sortBy,
                sortDesc
            } = this.options

            // Check if sort fields changed
            const sortByChanged = !(sortBy.every((val, index) => val === opt.sortBy[index]) && opt.sortBy.every((val, index) => val === sortBy[index]))
            const sortDescChanged = !(sortDesc.every((val, index) => val === opt.sortDesc[index]) && opt.sortDesc.every((val, index) => val === sortDesc[index]))

            if (sortByChanged || sortDescChanged) {

                this.$router.replace({
                    query: {
                        ...this.$route.query,
                        sortBy: opt.sortBy,
                        sortDesc: opt.sortDesc,
                        // Reset pagination on sort change
                        startAfter: undefined,
                        endBefore: undefined,
                    }
                }).catch(() => {})

            }

        },

        async close() {

            await this.$router.replace({
                query: {
                    ...this.$route.query,
                    item: undefined,
                    action: undefined,
                }
            })

            // Clear dialog form
            await this.$nextTick()
            this.editedItem = Object.assign({}, this.defaultItem)
            this.dialogError = false
        },

        async save() {

            this.editItemLoading = true
            this.dialogError = false

            const {
                title,
                content,
                author,
            } = this.editedItem

            const {
                params: {
                    siteId,
                    contentType,
                },
                query: {
                    item,
                    action
                }
            } = this.$route

            const batch = this.$firebase.firestore().batch()

            let itemRef = this.$firebase.firestore().collection(`sites/${siteId}/content/${contentType}/items`)

            const itemBody = {
                title,
                content
            }

            if (action == 'add') {
                itemRef = itemRef.doc()
                itemBody.createdAt = this.$firebase.firestore.FieldValue.serverTimestamp()
            } else {
                itemRef = itemRef.doc(item)
            }

            itemBody.updatedAt = this.$firebase.firestore.FieldValue.serverTimestamp()
            itemBody.author = this.$firebase.firestore().doc(`users/${author.id || this.$store.state.user.uid}`)

            batch.set(itemRef, itemBody, {
                merge: true
            })

            try {
                await batch.commit()

                this.close()

            } catch ({
                code,
                name,
                message
            }) {
                this.dialogError = message                
            }

            this.editItemLoading = false

        },

        async remove() {

            this.editItemLoading = true
            this.dialogError = false

            const {
                params: {
                    siteId,
                    contentType,
                },
                query: {
                    item
                }
            } = this.$route

            const batch = this.$firebase.firestore().batch()

            const itemRef = this.$firebase.firestore().doc(`sites/${siteId}/content/${contentType}/items/${item}`)

            batch.delete(itemRef)

            try {
                await batch.commit()
            } catch ({
                code,
                name,
                message
            }) {
                this.dialogError = message                
            }

            this.editItemLoading = false

            this.close()
        },

    },
    watch: {
        '$route.query.action': {
            handler(action) {},
            immediate: true
        }
    }
}
</script>
