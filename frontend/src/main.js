import { createApp } from 'vue'
import App from './App.vue'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

// 配置后端请求地址
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8000/api'

const app = createApp(App)
app.use(Antd)
app.mount('#app')
