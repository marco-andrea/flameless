<template>
<div>
    <v-toolbar rounded elevation="1">
        <v-toolbar-title>General</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="save" :loading="loading">Save</v-btn>
    </v-toolbar>

    <v-card class="mt-5" :loading="loading">
        <v-container fluid>
            <v-row>
                <v-col cols="12">
                    <v-text-field label="Site title" v-model="edit.title"></v-text-field>
                </v-col>
            </v-row>
        </v-container>
    </v-card>

</div>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            site: null,
            edit: {
                title: ''
            },
        }
    },
    db: {
        site: {
            ref() {
                const {
                    siteId,
                } = this.$route.params

                if (!siteId) return

                return this.$firebase.firestore().doc(`sites/${siteId}`)
            },
            resolve(res) {
            }
        }
    },
    methods: {
        async save() {

            this.loading = true            

            const {
                title
            } = this.edit

            const {
                siteId,
            } = this.$route.params

            const batch = this.$firebase.firestore().batch()

            const itemRef = this.$firebase.firestore().doc(`sites/${siteId}`)

            const itemBody = {
                title
            }

            batch.set(itemRef, itemBody, {
                merge: true
            })

            try {
                await batch.commit()               
            } catch ({
                message
            }) {
                console.error(message);
            }

            this.loading = false

        },
    },
    watch: {
        site(val) {
            this.edit = Object.assign({}, val)
        }
    }
}
</script>
