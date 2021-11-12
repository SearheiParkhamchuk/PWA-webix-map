import { JetView } from 'webix-jet'
import { fetchPlaceByLatLng } from '../api/fetchPlaceByLatLng'
import { formatSeconds } from '../helpers/format-seconds'
import SearchPlacesWindow from './SearchPlacesWindow'

const POINTS = {
  start: 'start',
  finish: 'finish',
}

const CONTEXT_MENU = {
  [POINTS.start]: { id: POINTS.start, title: 'Start' },
  [POINTS.finish]: { id: POINTS.finish, title: 'End' },
}

const ContextMenuView = {
  view: 'contextmenu',
  localid: 'ContextMenu',
  data: Object.values(CONTEXT_MENU),
  template: (item) => item.title,
}

const createInstructionsView = ({ instructions }) => [
  {
    view: 'list',
    template: (obj) => `<div style="display:flex; justify-content: space-between">
                          <span>${obj.text}</span>
                          <span>${obj.distance}m</span>
                        </div>`,
    data: instructions,
    autoheight: true,
  },
]
export default class TopView extends JetView {
  constructor(config) {
    super(config)
    this.RoutingControl = null
    this.openMap = null
    this.contextMenuView = null
    this.coords = new Map()
  }

  config() {
    return {
      cols: [
        {
          view: 'scrollview',
          localId: 'leftSidebarView',
          hidden: true,
          body: {
            rows: [
              { view: 'spacer', height: 90 },
              { maxWidth: 400, localId: 'instructionsView', rows: [] },
            ],
          },
        },
        {
          view: 'open-map',
          localId: 'map',
          zoom: 15,
          center: [53.9006, 27.559],
        },
      ],
    }
  }

