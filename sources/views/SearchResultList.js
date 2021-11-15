import { JetView } from 'webix-jet'

export default class SearchResultList extends JetView {
  constructor(app, options = {}) {
    super(app)
    this.options = options
  }
  config() {
    return {
      ...this.options,
      view: 'list',
      autoheight: true,
      maxHeight: 300,
      css: 'search_result_list_container',
      data: [],
    }
  }

  showProgress() {
    this.getRoot().showProgress()
  }

  hideProgress() {
    this.getRoot().hideProgress()
  }

  showOverlay(...args) {
    this.getRoot().showOverlay(...args)
  }

  hideOverlay() {
    this.getRoot().hideOverlay()
  }

  parse(...args) {
    this.getRoot().parse(...args)
  }

  getItem(id) {
    return this.getRoot().getItem(id)
  }

  init(view) {
    window.webix.extend(view, window.webix.ProgressBar)
    window.webix.extend(view, window.webix.OverlayBox)
  }
}
