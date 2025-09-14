import { render } from '@testing-library/react'
import { ThemeController } from '@/components/settings/ThemeController'
import { AppProviders } from '@/app/providers/Providers'
import '@testing-library/jest-dom'

test('renders ThemeController', () => {
  const { getByText } = render(
    <AppProviders>
      <ThemeController />
    </AppProviders>
  )
  expect(getByText('Theme')).toBeInTheDocument()
})
