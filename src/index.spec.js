import React from 'react'
import { render } from '@testing-library/react'

import { SpotifyAPIProvider } from './'

const SpotifyAPIProviderWithContent = () => (
  <SpotifyAPIProvider clientId="test_id">
    <p data-testid="lcontent">content</p>
  </SpotifyAPIProvider>
)

describe('SpotifyAPIProvider', () => {
  it('should render content', () => {
    const { getByTestId } = render(<SpotifyAPIProviderWithContent />)

    expect(getByTestId('content'))
  })
  // TODO actually write some useful tests here
})
