import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - flameless',
    title: 'flameless',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/firebase.js', mode: 'client' }, // only on client side
    { src: '~/plugins/router-sync.js', mode: 'client' }, // only on client side
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    theme: {
      dark: false,      
      themes: {
        light: {
          primary: colors.deepOrange.base,
          secondary: colors.amber.base,
          accent: colors.orange.base,
          error: colors.red.base,
          warning: colors.yellow.base,
          info: colors.cyan.base,
          success: colors.lightGreen.base
        },
        dark: {
          primary: colors.deepOrange.darken2,
          accent: colors.amber.darken3,
          secondary: colors.orange.darken3,
          info: colors.red.lighten1,
          warning: colors.yellow.base,
          error: colors.cyan.accent4,
          success: colors.lightGreen.accent3
        }

        /*        
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
        */
      },
    },
    breakpoint: {
      mobileBreakpoint: 'sm' // This is equivalent to a value of 960
    }    
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
