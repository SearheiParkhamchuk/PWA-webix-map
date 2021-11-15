import { JetView } from 'webix-jet'
import { fetchPlaces } from '../api/fetchPlaces'
import SearchField from './SearchField'
import SearchResultList from './SearchResultList'

export default class SearchArea extends JetView {
  constructor(app, options = {}) {
    super(app)
    this.options = options

    this._searchFieldStart = new SearchField(this.app, { placeholder: 'Start...' })
    this._searchFieldFinish = new SearchField(this.app, { placeholder: 'Finish...' })
    this._searchResultList = new SearchResultList(this.app, {
      hidden: true,
      navigation: true,
      select: true,
    })
    this._searchPopup = null
  }

  get searchFieldStart() {
    return this._searchFieldStart
  }
  get searchFieldFinish() {
    return this._searchFieldFinish
  }
  get searchResultList() {
    return this._searchResultList
  }
  get searchPopup() {
    return this._searchPopup
  }

  config() {
    return {
      rows: [this.searchFieldStart, this.searchFieldFinish],
    }
  }

  #attachEvents() {
    const handleTimedKeyPress = async (value) => {
      if (!value || !value.trim()) {
        this.searchPopup.hide()
        this.searchResultList.getRoot().clearAll()
        return
      }
      const result = await fetchPlaces({ q: value })
      this.searchResultList.getRoot().parse(result, 'json', true)
      this.searchPopup.show(this.searchFieldFinish.getRoot().$view)
    }

    this.on(this.searchFieldStart.searchField, 'onTimedKeyPress', async () => {
      this.searchFieldStart.showProgress()
      await handleTimedKeyPress(this.searchFieldStart.getValue())
      this.searchFieldStart.hideProgress()
    })

    this.on(this.searchFieldFinish.searchField, 'onTimedKeyPress', async () => {
      this.searchFieldFinish.showProgress()
      await handleTimedKeyPress(this.searchFieldFinish.getValue())
      this.searchFieldFinish.hideProgress()
    })

    this.on(this.searchResultList.getRoot(), 'onItemClick', (id) => {
      const { position } = this.searchResultList.getRoot().getItem(id)
      this.app.callEvent('onStartPointChanged', [{ position }, { zoom: true }])
      this.searchPopup.hide()
    })
  }

  init() {
    this._searchPopup = this.ui({
      view: 'popup',
      width: 300,
      body: this.searchResultList,
      autofocus: false,
      zIndex: 500,
    })
  }

  ready() {
    this.#attachEvents()
  }
}
