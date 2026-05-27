import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: HomeRedirect,
});

function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const u = getCurrentUser();
    navigate({ to: u?.role === "client" ? "/client" : u ? "/admin" : "/login", replace: true });
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-soft px-4">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-xl bg-gradient-primary shadow-soft" />
        <p className="text-sm font-medium text-muted-foreground">Membuka dashboard...</p>
      </div>
    </div>
  );
}
