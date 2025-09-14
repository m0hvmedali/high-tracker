import type { Meta, StoryObj } from '@storybook/react'
import { ThemeController } from './ThemeController'
import { AppProviders } from '@/app/providers/Providers'

const meta: Meta<typeof ThemeController> = {
  title: 'Settings/ThemeController',
  component: ThemeController,
  decorators: [
    (Story) => (
      <AppProviders>
        <div className="p-6 max-w-md">
          <Story />
        </div>
      </AppProviders>
    ),
  ],
}
export default meta

export const Default: StoryObj<typeof ThemeController> = {}
