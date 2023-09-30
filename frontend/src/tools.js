export const command = ({ command, data }) =>
  fetch(`https://${process.env.REACT_APP_NEO_HOST}/c`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command, data })
  })
