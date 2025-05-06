
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { EmailConfig, getEmailConfig, saveEmailConfig, testEmailConfig } from "@/services/emailService";

const EmailSettings = () => {
  const [config, setConfig] = useState<EmailConfig>(getEmailConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const handleChange = (field: keyof EmailConfig, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Validate configuration
      if (!config.smtpServer || !config.port) {
        toast.error('SMTP server and port are required');
        setIsLoading(false);
        return;
      }
      
      // Save configuration
      saveEmailConfig(config);
      toast.success('Email settings saved successfully');
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTest = async () => {
    setIsTesting(true);
    
    try {
      await testEmailConfig(config);
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>
          Configure email notifications for the ticketing system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtpServer">SMTP Server</Label>
            <Input
              id="smtpServer"
              placeholder="e.g., smtp.gmail.com"
              value={config.smtpServer}
              onChange={(e) => handleChange('smtpServer', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              placeholder="e.g., 587"
              value={config.port}
              onChange={(e) => handleChange('port', Number(e.target.value))}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="useSsl">Use SSL/TLS</Label>
            <Switch
              id="useSsl"
              checked={config.useSsl}
              onCheckedChange={(checked) => handleChange('useSsl', checked)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">SMTP Username</Label>
            <Input
              id="username"
              placeholder="Email username"
              value={config.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">SMTP Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Email password"
              value={config.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromAddress">From Email Address</Label>
            <Input
              id="fromAddress"
              placeholder="e.g., ticketing@genena.com"
              value={config.fromAddress}
              onChange={(e) => handleChange('fromAddress', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              placeholder="e.g., Genena Ticketing System"
              value={config.fromName}
              onChange={(e) => handleChange('fromName', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <Button 
          type="button"
          variant="outline"
          onClick={handleTest}
          disabled={isTesting}
        >
          {isTesting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          ) : (
            "Test Connection"
          )}
        </Button>
        <Button 
          type="button"
          onClick={handleSave} 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          ) : (
            "Save Settings"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailSettings;
