import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LLMProvider = "openai" | "anthropic" | "google" | "azure-openai";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  endpoint?: string; // For Azure OpenAI
}

interface LLMContextType {
  config: LLMConfig | null;
  updateConfig: (config: Partial<LLMConfig>) => void;
  clearConfig: () => void;
  isConfigured: boolean;
}

const LLMContext = createContext<LLMContextType | undefined>(undefined);

const DEFAULT_MODELS = {
  openai: "gpt-4",
  anthropic: "claude-3-5-sonnet-20241022",
  google: "gemini-pro",
  "azure-openai": "gpt-4"
};

// Simple encryption for API keys (in production, use proper encryption)
const encryptKey = (key: string): string => {
  return btoa(key); // Base64 encoding (NOT secure, just obfuscation)
};

const decryptKey = (encrypted: string): string => {
  try {
    return atob(encrypted);
  } catch {
    return "";
  }
};

export function LLMProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LLMConfig | null>(() => {
    const stored = localStorage.getItem("llmConfig");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Decrypt the API key
        if (parsed.apiKey) {
          parsed.apiKey = decryptKey(parsed.apiKey);
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (config) {
      // Encrypt the API key before storing
      const toStore = {
        ...config,
        apiKey: encryptKey(config.apiKey)
      };
      localStorage.setItem("llmConfig", JSON.stringify(toStore));
    } else {
      localStorage.removeItem("llmConfig");
    }
  }, [config]);

  const updateConfig = (updates: Partial<LLMConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates } as LLMConfig;

      // Set default model if provider changed
      if (updates.provider && !updates.model) {
        newConfig.model = DEFAULT_MODELS[updates.provider];
      }

      return newConfig;
    });
  };

  const clearConfig = () => {
    setConfig(null);
  };

  const isConfigured = !!(config?.provider && config?.apiKey);

  return (
    <LLMContext.Provider value={{ config, updateConfig, clearConfig, isConfigured }}>
      {children}
    </LLMContext.Provider>
  );
}

export function useLLM() {
  const context = useContext(LLMContext);
  if (context === undefined) {
    throw new Error("useLLM must be used within an LLMProvider");
  }
  return context;
}
