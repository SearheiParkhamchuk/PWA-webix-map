import './styles/app.css'
import { JetApp, EmptyRouter, HashRouter } from 'webix-jet'

export default class PWAWebixMap extends JetApp {
  constructor(config) {
    const defaults = {
      id: APPNAME,
      version: VERSION,
      router: BUILD_AS_MODULE ? EmptyRouter : HashRouter,
      debug: !PRODUCTION,
      start: '/top',
    }

    super({ ...defaults, ...config })
  }
}

if (!BUILD_AS_MODULE) {
  webix.ready(() => new PWAWebixMap().render())
}
