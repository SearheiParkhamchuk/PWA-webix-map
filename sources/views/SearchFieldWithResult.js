import { JetView } from 'webix-jet'
import SearchField from './SearchField'
import SearchResultList from './SearchResultList'

export default class SearchFieldWithResult extends JetView {
  constructor(app, searchFieldOptions) {
    super(app)
    this._searchField = new SearchField(this.app, searchFieldOptions)
    this._searchResultList = new SearchResultList(this.app, {
      hidden: true,
      navigation: true,
      select: true,
    })
    this._searchPopup = null
  }

  get searchField() {
    return this._searchField
  }

  get searchResultList() {
    return this._searchResultList
  }

  get searchPopupView() {
    return this._searchPopup
  }

  get fieldView() {
    return this.searchField.fieldView
  }

  get resultListView() {
    return this.searchResultList.listView
  }

  config() {
    return this._searchField
  }

  showPopup(...args) {
    this._searchPopup.show(...args)
  }

  hidePopup() {
    this._searchPopup.hide()
  }

  getInputNode() {
    return this.fieldView.getInputNode()
  }

  getListItem(...args) {
    return this.resultListView.getItem(...args)
  }

  clearResultList() {
    this.resultListView.clearAll()
  }

  parseResultData(...args) {
    this.resultListView.parse(...args)
  }

  showProgress() {
    this.searchField.showProgress()
  }

  hideProgress() {
    this.searchField.hideProgress()
  }

  setFieldValue(...args) {
    this.searchField.setValue(...args)
  }

  init() {
    this._searchPopup = this.ui({
      view: 'popup',
      width: 300,
      body: this._searchResultList,
      autofocus: false,
      zIndex: 500,
    })
  }

  ready() {}
}
