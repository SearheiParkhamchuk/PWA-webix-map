const encodeQueryData = (options) => {
  const params = {
    lat: options.lat,
    lon: options.lng,
    format: 'jsonv2',
  }

  const result = Object.entries(params).map(
    ([key, value]) => window.encodeURIComponent(key) + '=' + window.encodeURIComponent(value)
  )

  return result.join('&')
}

export const fetchPlaceByLatLng = async (opt) => {
  try {
    const result = await window.fetch(
      'https://nominatim.openstreetmap.org/reverse?' + encodeQueryData(opt),
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
