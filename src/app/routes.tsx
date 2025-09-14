import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'

const Home = lazy(() => import('@/pages/Home'))
const Subject = lazy(() => import('@/pages/Subject'))
const Section = lazy(() => import('@/pages/Section'))
const Lesson = lazy(() => import('@/pages/Lesson'))
const LessonMedia = lazy(() => import('@/pages/LessonMedia'))
const Quiz = lazy(() => import('@/pages/Quiz'))
const Settings = lazy(() => import('@/pages/Settings'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AdvancedSearch = lazy(() => import('@/pages/AdvancedSearch'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Help = lazy(() => import('@/pages/Help'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'subject/:subjectId', element: <Subject /> },
      { path: 'section/:sectionId', element: <Section /> },
      { path: 'lesson/:lessonId', element: <Lesson /> },
      { path: 'lesson/:lessonId/media', element: <LessonMedia /> },
      { path: 'lesson/:lessonId/quiz', element: <Quiz /> },
      { path: 'settings', element: <Settings /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'search', element: <AdvancedSearch /> },
      { path: 'onboarding', element: <Onboarding /> },
      { path: 'help', element: <Help /> },
    ],
  },
])
