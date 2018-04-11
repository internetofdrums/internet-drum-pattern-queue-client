import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'
import PatternMaker from './components/PatternMaker'
import Queue from './components/Queue'

import './favicon/android-chrome-192x192.png'
import './favicon/android-chrome-512x512.png'
import './favicon/apple-touch-icon.png'
import './favicon/browserconfig.xml'
import './favicon/favicon.ico'
import './favicon/favicon-16x16.png'
import './favicon/favicon-32x32.png'
import './favicon/mstile-70x70.png'
import './favicon/mstile-144x144.png'
import './favicon/mstile-150x150.png'
import './favicon/mstile-310x150.png'
import './favicon/mstile-310x310.png'
import './favicon/safari-pinned-tab.svg'
import './favicon/site.webmanifest'

const routes = [
  {
    path: '/',
    component: PatternMaker
  },
  {
    path: '/queue',
    component: Queue
  }
]

const router = new VueRouter({
  routes
})

Vue.use(VueRouter)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router: router
})
