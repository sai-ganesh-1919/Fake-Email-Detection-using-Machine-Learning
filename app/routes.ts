import { createBrowserRouter } from "react-router";
import { WelcomeScreen } from "@/app/components/WelcomeScreen";
import { HomeScreen } from "@/app/components/HomeScreen";
import { InputScreen } from "@/app/components/InputScreen";
import { ResultsScreen } from "@/app/components/ResultsScreen";
import { HistoryScreen } from "@/app/components/HistoryScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: WelcomeScreen,
  },
  {
    path: "/home",
    Component: HomeScreen,
  },
  {
    path: "/input",
    Component: InputScreen,
  },
  {
    path: "/results",
    Component: ResultsScreen,
  },
  {
    path: "/history",
    Component: HistoryScreen,
  },
]);
