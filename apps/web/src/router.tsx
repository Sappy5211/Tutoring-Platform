import { createBrowserRouter, Navigate } from "react-router-dom";
import type { UserRole } from "@vidya/contracts";
import { Shell } from "./app/Shell";
import { services } from "./lib/services";
import { SurfacePage } from "./features/SurfacePage";
import { GraphPage } from "./features/student/GraphPage";
import { SignInPage } from "./features/auth/SignInPage";
import { FlashcardReview } from "./features/flashcards/FlashcardReview";
import { NotebookPage } from "./features/notebook/NotebookPage";
import {
  HomePage,
  NotesPage,
  SyllabusPage,
  TeachersPage,
  TopicPage,
  TutorPage,
} from "./features/student/StudentPages";
import {
  PracticeComplete,
  PracticePage,
} from "./features/practice/PracticePage";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { TeacherBookingPage } from "./features/booking/TeacherBookingPage";
import {
  AuthorEditorPage,
  OnboardingPage,
  ParentGoalPage,
  TeacherDashboard,
} from "./features/role/RolePages";

const surface = (id: string, role: UserRole) => async () =>
  services.repository.getSurface(id, role);
export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/onboarding" replace /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/signin", element: <SignInPage /> },
  {
    element: <Shell />,
    children: [
      {
        path: "/app/home",
        element: <HomePage />,
        loader: () => services.repository.getDashboard(),
      },
      {
        path: "/app/syllabus",
        element: <SyllabusPage />,
        loader: () => services.repository.getCurriculum(),
      },
      {
        path: "/app/topic/:skillId",
        element: <TopicPage />,
        loader: ({ params }) =>
          services.repository.getTopic(params.skillId ?? ""),
      },
      { path: "/app/notebook", element: <NotebookPage /> },
      {
        path: "/app/notes/:noteId?",
        element: <NotesPage />,
        loader: ({ params }) =>
          services.repository.getNote(params.noteId ?? "note-lines"),
      },
      {
        path: "/app/practice",
        element: <PracticePage />,
        loader: () => services.repository.getPracticeQuestions(),
      },
      { path: "/app/practice/complete", element: <PracticeComplete /> },
      {
        path: "/app/assessment",
        element: <SurfacePage />,
        loader: surface("assessment", "student"),
      },
      {
        path: "/app/assessment/review",
        element: <SurfacePage />,
        loader: surface("assessment-review", "student"),
      },
      {
        path: "/app/diagnostic",
        element: <SurfacePage />,
        loader: surface("diagnostic", "student"),
      },
      { path: "/app/flashcards", element: <FlashcardReview /> },
      { path: "/app/tutor", element: <TutorPage /> },
      { path: "/app/graph", element: <GraphPage /> },
      {
        path: "/app/progress",
        element: <SurfacePage />,
        loader: surface("progress", "student"),
      },
      {
        path: "/app/teachers",
        element: <TeachersPage />,
        loader: () => services.repository.getTeachers(),
      },
      {
        path: "/app/teachers/:teacherId/book",
        element: <TeacherBookingPage />,
        loader: async ({ params }) =>
          (await services.repository.getTeachers()).find(
            (teacher) => teacher.teacherId === params.teacherId,
          ) ?? (await services.repository.getTeachers())[0],
      },
      {
        path: "/app/settings",
        element: <SurfacePage />,
        loader: surface("settings", "student"),
      },
      {
        path: "/app/calendar",
        element: <CalendarPage />,
        loader: () => services.repository.getCalendarEvents(),
      },
      {
        path: "/app/upgrade",
        element: <SurfacePage />,
        loader: surface("upgrade", "student"),
      },
      {
        path: "/parent/overview",
        element: <SurfacePage />,
        loader: surface("parent-overview", "parent"),
      },
      { path: "/parent/goals", element: <ParentGoalPage /> },
      {
        path: "/parent/bookings",
        element: <SurfacePage />,
        loader: surface("teacher-availability", "parent"),
      },
      {
        path: "/parent/plan",
        element: <SurfacePage />,
        loader: surface("upgrade", "parent"),
      },
      {
        path: "/teacher/dashboard",
        element: <TeacherDashboard />,
        loader: surface("teacher-assignments", "teacher"),
      },
      {
        path: "/teacher/classes",
        element: <SurfacePage />,
        loader: surface("teacher-classes", "teacher"),
      },
      {
        path: "/teacher/assignments",
        element: <SurfacePage />,
        loader: surface("teacher-assignments", "teacher"),
      },
      {
        path: "/teacher/availability",
        element: <SurfacePage />,
        loader: surface("teacher-availability", "teacher"),
      },
      {
        path: "/teacher/reports",
        element: <SurfacePage />,
        loader: surface("progress", "teacher"),
      },
      {
        path: "/author/library",
        element: <SurfacePage />,
        loader: surface("author-library", "author"),
      },
      { path: "/author/editor", element: <AuthorEditorPage /> },
      {
        path: "/author/questions",
        element: <SurfacePage />,
        loader: surface("author-questions", "author"),
      },
      {
        path: "/author/review",
        element: <SurfacePage />,
        loader: surface("author-review", "author"),
      },
      {
        path: "/author/ingest",
        element: <SurfacePage />,
        loader: surface("author-ingest", "author"),
      },
    ],
  },
  { path: "*", element: <Navigate to="/app/home" replace /> },
]);
