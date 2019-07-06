// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

// 引入axios
import axios from 'axios'

// 引入qs
import qs from 'qs'

/* mint-ui */
import 'mint-ui/lib/style.css'
// import Mint from 'mint-ui'
import { Header, DatetimePicker, Loadmore, Toast, Indicator } from 'mint-ui'

// 引入公共样式
import '@/assets/css/base.css'

// 注册axios
axios.defaults.baseURL = 'http://szydak.eicp.net:82'
// axios.defaults.baseURL = 'http://www.allsps.com'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
// axios.defaults.timeout = 5000
Vue.prototype.$axios = axios

// 注册qs
Vue.prototype.$qs = qs

/* 注册Mint-ui */
// Vue.use(Mint)
Vue.component(Header.name, Header)
Vue.component(DatetimePicker.name, DatetimePicker)
Vue.component(Loadmore.name, Loadmore)
Vue.prototype.$Toast = Toast
Vue.prototype.$Indicator = Indicator
// Vue.component(Indicator.name, Indicator)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
