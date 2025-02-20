
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import NotFound from "./pages/NotFound";
import StampsManager from "./pages/manage/Stamps";
import VideosManager from "./pages/manage/Videos";
import AssociationsManager from "./pages/manage/Associations";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <React.StrictMode>
          <Navbar />
          <div className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/scan" element={<Scanner />} />
              <Route path="/manage/stamps" element={<StampsManager />} />
              <Route path="/manage/videos" element={<VideosManager />} />
              <Route path="/manage/associations" element={<AssociationsManager />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </React.StrictMode>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
