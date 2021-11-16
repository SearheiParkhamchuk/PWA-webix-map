import { JetView } from 'webix-jet'

export default class SearchField extends JetView {
  constructor(app, options = {}) {
    super(app)
    this.options = options
    this.events = {}
  }

  config() {
    return {
      cols: [
        {
          view: 'text',
          placeholder: this.options.placeholder,
          localId: 'searchField',
        },
        {
          view: 'icon',
          localId: 'searchIcon',
          icon: 'wxi-search',
        },
      ],
    }
  }

  get fieldView() {
    return this.$$('searchField')
  }

  get iconView() {
    return this.$$('searchIcon')
  }

  showProgress() {
    this.iconView.define('icon', 'wxi-sync rotate')
    this.iconView.refresh()
  }

  hideProgress() {
    this.iconView.define('icon', 'wxi-search')
    this.iconView.refresh()
  }

  getValue() {
    return this.fieldView.getValue()
  }

  setValue(...args) {
    this.fieldView.setValue(...args)
  }

  #attachEvents() {
    let timeoutId = null

    const handleTimedInputChange = (event) => {
      const value = event.target.value
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        this.fieldView.callEvent('onTimedInputChange', [{ target: { value } }])
      }, 1000)
    }

    this.fieldView.getInputNode().addEventListener('input', handleTimedInputChange)

    this.events['onTimedInputChange'] = [handleTimedInputChange]
  }

  ready() {
    this.#attachEvents()
  }

  destroy() {
    Object.entries(this.events).forEach(([eventName, eventHandler]) =>
      this.fieldView.getInputNode().removeEventListener(eventName, eventHandler)
    )
  }
}
