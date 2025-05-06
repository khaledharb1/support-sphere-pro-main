import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, X, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getOrganizationConfig,
  saveOrganizationConfig,
  TicketCategoryConfig,
  WorkflowStage,
  CustomField,
  OrganizationConfig
} from "@/services/customizationService";

const CustomizationSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("categories");
  const [config, setConfig] = useState<OrganizationConfig | null>(null);
  const [loading, setLoading] = useState(false);
  
  // New category state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TicketCategoryConfig | null>(null);
  
  // New workflow stage state
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState("blue");
  
  // New custom field state
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // Redirect if user doesn't have access
  useEffect(() => {
    if (user && !["admin", "manager"].includes(user.role)) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Load organization config
  useEffect(() => {
    const organizationConfig = getOrganizationConfig();
    setConfig(organizationConfig);
  }, []);
  
  const handleSaveConfig = () => {
    if (!config) return;
    
    setLoading(true);
    try {
      saveOrganizationConfig(config);
      toast.success("Customization settings saved successfully");
    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };
  
  // Category management
  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !config) return;
    
    const newCategory: TicketCategoryConfig = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName,
      description: newCategoryDescription,
      subcategories: [],
      slaHours: 24
    };
    
    setConfig({
      ...config,
      ticketCategories: [...config.ticketCategories, newCategory]
    });
    
    setNewCategoryName("");
    setNewCategoryDescription("");
    toast.success(`Category "${newCategoryName}" added`);
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    if (!config) return;
    
    setConfig({
      ...config,
      ticketCategories: config.ticketCategories.filter(cat => cat.id !== categoryId)
    });
    
    toast.success("Category deleted");
  };
  
  const handleAddSubcategory = (categoryId: string) => {
    if (!newSubcategory.trim() || !config) return;
    
    const updatedCategories = config.ticketCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: [...(cat.subcategories || []), newSubcategory]
        };
      }
      return cat;
    });
    
    setConfig({
      ...config,
      ticketCategories: updatedCategories
    });
    
    setNewSubcategory("");
    toast.success(`Subcategory added to ${selectedCategory?.name}`);
  };
  
  const handleDeleteSubcategory = (categoryId: string, subcategory: string) => {
    if (!config) return;
    
    const updatedCategories = config.ticketCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: (cat.subcategories || []).filter(sub => sub !== subcategory)
        };
      }
      return cat;
    });
    
    setConfig({
      ...config,
      ticketCategories: updatedCategories
    });
    
    toast.success(`Subcategory removed`);
  };
  
  // Workflow stages management
  const handleAddWorkflowStage = () => {
    if (!newStageName.trim() || !config) return;
    
    const newStage: WorkflowStage = {
      id: newStageName.toLowerCase().replace(/\s+/g, '-'),
      name: newStageName,
      color: newStageColor
    };
    
    setConfig({
      ...config,
      workflowStages: [...config.workflowStages, newStage]
    });
    
    setNewStageName("");
    toast.success(`Workflow stage "${newStageName}" added`);
  };
  
  const handleDeleteWorkflowStage = (stageId: string) => {
    if (!config) return;
    
    setConfig({
      ...config,
      workflowStages: config.workflowStages.filter(stage => stage.id !== stageId)
    });
    
    toast.success("Workflow stage deleted");
  };
  
  // Custom fields management
  const handleAddCustomField = () => {
    if (!newFieldName.trim() || !config) return;
    
    const newField: CustomField = {
      id: newFieldName.toLowerCase().replace(/\s+/g, '-'),
      name: newFieldName,
      type: newFieldType as "text" | "select" | "checkbox" | "date" | "number",
      required: newFieldRequired,
      options: newFieldType === "select" ? ["Option 1", "Option 2"] : undefined
    };
    
    setConfig({
      ...config,
      customFields: [...config.customFields, newField]
    });
    
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    toast.success(`Custom field "${newFieldName}" added`);
  };
  
  const handleDeleteCustomField = (fieldId: string) => {
    if (!config) return;
    
    setConfig({
      ...config,
      customFields: config.customFields.filter(field => field.id !== fieldId)
    });
    
    toast.success("Custom field deleted");
  };
  
  // Email notification settings
  const handleToggleEmailNotification = (setting: keyof OrganizationConfig["emailNotifications"]) => {
    if (!config) return;
    
    setConfig({
      ...config,
      emailNotifications: {
        ...config.emailNotifications,
        [setting]: !config.emailNotifications[setting]
      }
    });
  };

  if (!user || !["admin", "manager"].includes(user.role)) {
    return null;
  }

  if (!config) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Customization Settings</h1>
        <Button onClick={handleSaveConfig} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Categories</CardTitle>
              <CardDescription>
                Configure categories and subcategories for tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category List */}
                <Card className="border">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Category List</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {config.ticketCategories.length === 0 ? (
                      <p className="text-sm text-gray-500">No categories defined</p>
                    ) : (
                      <div className="space-y-3">
                        {config.ticketCategories.map((category) => (
                          <div 
                            key={category.id} 
                            className="flex items-center justify-between border rounded-md p-2 cursor-pointer hover:bg-gray-50"
                            onClick={() => setSelectedCategory(category)}
                          >
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-xs text-gray-500">{category.description}</p>
                              <p className="text-xs text-gray-500">SLA: {category.slaHours}h</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t p-4 bg-gray-50">
                    <div className="space-y-2 w-full">
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="New category name" 
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <Button onClick={handleAddCategory}>
                          <Plus className="h-4 w-4 mr-2" /> Add Category
                        </Button>
                      </div>
                      <Input 
                        placeholder="Description (optional)" 
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                      />
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Subcategories */}
                <Card className="border">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">
                      {selectedCategory ? `${selectedCategory.name} Subcategories` : "Select a Category"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {!selectedCategory ? (
                      <p className="text-sm text-gray-500">Select a category to manage its subcategories</p>
                    ) : selectedCategory.subcategories?.length === 0 ? (
                      <p className="text-sm text-gray-500">No subcategories defined</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory.subcategories?.map((subcat) => (
                          <Badge key={subcat} variant="outline" className="pr-1">
                            {subcat}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-4 w-4 p-0 ml-1" 
                              onClick={() => handleDeleteSubcategory(selectedCategory.id, subcat)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {selectedCategory && (
                    <CardFooter className="border-t p-4 bg-gray-50">
                      <div className="flex w-full gap-2">
                        <Input 
                          placeholder="New subcategory" 
                          value={newSubcategory}
                          onChange={(e) => setNewSubcategory(e.target.value)}
                        />
                        <Button onClick={() => handleAddSubcategory(selectedCategory.id)}>
                          <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Stages</CardTitle>
              <CardDescription>
                Configure the stages that tickets progress through
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-6">
                  {config.workflowStages.map((stage) => (
                    <div key={stage.id} className={`border rounded-md p-3 bg-${stage.color}-50`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{stage.name}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0" 
                          onClick={() => handleDeleteWorkflowStage(stage.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-${stage.color}-500`}></span>
                        <span className="text-xs text-gray-500">{stage.id}</span>
                      </div>
                      {stage.isDefaultForNewTickets && (
                        <Badge variant="outline" className="mt-2 text-xs">Default for new tickets</Badge>
                      )}
                      {stage.isResolvedState && (
                        <Badge variant="outline" className="mt-2 text-xs">Resolved state</Badge>
                      )}
                      {stage.isClosedState && (
                        <Badge variant="outline" className="mt-2 text-xs">Closed state</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stageName">New Stage Name</Label>
                    <Input 
                      id="stageName"
                      placeholder="Stage name" 
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stageColor">Color</Label>
                    <select 
                      id="stageColor"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      value={newStageColor}
                      onChange={(e) => setNewStageColor(e.target.value)}
                    >
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="red">Red</option>
                      <option value="yellow">Yellow</option>
                      <option value="purple">Purple</option>
                      <option value="gray">Gray</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddWorkflowStage} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Stage
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <p className="text-sm text-gray-500">
                Note: Changes to workflow stages will only affect new tickets and status changes made after saving.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Configure additional fields for tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.customFields.map((field) => (
                    <div key={field.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{field.name}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0" 
                          onClick={() => handleDeleteCustomField(field.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Type: {field.type}</p>
                        <p>Required: {field.required ? "Yes" : "No"}</p>
                        {field.options && (
                          <p>Options: {field.options.join(", ")}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="fieldName">Field Name</Label>
                    <Input 
                      id="fieldName"
                      placeholder="Field name" 
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldType">Type</Label>
                    <select 
                      id="fieldType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="fieldRequired" 
                        checked={newFieldRequired}
                        onCheckedChange={setNewFieldRequired}
                      />
                      <Label htmlFor="fieldRequired">Required</Label>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCustomField} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Field
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <p className="text-sm text-gray-500">
                Note: Custom fields will be displayed on the ticket creation and edit forms.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when email notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ticket Creation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when a new ticket is created
                    </p>
                  </div>
                  <Switch 
                    checked={config.emailNotifications.onTicketCreation} 
                    onCheckedChange={() => handleToggleEmailNotification("onTicketCreation")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ticket Assignment</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when a ticket is assigned to someone
                    </p>
                  </div>
                  <Switch 
                    checked={config.emailNotifications.onTicketAssignment} 
                    onCheckedChange={() => handleToggleEmailNotification("onTicketAssignment")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ticket Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when a ticket is updated
                    </p>
                  </div>
                  <Switch 
                    checked={config.emailNotifications.onTicketUpdate} 
                    onCheckedChange={() => handleToggleEmailNotification("onTicketUpdate")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ticket Resolution</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when a ticket is resolved
                    </p>
                  </div>
                  <Switch 
                    checked={config.emailNotifications.onTicketResolution} 
                    onCheckedChange={() => handleToggleEmailNotification("onTicketResolution")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SLA Breach</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when a ticket breaches its SLA
                    </p>
                  </div>
                  <Switch 
                    checked={config.emailNotifications.onSLABreach} 
                    onCheckedChange={() => handleToggleEmailNotification("onSLABreach")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Send a daily summary of all ticket activity
                    </p>
                  </div>
                  <Switch 
                    checked={config.emailNotifications.dailyDigest} 
                    onCheckedChange={() => handleToggleEmailNotification("dailyDigest")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <p className="text-sm text-gray-500">
                Note: Email delivery is simulated in this demo app. In a production environment, 
                you would configure an email service provider.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomizationSettings;
