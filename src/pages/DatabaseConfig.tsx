
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DatabaseConfig, getDbConfig, saveDbConfig, testConnection, initializeDatabase } from "@/services/database/dbConfig";

const DatabaseConfigPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [config, setConfig] = useState<DatabaseConfig>(getDbConfig());

  const handleChange = (field: string, value: any) => {
    setConfig(prev => {
      if (field.startsWith('authentication.options.')) {
        const option = field.replace('authentication.options.', '');
        return {
          ...prev,
          authentication: {
            ...prev.authentication,
            options: {
              ...prev.authentication.options,
              [option]: value
            }
          }
        };
      } else if (field.startsWith('options.')) {
        const option = field.replace('options.', '');
        if (option === 'port' || option === 'connectionTimeout' || option === 'requestTimeout') {
          value = Number(value);
        }
        return {
          ...prev,
          options: {
            ...prev.options,
            [option]: value
          }
        };
      } else if (field === 'authentication.type') {
        return {
          ...prev,
          authentication: {
            ...prev.authentication,
            type: value as 'sql' | 'windows' | 'azure'
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save configuration
      saveDbConfig(config);
      
      toast.success("Database configuration saved successfully");
      navigate("/settings");
    } catch (error) {
      console.error("Error saving database config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);

    try {
      const result = await testConnection(config);
      
      if (result.success) {
        toast.success("Database connection successful!");
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Connection test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleInitializeDatabase = async () => {
    setIsInitializing(true);

    try {
      const success = await initializeDatabase();
      
      if (success) {
        toast.success("Database schema initialized successfully");
      } else {
        toast.error("Failed to initialize database schema");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      toast.error("Database initialization failed");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">SQL Server Configuration</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SQL Server Connection Settings</CardTitle>
              <CardDescription>
                Configure the connection to your SQL Server database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server">Server Name/IP</Label>
                  <Input
                    id="server"
                    placeholder="e.g., localhost\SQLEXPRESS or 192.168.1.100"
                    value={config.server}
                    onChange={(e) => handleChange("server", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database Name</Label>
                  <Input
                    id="database"
                    placeholder="e.g., GenenaTicketing"
                    value={config.database}
                    onChange={(e) => handleChange("database", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Authentication Type</Label>
                <RadioGroup
                  value={config.authentication.type}
                  onValueChange={(value) => handleChange("authentication.type", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sql" id="sql-auth" />
                    <Label htmlFor="sql-auth">SQL Server Authentication</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="windows" id="windows-auth" />
                    <Label htmlFor="windows-auth">Windows Authentication</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="azure" id="azure-auth" />
                    <Label htmlFor="azure-auth">Azure AD Authentication</Label>
                  </div>
                </RadioGroup>
              </div>

              {config.authentication.type === "sql" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="SQL Server login"
                      value={config.authentication.options.userName || ""}
                      onChange={(e) =>
                        handleChange("authentication.options.userName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="SQL Server password"
                      value={config.authentication.options.password || ""}
                      onChange={(e) =>
                        handleChange("authentication.options.password", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              )}

              {config.authentication.type === "windows" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      placeholder="Windows domain"
                      value={config.authentication.options.domain || ""}
                      onChange={(e) =>
                        handleChange("authentication.options.domain", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port">Port (Optional)</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="Default: 1433"
                    value={config.options.port || ""}
                    onChange={(e) => handleChange("options.port", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Connection Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="Default: 30000"
                    value={config.options.connectionTimeout}
                    onChange={(e) =>
                      handleChange("options.connectionTimeout", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="encrypt">Encrypt Connection</Label>
                  <Switch
                    id="encrypt"
                    checked={config.options.encrypt}
                    onCheckedChange={(checked) => handleChange("options.encrypt", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trustCert">Trust Server Certificate</Label>
                  <Switch
                    id="trustCert"
                    checked={config.options.trustServerCertificate}
                    onCheckedChange={(checked) =>
                      handleChange("options.trustServerCertificate", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full sm:w-auto"
              >
                {isTesting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <Button 
                type="button" 
                onClick={handleInitializeDatabase} 
                disabled={isInitializing}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {isInitializing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary-foreground"></div>
                ) : (
                  "Initialize Database"
                )}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default DatabaseConfigPage;
