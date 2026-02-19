/**
 * Root app component with routing (plan/coding_plan.md Slice 0).
 * Placeholder route at / until Slice 1+ add auth and dashboard.
 * See frontend_references/README.md for design direction.
 */
import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** Placeholder home page for Slice 0 checkpoint. */
function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Progressive Overload Tracker</h1>
      <p className="text-muted-foreground">Welcome</p>
      <Button>Get Started</Button>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  );
}

export default App;
