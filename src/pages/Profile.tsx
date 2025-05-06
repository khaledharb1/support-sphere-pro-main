import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Database,
  Trash2,
  Upload,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("555-123-4567");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState<string>(user?.avatar || "");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState({
    ticketUpdates: true,
    ticketResolved: true,
    announcements: false,
    tips: false,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    ticketUpdates: true,
    ticketResolved: true,
    announcements: true,
    tips: false,
  });
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Profile updated successfully");
    setLoading(false);
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
  };
  
  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Notification preferences updated");
    setLoading(false);
  };

  const handleChangePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setLoading(true);

    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        setLoading(false);
        toast.success("Profile photo updated successfully");
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-2xl">
                  {name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 space-y-1 text-center">
                <h2 className="text-xl font-semibold">{name}</h2>
                <p className="text-sm text-gray-500">{email}</p>
                <div className="mt-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleChangePhoto}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="border-t pt-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Account Type</span>
                <span className="ml-auto text-sm capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center">
                <Bell className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Notifications</span>
                <span className="ml-auto text-sm">Enabled</span>
              </div>
              <div className="flex items-center">
                <Shield className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">2FA</span>
                <span className="ml-auto text-sm">Disabled</span>
              </div>
              <div className="flex items-center">
                <Database className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Data</span>
                <Button variant="link" className="ml-auto p-0 h-auto text-sm">
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border border-red-100 bg-red-50 p-4">
                      <div className="flex items-start">
                        <Trash2 className="mr-3 h-5 w-5 text-red-500" />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-red-800">
                            Delete Account
                          </h3>
                          <p className="mt-1 text-sm text-red-700">
                            Once you delete your account, there is no going back.
                            All your data will be permanently removed.
                          </p>
                          <div className="mt-3">
                            <Button variant="destructive" size="sm">
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateNotifications} className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-ticket-updates">
                              Ticket Updates
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive emails when there are updates to your tickets
                            </p>
                          </div>
                          <Switch
                            id="email-ticket-updates"
                            checked={emailNotifications.ticketUpdates}
                            onCheckedChange={(checked) =>
                              setEmailNotifications({
                                ...emailNotifications,
                                ticketUpdates: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-ticket-resolved">
                              Ticket Resolved
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive emails when your tickets are resolved
                            </p>
                          </div>
                          <Switch
                            id="email-ticket-resolved"
                            checked={emailNotifications.ticketResolved}
                            onCheckedChange={(checked) =>
                              setEmailNotifications({
                                ...emailNotifications,
                                ticketResolved: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-announcements">
                              Announcements
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive emails about system announcements
                            </p>
                          </div>
                          <Switch
                            id="email-announcements"
                            checked={emailNotifications.announcements}
                            onCheckedChange={(checked) =>
                              setEmailNotifications({
                                ...emailNotifications,
                                announcements: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-tips">Tips & Tutorials</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive emails with helpful tips and tutorials
                            </p>
                          </div>
                          <Switch
                            id="email-tips"
                            checked={emailNotifications.tips}
                            onCheckedChange={(checked) =>
                              setEmailNotifications({
                                ...emailNotifications,
                                tips: checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Push Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="push-ticket-updates">
                              Ticket Updates
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive push notifications when there are updates to your tickets
                            </p>
                          </div>
                          <Switch
                            id="push-ticket-updates"
                            checked={pushNotifications.ticketUpdates}
                            onCheckedChange={(checked) =>
                              setPushNotifications({
                                ...pushNotifications,
                                ticketUpdates: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="push-ticket-resolved">
                              Ticket Resolved
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive push notifications when your tickets are resolved
                            </p>
                          </div>
                          <Switch
                            id="push-ticket-resolved"
                            checked={pushNotifications.ticketResolved}
                            onCheckedChange={(checked) =>
                              setPushNotifications({
                                ...pushNotifications,
                                ticketResolved: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="push-announcements">
                              Announcements
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive push notifications about system announcements
                            </p>
                          </div>
                          <Switch
                            id="push-announcements"
                            checked={pushNotifications.announcements}
                            onCheckedChange={(checked) =>
                              setPushNotifications({
                                ...pushNotifications,
                                announcements: checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
