import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { UserMenu } from "@/components/UserMenu";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleModeSelection = (mode: "direct" | "guided") => {
    if (mode === "direct") {
      setLocation("/direct");
    } else {
      setLocation("/guided");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <AnimatedLogo
              src="/iohk_email_gif_11.gif"
              staticSrc="/logo-frame-200.png"
              alt="Company Logo"
              className="h-24 w-auto"
              loopDuration={8000}
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Legal Intake & Triage
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the legal support you need, whether you know exactly what you're looking for or need help figuring it out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className="p-8 cursor-pointer hover-elevate active-elevate-2 transition-all"
            onClick={() => handleModeSelection("direct")}
            data-testid="button-mode-direct"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">I know what I need</h3>
                <p className="text-sm text-muted-foreground">
                  Fast-track your request with our streamlined submission process
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-8 cursor-pointer hover-elevate active-elevate-2 transition-all"
            onClick={() => handleModeSelection("guided")}
            data-testid="button-mode-guided"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-sidebar-accent/10 rounded-lg">
                <Sparkles className="w-10 h-10 text-sidebar-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Help me figure this out</h3>
                <p className="text-sm text-muted-foreground">
                  Answer a few questions and we'll guide you to the right solution
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
