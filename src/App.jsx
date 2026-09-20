import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

const FlowspaceApp = lazy(() => import("./pages/FlowspaceApp"));
const LandingPage = lazy(() => import("./pages/LandingPage"));

function PageLoader() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#090D16]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs font-semibold tracking-wide text-slate-400">Loading Flowspace...</span>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<FlowspaceApp />} />
                        <Route path="/login" element={<FlowspaceApp initialAuthView="login" />} />
                        <Route path="/register" element={<FlowspaceApp initialAuthView="register" />} />
                        <Route path="/app" element={<FlowspaceApp />} />
                        <Route path="/myworks" element={<FlowspaceApp />} />
                        <Route path="/landing" element={<LandingPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;