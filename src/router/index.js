import Vue from 'vue'
import Router from 'vue-router'
import Details from '@/components/details'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/details'
    },
    {
      path: '/details',
      name: 'Details',
      component: Details
    }
  ]
})
