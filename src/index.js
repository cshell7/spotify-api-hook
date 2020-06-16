import React, { useState, useEffect, createContext, useContext } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import cookies from 'js-cookie'
import { parseQueryString, objectToQueryParamString } from 'utils-url-query-params'

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'

const COOKIES_DAY = 1 // 1 = one day for js-cookie expirations
const COOKIES_HOUR = COOKIES_DAY / 24
const COOKIES_MINUTE = COOKIES_HOUR / 60
const COOKIES_SECONDS = COOKIES_MINUTE / 60

const SpotityAPIContext = createContext({})

export const SpotifyAPIProvider = ({ clientId, children }) => {
  const spotifyAuthUrl = SPOTIFY_AUTH_URL

  const getUserAccessToken = ({ redirectUri, scope }) => {
    const authRequestTime = Date.now()
    cookies.set('authRequestTime', authRequestTime, {
      expires: 30 * COOKIES_MINUTE,
    })
    const params = {
      response_type: 'token',
      client_id: clientId,
      ...(!!scope && { scope }),
      redirect_uri: encodeURIComponent(redirectUri),
      state: authRequestTime,
    }
    window.location.assign(spotifyAuthUrl + objectToQueryParamString(params))
  }

  const history = useHistory()
  const { hash, search, pathame } = useLocation()
  const spotifyAuthResponse = {
    ...parseQueryString(search), // Query params are returned for an error state
    ...parseQueryString(hash), // A hash is returned for a success state
  }
  const {
    expires_in: expiresIn,
    state: returnedAuthRequestTime,
    access_token: newUserAccessToken,
    error: spotifyErrorCode,
  } = spotifyAuthResponse

  const [error, setError] = useState()
  const [userAccessToken, setUserAccessToken] = useState()
  useEffect(() => {
    const clearUrlQueryParams = () => history.replace(pathame)

    const hasResponse = !!returnedAuthRequestTime
    const authRequestTime = cookies.get('authRequestTime')
    const cachedUserAccessToken = cookies.get('userAccessToken')

    if (hasResponse) {
      if (authRequestTime !== returnedAuthRequestTime) {
        setError({
          message: 'Sent auth request time/state not the same as returned value.',
          code: 'mismatched_request_state',
          link: 'https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow',
        })
      } else if (spotifyErrorCode) {
        setError({
          message: 'Something went wrong.',
          code: spotifyErrorCode,
          link: 'https://tools.ietf.org/html/rfc6749#section-4.1.2.1',
        })
      } else if (newUserAccessToken) {
        setUserAccessToken(newUserAccessToken)
        cookies.set('userAccessToken', newUserAccessToken, {
          expires: COOKIES_SECONDS * expiresIn,
        })
        setError(null)
      } else {
        setError({
          message: 'An unknown error occured.',
          code: 'client_unknown',
        })
      }
      clearUrlQueryParams()
    } else if (cachedUserAccessToken) {
      setUserAccessToken(cachedUserAccessToken)
      setError(null)
    }
  }, [returnedAuthRequestTime, spotifyErrorCode, newUserAccessToken, expiresIn, history, pathame])

  const isAuthed = !!userAccessToken

  const fetchData = (url, method = 'GET') =>
    fetch(`https://api.spotify.com/v1/${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => data)

  return (
    <SpotityAPIContext.Provider
      value={{
        getUserAccessToken,
        userAccessToken,
        isAuthed,
        error,
        fetchData,
      }}
    >
      {children}
    </SpotityAPIContext.Provider>
  )
}

export const useSpotityAPI = () => {
  const { getUserAccessToken, userAccessToken, error, isAuthed, fetchData } = useContext(SpotityAPIContext)
  return {
    getUserAccessToken,
    userAccessToken,
    error,
    isAuthed,
    fetchData,
  }
}
