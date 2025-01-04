import { errors } from 'common'

const { SystemError } = errors

export default () => {
  return fetch(`${import.meta.env.VITE_API_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.token}`,
    },
  })
    .catch((error) => {
      throw new SystemError(error.message)
    })
    .then((res) => {
      if (res.ok) {
        return res.json().catch((error) => {
          throw new SystemError(error.message)
        })
      }
      return res
        .json()
        .catch((error) => {
          throw new SystemError(error.message)
        })
        .then(({ error, message }) => {
          throw new errors[error](message)
        })
    })
}
