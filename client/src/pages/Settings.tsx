import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Camera, Loader2, Key, CheckCircle2 } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useUser } from "@/contexts/UserContext";
import { useLLM } from "@/contexts/LLMContext";
import { useToast } from "@/hooks/use-toast";
import type { LLMProvider } from "@/contexts/LLMContext";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { role } = useRole();
  const { user, updateUser } = useUser();
  const { config, updateConfig, clearConfig, isConfigured } = useLLM();
  const { toast } = useToast();

  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [userTeam, setUserTeam] = useState(user.team);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const [isLoading, setIsLoading] = useState(false);

  // LLM Configuration state
  const [llmProvider, setLlmProvider] = useState<LLMProvider | "">(config?.provider || "");
  const [apiKey, setApiKey] = useState(config?.apiKey || "");
  const [model, setModel] = useState(config?.model || "");
  const [endpoint, setEndpoint] = useState(config?.endpoint || "");

  const initials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a server
      // For now, create a local URL preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        setAvatarUrl(newAvatar);
        updateUser({ avatar: newAvatar });
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the global user context
    updateUser({
      name: userName,
      email: userEmail,
      team: userTeam,
      avatar: avatarUrl
    });

    setIsLoading(false);
    toast({
      title: "Settings saved",
      description: "Your profile has been updated successfully"
    });
  };

  const handleSaveLLMConfig = () => {
    if (!llmProvider || !apiKey) {
      toast({
        title: "Invalid configuration",
        description: "Please select a provider and enter an API key",
        variant: "destructive"
      });
      return;
    }

    updateConfig({
      provider: llmProvider as LLMProvider,
      apiKey,
      model: model || undefined,
      endpoint: endpoint || undefined
    });

    toast({
      title: "LLM configuration saved",
      description: "Your AI provider settings have been updated"
    });
  };

  const handleClearLLMConfig = () => {
    clearConfig();
    setLlmProvider("");
    setApiKey("");
    setModel("");
    setEndpoint("");
    toast({
      title: "LLM configuration cleared",
      description: "Your AI provider settings have been removed"
    });
  };

  const handleProviderChange = (value: string) => {
    setLlmProvider(value as LLMProvider);
    // Set default model based on provider
    const defaultModels: Record<LLMProvider, string> = {
      openai: "gpt-4",
      anthropic: "claude-3-5-sonnet-20241022",
      google: "gemini-pro",
      "azure-openai": "gpt-4"
    };
    setModel(defaultModels[value as LLMProvider]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation(role === "admin" ? "/legal-inbox" : "/home")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-lg mb-6">Profile Information</h2>

          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div>
              <h3 className="font-medium mb-1">Profile Picture</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Upload a new profile picture. Recommended size: 400x400px
              </p>
              <label htmlFor="avatar-upload">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Avatar
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                value={userTeam}
                onChange={(e) => setUserTeam(e.target.value)}
                placeholder="Enter your team name"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation(role === "admin" ? "/legal-inbox" : "/home")}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-medium capitalize">{role}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">January 2024</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Last Login</span>
              <span className="font-medium">Today at 9:45 AM</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-lg">AI Provider Configuration</h2>
            {isConfigured && (
              <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Configure your preferred AI provider for the guided discovery feature. Your API key is encrypted and stored locally.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="llm-provider">AI Provider</Label>
              <Select value={llmProvider} onValueChange={handleProviderChange}>
                <SelectTrigger id="llm-provider">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="google">Google (Gemini)</SelectItem>
                  <SelectItem value="azure-openai">Azure OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model (optional)</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., gpt-4, claude-3-5-sonnet-20241022"
              />
            </div>

            {llmProvider === "azure-openai" && (
              <div className="space-y-2">
                <Label htmlFor="endpoint">Azure Endpoint</Label>
                <Input
                  id="endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://your-resource.openai.azure.com"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {isConfigured && (
              <Button
                variant="outline"
                onClick={handleClearLLMConfig}
              >
                Clear Configuration
              </Button>
            )}
            <Button onClick={handleSaveLLMConfig}>
              Save AI Configuration
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
