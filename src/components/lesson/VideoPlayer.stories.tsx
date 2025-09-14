import type { Meta, StoryObj } from '@storybook/react'
import { VideoPlayer } from './VideoPlayer'
import { AppProviders } from '@/app/providers/Providers'

const meta: Meta<typeof VideoPlayer> = {
  title: 'Lesson/VideoPlayer',
  component: VideoPlayer,
  decorators: [
    (Story) => (
      <AppProviders>
        <div className="p-6">
          <Story />
        </div>
      </AppProviders>
    ),
  ],
  args: { lessonId: 'les-lim-def-001' },
}
export default meta

export const Default: StoryObj<typeof VideoPlayer> = {}
