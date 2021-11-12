const encodeQueryData = (options) => {
  const params = {
    q: options.q ? options.q : '',
    street: options.q ? '' : options.street,
    city: options.q ? '' : options.city,
    exclude_place_ids: options.exclude ? options.exclude.join(',') : '',
    format: 'geojson',
    polygon_geojson: 1,
    dedupe: 0,
    limit: 10,
    addressdetails: 1,
  }

  const result = Object.entries(params).map(
    ([key, value]) => window.encodeURIComponent(key) + '=' + window.encodeURIComponent(value)
  )

  return result.join('&')
}

export const fetchPlaces = async (opt) => {
  try {
    const result = await window.fetch(
      'https://nominatim.openstreetmap.org/search?' + encodeQueryData(opt),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    )

    return await result.json()
  } catch (e) {
    return e
  }
}
