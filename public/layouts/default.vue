<template>
<v-app>

    <v-app-bar
        elevate-on-scroll
        short
        app
    >

        <v-app-bar-nav-icon
            v-if="$vuetify.breakpoint.mobile"
            @click.stop="drawer = !drawer"
        >
            <v-icon>mdi-menu</v-icon>
        </v-app-bar-nav-icon>

        <v-toolbar-title v-text="site ? site.title : 'Site List'" />

        <v-spacer />

    </v-app-bar>

    <v-navigation-drawer
        :permanent="!$vuetify.breakpoint.mobile"
        v-model="drawer"
        dark
        app
        v-if="$route.name != 'sites'"
    >

        <!-- Header -->
        <v-list-item
            :to="{name: 'sites'}"
            exact            
        >

            <v-list-item-icon>
                <v-icon color="primary">mdi-fire</v-icon>
            </v-list-item-icon>

            <v-list-item-title class="title">Flameless</v-list-item-title>

        </v-list-item>

        <v-divider></v-divider>

        <v-list subheader dense>
        <!-- Menu Level 0 -->
        <template v-for="level0 in menu">
            <v-list-item
                v-if="level0.type == 'item'"
                :key="level0.id"
                :to="level0.to"
                active-class="primary--text"
                exact               
            >
                <v-list-item-icon>
                    <v-icon v-text="level0.icon"></v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title v-text="level0.title"></v-list-item-title>
                </v-list-item-content>

            </v-list-item>

            <v-list-group
                v-if="level0.type == 'group'"
                :key="level0.id"
                :value="true"
                :prepend-icon="level0.icon"
                no-action
            >

                <template v-slot:activator>                    
                    <v-list-item-content>
                        <v-list-item-title v-text="level0.title"></v-list-item-title>
                    </v-list-item-content>
                </template>

                <!-- Menu Level 1 -->
                <template v-for="level1 in level0.items">
                    <v-list-item
                        v-if="level1.type == 'item'"
                        :key="level1.id"
                        :to="level1.to"
                        active-class="primary--text"
                        exact                          
                    >

                        <v-list-item-content>
                            <v-list-item-title v-text="level1.title"></v-list-item-title>
                        </v-list-item-content>

                        <v-list-item-icon>
                            <v-icon v-text="level1.icon"></v-icon>
                        </v-list-item-icon>

                    </v-list-item>

                    <v-list-group
                        v-if="level1.type == 'group'"
                        :key="level1.id"
                        :value="true"
                        sub-group
                        no-action
                        
                    >

                        <template v-slot:activator>
                            <v-list-item-content>
                                <v-list-item-title v-text="level1.title"></v-list-item-title>
                            </v-list-item-content>
                        </template>

                        <!-- Menu Level 2 -->
                        <v-list-item
                            v-for="level2 in level1.items"
                            :key="level2.id"
                            :to="level2.to"
                            active-class="primary--text"
                                                          
                        >

                            <v-list-item-content>
                                <v-list-item-title v-text="level2.title"></v-list-item-title>
                            </v-list-item-content>

                            <v-list-item-icon>
                                <v-icon v-text="level2.icon"></v-icon>
                            </v-list-item-icon>

                        </v-list-item>

                    </v-list-group>

                </template>

            </v-list-group>

        </template>
        </v-list>
    </v-navigation-drawer>

    <v-main>
        <v-container>
            <nuxt />
        </v-container>
    </v-main>

</v-app>
</template>

<script>
export default {
    data() {
        return {
            drawer: false,
            miniVariant: false,
            title: 'Flameless',
            content: [],
            user: null,
            site: null,            
        }
    },
    db: {
        site() {  
            const siteId = this.$route.params.siteId            
            if (!siteId) return
            return this.$firebase.firestore().doc(`sites/${siteId}`)
        },        
        user() {  
            const siteId = this.$route.params.siteId
            const userUID = this.$store.state.user.uid
            if (!userUID || !siteId) return
            //console.log(`sites/${siteId}/users`);
            return this.$firebase.firestore().collection(`sites/${siteId}/users`).doc(userUID)
        },
        content() {            
            const siteId = this.$route.params.siteId
            const {
                role
            } = this.user || {}
            if (!role || !siteId) return

            return this.$firebase.firestore().collection(`sites/${siteId}/content`).where(`roles.${role}.capabilities.read`, '==', true)
        }
    },
    watch: {
    },
    computed: {
        menu() {
         
            const siteId = this.$route.params.siteId

            return [{
                    type: 'item',
                    id: 'welcome',
                    title: 'Welcome',
                    icon: 'mdi-human-greeting',
                    to: {                        
                        name: 'sites-siteId',
                        params: {
                            siteId
                        }
                    }
                },
                {
                    type: 'group',
                    id: 'content',
                    title: 'Content',
                    icon: 'mdi-folder',
                    items: [{
                            type: 'item',
                            id: 'new',
                            title: 'Add new',
                            icon: 'mdi-plus',
                            to: {                        
                                name: 'sites-siteId-content',
                                params: {
                                    siteId,
                                }
                            }
                        },
                        ...this.content.map(c => ({
                            type: 'group',
                            id: c.id,
                            title: c.title,
                            items: [{
                                type: 'item',
                                id: 'dashboard',
                                title: c.title,
                                icon: c.icon,
                                to: {                        
                                    name: 'sites-siteId-content-contentType-items',
                                    params: {
                                        siteId,
                                        contentType: c.id
                                    }
                                }
                            },{
                                type: 'item',
                                id: 'comments',
                                title: 'Comments',
                                icon: 'mdi-message',
                                to: {                        
                                    name: 'sites-siteId-content-contentType-comments',
                                    params: {
                                        siteId,
                                        contentType: c.id
                                    }
                                }
                            },{
                                type: 'item',
                                id: 'categories',
                                title: 'Categories',
                                icon: 'mdi-shape',
                                to: {                        
                                    name: 'sites-siteId-content-contentType-categories',
                                    params: {
                                        siteId,
                                        contentType: c.id
                                    }
                                }
                            }
                            /*,{
                                type: 'item',
                                id: 'settings',
                                title: 'Settings',
                                icon: 'mdi-cog',
                                to: {                        
                                    name: 'sites-siteId-content-contentType-settings',
                                    params: {
                                        siteId,
                                        contentType: c.id
                                    }
                                }
                            }*/]
                        }))
                    ]
                },
                {
                    type: 'group',
                    id: 'administration',
                    title: 'Administration',
                    icon: 'mdi-tune',
                    items: [{
                        type: 'item',
                        id: 'general',
                        title: 'General',
                        icon: 'mdi-cog',
                        to: {
                            name: 'sites-siteId-administration',
                            params: {
                                siteId,
                            }
                        }
                    },{
                        type: 'item',
                        id: 'users',
                        title: 'Users',
                        icon: 'mdi-account-multiple',
                        to: {
                            name: 'sites'
                        }
                    },{
                        type: 'item',
                        id: 'permissions',
                        title: 'Permissions',
                        icon: 'mdi-lock',
                        to: {
                            name: 'sites-siteId-administration-permissions',
                            params: {
                                siteId,
                            }
                        }
                    }]
                },                
                
            ]
        }
    }
}
</script>

<style lang="scss">
.v-list-item--active .v-icon {
    //color: inherit;
}

.firebase-emulator-warning {
    display: none;
}

/*
html { 
  overflow-y: auto
}
*/
</style>
