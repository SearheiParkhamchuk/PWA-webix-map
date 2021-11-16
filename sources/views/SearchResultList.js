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

  get listView() {
    return this.getRoot()
  }

  parse(...args) {
    this.getRoot().parse(...args)
  }

  getItem(id) {
    return this.getRoot().getItem(id)
  }
}
