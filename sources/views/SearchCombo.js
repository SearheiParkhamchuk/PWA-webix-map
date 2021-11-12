import { JetView } from 'webix-jet'

export default class SearchCombo extends JetView {
  constructor(app, options = {}) {
    super(app)
    this.options = options
  }

  config() {
    return {
      view: 'search',
      placeholder: this.options.placeholder,
      localId: 'searchCombo',
      suggest: {
        view: 'suggest',
        data: [],
      },
    }
  }

  showProgress() {
    this.getList().showProgress()
  }

  hideProgress() {
    this.getList().hideProgress()
  }

  showOverlay(...args) {
    this.getList().showOverlay(...args)
  }

  hideOverlay() {
    this.getList().hideOverlay()
  }

  getList() {
    return window.$$(this.getRoot().config.suggest).getList()
  }

  getPopup() {
    return window.$$(this.getRoot().config.suggest)
  }

  showPopup() {
    this.getPopup().show(this.getRoot().$view)
    this.getPopup().define('width', this.getRoot().$width)
    this.getPopup().resize()
  }

  hidePopup() {
    this.getPopup().hide()
  }

  getValue() {
    return this.getRoot().getValue()
  }

  setValue(...args) {
    this.getRoot().setValue(...args)
  }

  parse(...args) {
    this.getList().parse(...args)
  }

  getItem(id) {
    return this.getList().getItem(id)
  }

  #attachEvents() {
    this.on(this.getRoot(), 'onItemClick', () => {
      if (!this.getValue().trim()) return
      this.showPopup(this.getRoot())
    })
  }

  init() {
    this.#attachEvents()
    window.webix.extend(this.getList(), window.webix.ProgressBar)
    window.webix.extend(this.getList(), window.webix.OverlayBox)
  }
}
