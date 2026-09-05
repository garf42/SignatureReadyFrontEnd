import "@/ui/theme.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/500.css";

import { Navigate, Route, Routes } from "react-router-dom";
import { BlueprintProvider } from "@blueprintjs/core";

import { useSession } from "@/ui/data/port";
import { ArchiveScreen } from "@/ui/screens/ArchiveScreen";
import { ElementScreen } from "@/ui/screens/ElementScreen";
import { ExpertQScreen } from "@/ui/screens/ExpertQScreen";
import { InboxScreen } from "@/ui/screens/InboxScreen";
import { LearningScreen } from "@/ui/screens/LearningScreen";
import { NotFoundScreen } from "@/ui/screens/NotFoundScreen";
import { ProjectScreen } from "@/ui/screens/ProjectScreen";
import { ReferenceScreen } from "@/ui/screens/ReferenceScreen";
import { SignedOutScreen } from "@/ui/screens/SignedOutScreen";
import { ARCHIVE, EXPERTS, FIRST_TAB, LEARNING, REFERENCE } from "@/ui/routes";

/** Everything that ports starts here: fonts, tokens, routes, screens.
 *  The router itself is supplied above this file. */
export function App() {
  const session = useSession();

  if (session.state !== "filled") {
    return (
      <BlueprintProvider>
        <SignedOutScreen session={session} />
      </BlueprintProvider>
    );
  }

  return (
    <BlueprintProvider>
      <Routes>
        <Route path="/" element={<InboxScreen />} />
        <Route path={ARCHIVE} element={<ArchiveScreen />} />
        <Route path={EXPERTS} element={<ExpertQScreen />} />
        <Route path={LEARNING} element={<LearningScreen />} />
        <Route path={REFERENCE} element={<ReferenceScreen />} />
        <Route path="/projects/:projectRef" element={<ProjectScreen />}>
          <Route index element={<Navigate to={FIRST_TAB} replace />} />
          <Route path="steps/:stepId/:tabId" element={<ElementScreen />} />
        </Route>
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </BlueprintProvider>
  );
}
