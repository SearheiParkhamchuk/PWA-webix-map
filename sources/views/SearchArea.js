import { JetView } from 'webix-jet'
import { fetchPlaces } from '../api/fetchPlaces'
import SearchFieldWithResult from './SearchFieldWithResult'

export default class SearchArea extends JetView {
  constructor(app, options = {}) {
    super(app)
    this.options = options

    this._searchFieldStart = new SearchFieldWithResult(this.app, { placeholder: 'Start...' })
    this._searchFieldFinish = new SearchFieldWithResult(this.app, { placeholder: 'Finish...' })
  }

  get searchFieldStart() {
    return this._searchFieldStart
  }
  get searchFieldFinish() {
    return this._searchFieldFinish
  }

  config() {
    return {
      rows: [this.searchFieldStart, this.searchFieldFinish],
    }
  }

  #attachEvents() {
    const handleInputChange = async (value, searchField) => {
      if (!value || !value.trim()) {
        searchField.hidePopup()
        searchField.clearResultList()
        return
      }
      try {
        searchField.showProgress()
        const result = await fetchPlaces({ q: value })
        searchField.parseResultData(result, 'json', true)
        searchField.showPopup(searchField.searchField.fieldView.$view)
      } catch (error) {
        this.webix.message({ text: error.message, type: 'error' })
      } finally {
        searchField.hideProgress()
      }
    }

    this.on(this.searchFieldStart.resultListView, 'onItemClick', (id) => {
      const { position, value } = this.searchFieldStart.getListItem(id)
      this.app.callEvent('onStartPointChanged', [{ position }, { zoom: true }])
      this.searchFieldStart.hidePopup()
      this.searchFieldStart.setFieldValue(value)
    })

    this.on(this.searchFieldFinish.resultListView, 'onItemClick', (id) => {
      const { position, value } = this.searchFieldFinish.getListItem(id)
      this.app.callEvent('onEndPointChanged', [{ position }, { zoom: true }])
      this.searchFieldFinish.hidePopup()
      this.searchFieldFinish.setFieldValue(value)
    })

    this.on(this.searchFieldStart.fieldView, 'onTimedInputChange', (event) => {
      handleInputChange(event.target.value, this.searchFieldStart)
    })

    this.on(this.searchFieldFinish.fieldView, 'onTimedInputChange', async (event) => {
      handleInputChange(event.target.value, this.searchFieldFinish)
    })
  }

  ready() {
    this.#attachEvents()
  }
}
