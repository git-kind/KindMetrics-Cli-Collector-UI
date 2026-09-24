import { configure } from 'quasar/wrappers';

export default configure(() => ({
  boot: ['ui'],
  css: ['app.scss'],
  extras: ['material-icons'],
  build: {
    target: {
      browser: ['es2022', 'chrome120', 'firefox120', 'safari16'],
      node: 'node20',
    },
    vueRouterMode: 'history',
    typescript: {
      strict: true,
      vueShim: false,
    },
  },
  devServer: {
    open: false,
  },
  framework: {
    config: {},
    plugins: ['Notify'],
  },
}));
