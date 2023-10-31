export const command = ({ command, data }) =>
  fetch(`http${process.env.NODE_ENV === 'production' ? 's' : ''}://${process.env.REACT_APP_BACKEND_HOST}/command`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command, data })
  })

export const withoutKey = (key, { [key]: _, ...rest }) => rest
