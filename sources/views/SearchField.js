import { JetView } from 'webix-jet'

export default class SearchField extends JetView {
  constructor(app, options = {}) {
    super(app)
    this.options = options
  }

  config() {
    return {
      cols: [
        {
          view: 'text',
          placeholder: this.options.placeholder,
          localId: 'searchCombo',
        },
        {
          view: 'icon',
          localId: 'searchIcon',
          icon: 'wxi-search',
        },
      ],
    }
  }

  get searchField() {
    return this.$$('searchCombo')
  }

  get icon() {
    return this.$$('searchIcon')
  }

  showProgress() {
    this.icon.define('icon', 'wxi-sync rotate')
    this.icon.refresh()
  }

  hideProgress() {
    this.icon.define('icon', 'wxi-search')
    this.icon.refresh()
  }

  getValue() {
    return this.searchField.getValue()
  }

  setValue(...args) {
    this.searchField.setValue(...args)
  }
}
