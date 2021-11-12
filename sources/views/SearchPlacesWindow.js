import { JetView } from 'webix-jet'
import SearchCombo from './SearchCombo'
import { fetchPlaces } from './../api/fetchPlaces'

const handleComboTimedKeyPress = (comboView) => {
  const value = comboView.getValue()
  if (!value || !value.trim()) {
    comboView.getList().clearAll()
    comboView.hidePopup()
    return
  }
  comboView.showPopup()
  comboView.getList().define('minHeight', 40)
  comboView.getList().resize()
  comboView.showProgress()
  comboView.hideOverlay()

  fetchPlaces({ q: value })
    .then((result) => {
      comboView.parse(
        result.features.map((item) => ({
          id: item.properties.place_id,
          value: item.properties.display_name,
          position: { lat: item.bbox[1], lng: item.bbox[0] },
        })),
        'json',
        true
      )
      if (result.features.length === 0) {
        comboView.showPopup()
        comboView.showOverlay('No data found.')
      }
    })
    .finally(() => {
      comboView.hideProgress()
    })
}

export default class SearchPlacesWindow extends JetView {
  constructor(config) {
    super(config)
    this._searchComboStart = new SearchCombo(this.app, { placeholder: 'Start...' })
    this._searchComboFinish = new SearchCombo(this.app, { placeholder: 'Finish...' })
  }

  get searchComboStart() {
    return this._searchComboStart
  }
  get searchComboFinish() {
    return this._searchComboFinish
  }

  show() {
    this.getRoot().show()
  }

  config() {
    return {
      view: 'window',
      id: 'searchWindow',
      escHide: false,
      width: 380,
      zIndex: 500,
      head: false,
      top: 10,
      left: 10,
      body: {
        rows: [this._searchComboStart, this._searchComboFinish],
      },
    }
  }

  setStartPointValue(value) {
    this._searchComboStart.setValue(value)
  }

  setFinishPointValue(value) {
    this._searchComboFinish.setValue(value)
  }

  #attachEvents() {
    this.on(this._searchComboStart.getRoot(), 'onTimedKeyPress', () => {
      handleComboTimedKeyPress(this._searchComboStart)
    })

    this.on(this._searchComboFinish.getRoot(), 'onTimedKeyPress', () => {
      handleComboTimedKeyPress(this._searchComboFinish)
    })
  }

  ready() {
    this.#attachEvents()
  }
}
