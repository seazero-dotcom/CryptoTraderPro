import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIndexedDB } from "@/hooks/use-indexeddb";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isTestnet, setIsTestnet] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoRestart, setAutoRestart] = useState(false);

  const { saveCredentials, getCredentials } = useIndexedDB();
  const { toast } = useToast();

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/credentials/test", {
        apiKey,
        apiSecret,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveCredentialsMutation = useMutation({
    mutationFn: async () => {
      // Save to server
      const response = await apiRequest("POST", "/api/credentials", {
        userId: 1, // Default user ID
        apiKey,
        apiSecret,
        isTestnet,
      });
      return response.json();
    },
    onSuccess: async () => {
      // Save to IndexedDB
      await saveCredentials(1, apiKey, apiSecret, isTestnet);
      toast({
        title: "Success",
        description: "API credentials saved securely",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = () => {
    if (!apiKey || !apiSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API key and secret",
        variant: "destructive",
      });
      return;
    }
    testConnectionMutation.mutate();
  };

  const handleSaveCredentials = () => {
    if (!apiKey || !apiSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API key and secret",
        variant: "destructive",
      });
      return;
    }
    saveCredentialsMutation.mutate();
  };

  return (
    <div className="pb-16 md:pb-0 md:ml-64">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your API credentials and preferences</p>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-2xl space-y-6">
        {/* API Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Binance API Configuration</CardTitle>
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>API 키 설정 안내:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>바이낸스 계정의 API 관리에서 "읽기 전용" 권한으로 키를 생성하세요</li>
                    <li>IP 제한을 비활성화하거나 모든 IP를 허용으로 설정하세요</li>
                    <li>현재 서버는 지역 제한으로 인해 바이낸스 글로벌 API 접근이 제한될 수 있습니다</li>
                    <li>Test Connection 실패 시에도 키를 저장하면 앱 내에서 시세 확인은 가능합니다</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-sm font-medium">API Key</Label>
              <div className="relative mt-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Binance API Key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="apiSecret" className="text-sm font-medium">API Secret</Label>
              <div className="relative mt-2">
                <Input
                  id="apiSecret"
                  type={showApiSecret ? "text" : "password"}
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="Enter your Binance API Secret"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                >
                  {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="testnet"
                checked={isTestnet}
                onCheckedChange={setIsTestnet}
              />
              <Label htmlFor="testnet">Use Testnet</Label>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your API credentials are stored locally and encrypted. Never share your API keys with others.
                Make sure to enable only "Spot Trading" permissions and disable "Withdrawal" for security.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending}
                variant="outline"
              >
                {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
              </Button>
              <Button
                onClick={handleSaveCredentials}
                disabled={saveCredentialsMutation.isPending}
              >
                {saveCredentialsMutation.isPending ? "Saving..." : "Save Credentials"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trading Preferences */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Trading Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when orders are executed</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-restart Strategies</p>
                <p className="text-sm text-muted-foreground">Automatically restart stopped strategies</p>
              </div>
              <Switch
                checked={autoRestart}
                onCheckedChange={setAutoRestart}
              />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build:</span>
                <span>PWA-2024.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
