<template>
<div>
    <h1 class="text--primary">{{ $route.params.contentType.toUpperCase() }} List <span class="text-caption">sites/_siteId/content/_contentType/index.vue</span></h1>

    <v-tabs>
        <v-tab>Item One</v-tab>
        <v-tab>Item Two</v-tab>
        <v-tab>Item Three</v-tab>
    </v-tabs>

    <v-divider></v-divider>

    <v-card class="mt-12">

        <v-toolbar flat>
            <v-toolbar-title>My CRUD</v-toolbar-title>

            <v-divider class="mx-4" inset vertical></v-divider>

            <v-spacer></v-spacer>

            <v-btn
                color="primary"
                dark
                class="mb-2"
                @click="addItem"
            >New Item</v-btn>

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
                            @click="save"
                            v-if="['add', 'edit'].includes($route.query.action)"
                        >{{$route.query.action == 'edit' ? 'Save' : 'Add'}}</v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card :loading="editItemLoading" :disabled="editItemLoading">

                    <template>

                        <v-card-title>
                            <span class="headline" v-if="$route.query.action == 'add'">Add item</span>
                            <span class="headline" v-if="$route.query.action == 'edit'">Edit item</span>
                            <span class="headline" v-if="$route.query.action == 'delete'">Are you sure you want to delete this item?</span>
                        </v-card-title>

                        <v-card-text v-if="$route.query.action == 'add' || $route.query.action == 'edit'">
                            <v-container class="px-0">
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field v-model="editedItem.title" label="Title"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="editedItem.content" label="Content"></v-textarea>
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
                                @click="save"
                                v-if="$route.query.action == 'add'"
                            >Add</v-btn>
                            <v-btn
                                color="primary"
                                text
                                @click="save"
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
                <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
            </template>

            <template v-slot:footer="opt">
                <div class="v-data-footer py-2">

                    <div class="v-data-footer__pagination">1-10 of many</div>
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
            },
            defaultItem: {
                title: '',
                content: '',
            },
            items: [],
            limit: 3,
            loading: true,
            headers: [{
                    text: 'Title',
                    align: 'start',
                    sortable: true,
                    value: 'title',
                },
                {
                    text: 'Id',
                    sortable: false,
                    value: 'id'
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
                    text: 'Actions',
                    value: 'actions',
                    sortable: false
                },
            ],
            startAfterDoc: null,
            endBeforeDoc: null,
            hasAfter: [],
            hasBefore: [],

        }
    },
    computed: {

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
                    queryStr += `.startAfter(doc).limit(limit)`

                } else if (endBeforeDoc) {

                    query = query.endBefore(endBeforeDoc.snapshot).limitToLast(limit)
                    queryStr += `.endBefore( endBeforeDoc.snapshot ).limitToLast(limit)`

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

        addItem() {

            this.$router.push({
                query: {
                    ...this.$route.query,
                    item: undefined,
                    action: 'add'
                }
            })

        },

        editItem(item) {

            this.$router.push({
                query: {
                    ...this.$route.query,
                    item: item.id,
                    action: 'edit',
                }
            })

        },

        deleteItem(item) {

            this.$router.push({
                query: {
                    ...this.$route.query,
                    item: item.id,
                    action: 'delete',
                }
            })

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

        },

        async save() {

            this.editItemLoading = true

            const {
                title,
                content
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

            const userUID = this.$store.state.user.uid

            const batch = this.$firebase.firestore().batch()

            let itemRef = this.$firebase.firestore().collection(`sites/${siteId}/content/${contentType}/items`)

            const itemBody = {
                title,
                content
            }

            if (action == 'add') {
                itemRef = itemRef.doc()
                itemBody.createdAt = this.$firebase.firestore.FieldValue.serverTimestamp()
                itemBody.author = this.$firebase.firestore().doc(`users/${userUID}`)
            } else {
                itemRef = itemRef.doc(item)
            }

            itemBody.updatedAt = this.$firebase.firestore.FieldValue.serverTimestamp()

            batch.set(itemRef, itemBody, {
                merge: true
            })

            try {
                await batch.commit()
            } catch ({
                code,
                name,
                message
            }) {
                console.error(message);
            }

            this.editItemLoading = false

            this.close()
        },

        async remove() {

            this.editItemLoading = true

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
                console.error(message);
            }

            this.editItemLoading = false

            this.close()
        },

    },
    watch: {}
}
</script>
