import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  // Explicitly type the state to accept User or null
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {user ? (
        <Dashboard user={user} supabase={supabase} />
      ) : (
        <LoginForm supabase={supabase} />
      )}
      <Toaster />
    </div>
  );
}