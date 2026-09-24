import { createApp } from 'vue';
import { Quasar } from 'quasar';
import { i18n } from './i18n';
import { createRouter } from './router';

import 'quasar/src/css/index.sass';
import './css/app.scss';

import App from './App.vue';

const app = createApp(App);

app.use(Quasar, { plugins: {} });
app.use(i18n);
app.use(createRouter());
app.mount('#q-app');