  #initRoutingControl() {
    this.RoutingControl = window.L.Routing.control({
      waypoints: [],
      autoRoute: true,
      show: false,
      showAlternatives: true,
    })
  }

  async #registerServiceWorker() {
    try {
      await navigator.serviceWorker.register('./serviceWorker.js')
    } catch (e) {
      console.error(e)
    }
  }

  #setWaypoints([lng, lat], key) {
    const position = { lat, lng }
    const waypoints = [...this.RoutingControl.getWaypoints()]
    if (key === POINTS.start) waypoints[0] = position
    if (key === POINTS.finish) waypoints[waypoints.length - 1] = position
    this.RoutingControl.setWaypoints(waypoints)
  }

  #attachAppEvents() {
    const zoomAfterPointChanged = ({ zoom, position }) => {
      const waypoints = this.RoutingControl.getWaypoints().filter((waypoint) => !!waypoint.latLng)
      if (zoom && waypoints.length === 1) {
        this.openMap.panTo(position)
        this.openMap.setZoom(13)
      } else if (waypoints.length > 1) {
        const bounds = waypoints.map((waypoint) => [waypoint.latLng.lng, waypoint.latLng.lat])
        this.openMap.panInsideBounds(bounds)
      }
    }

    this.on(this.app, 'onStartPointChanged', ({ position }, options = {}) => {
      this.setParam(POINTS.start, `${position.lng},${position.lat}`, true)
      this.#setWaypoints([position.lng, position.lat], POINTS.start)
      zoomAfterPointChanged({ zoom: options.zoom, position })
    })

    this.on(this.app, 'onEndPointChanged', ({ position }, options = {}) => {
      this.setParam(POINTS.finish, `${position.lng},${position.lat}`, true)
      this.#setWaypoints([position.lng, position.lat], POINTS.finish)
      zoomAfterPointChanged({ zoom: options.zoom, position })
    })

    this.on(this.contextMenuView, 'onItemClick', (id) => {
      const eventParams = [
        {
          position: Object.fromEntries(this.coords),
          title: CONTEXT_MENU[id].title,
        },
      ]
      switch (id) {
        case POINTS.start:
          this.app.callEvent('onStartPointChanged', eventParams)
          // this.searchWindow.setStartPointValue('olo')
          break
        case POINTS.finish:
          this.app.callEvent('onEndPointChanged', eventParams)
          // this.searchWindow.setFinishPointValue('olo')
          break
        default:
          throw new Error(`Invalid context menu id: ${id}`)
      }
    })
  }

  #attachSearchWindowEvents() {
    this.on(this.searchWindow.searchComboStart.getList(), 'onItemClick', (id) => {
      const { position } = this.searchWindow.searchComboStart.getItem(id)
      this.app.callEvent('onStartPointChanged', [{ position }, { zoom: true }])
    })
    this.on(this.searchWindow.searchComboFinish.getList(), 'onItemClick', (id) => {
      const { position } = this.searchWindow.searchComboFinish.getItem(id)
      this.app.callEvent('onEndPointChanged', [{ position }, { zoom: true }])
    })
  }

  #attachMapEvents() {
    this.openMap.on('contextmenu', (event) => {
      this.contextMenuView.define('top', event.originalEvent.y)
      this.contextMenuView.define('left', event.originalEvent.x)
      this.contextMenuView.define('zIndex', 400)
      this.contextMenuView.show()
      this.coords.set('lat', event.latlng.lat)
      this.coords.set('lng', event.latlng.lng)
    })
  }

  #attachRoutingControlEvents() {
    this.RoutingControl.addEventListener('routesfound', (event) => {
      console.log(event)
      if (event.routes.length === 0) return

      const instructionsView = this.$$('instructionsView')
      const leftSidebarView = this.$$('leftSidebarView')
      instructionsView
        .getChildViews()
        .forEach((view) => instructionsView.removeView(view.config.id))
      leftSidebarView.show()

      const rows = event.routes.map((route) => {
        const { totalDistance, totalTime } = route.summary
        const { hours, minutes, seconds } = formatSeconds(totalTime)
        const totalDistanceKm = Math.round((totalDistance / 1000) * 100) / 100
        const subTitle = `${totalDistanceKm} km, ${hours} h ${minutes} min ${seconds} sec`
        const instructionUi = createInstructionsView({ instructions: route.instructions })

        return {
          view: 'accordionitem',
          header: `<div style='line-height:initial;display:flex;flex-direction:column;'>
                    <h4 style='margin: 0'>${route.name}</div>
                    <h6 style='margin: 0'>${subTitle}</div>
                  </div>`,
          headerHeight: 50,
          headerAltHeight: 50,
          body: { rows: instructionUi },
        }
      })

      instructionsView.addView({ view: 'accordion', rows, multi: true })
    })

    this.RoutingControl.addEventListener('routingerror', (error) => {
      try {
        const response = JSON.parse(error.error.target.response)
        throw new Error(response.message)
      } catch (error) {
        this.webix.message({ text: error.message, type: 'error' })
        this.openMap.panTo(this.RoutingControl.getWaypoints()[0].latLng)
      }
    })

    this.RoutingControl.addEventListener('waypointschanged', async (data) => {
      // console.log(data)
      // const promises = data.waypoints
      //   .filter((waypoint) => waypoint.latLng)
      //   .map((waypoint) => {
      //     return fetchPlaceByLatLng({ lng: 27.559, lat: 53.9006 })
      //   })
      // const result = await Promise.all(promises)
      // console.log(result)
    })
  }

  async init() {
    this.contextMenuView = this.ui(ContextMenuView)
    this.searchWindow = this.ui(SearchPlacesWindow)
    this.openMap = await this.$$('map').getMap('wait')
    this.openMap.zoomControl.setPosition('topright')

    webix.require(
      ['https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js'],
      () => {
        this.#initRoutingControl()
        this.#attachRoutingControlEvents()
        this.RoutingControl.addTo(this.openMap)
        this.RoutingControl.setWaypoints([])

        const startUrlCoords = this.getParam(POINTS.start)
        const finishUrlCoords = this.getParam(POINTS.finish)
        if (startUrlCoords) this.#setWaypoints(startUrlCoords.split(','), POINTS.start)
        if (finishUrlCoords) this.#setWaypoints(finishUrlCoords.split(','), POINTS.finish)
      }
    )

    this.searchWindow.show()
    this.#attachSearchWindowEvents()
    this.#registerServiceWorker()
    this.#attachMapEvents()
    this.#attachAppEvents()
  }
}
