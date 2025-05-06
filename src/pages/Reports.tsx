
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Calendar, FileSpreadsheet, FileText, Presentation } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateSLAComplianceRate } from "@/services/ticket/slaService";
import { getOrganizationConfig } from "@/services/customizationService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("performance");
  const [dateRange, setDateRange] = useState("lastMonth");
  const [tickets, setTickets] = useState([]);
  const [slaCompliance, setSlaCompliance] = useState(92);
  const [exportFormat, setExportFormat] = useState("Excel");

  // Fetch tickets from localStorage on component mount
  useEffect(() => {
    // Get tickets from localStorage (both demo and user created)
    const storedTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
    const demoTickets = [
      // Using the same demo tickets as in the original
      {
        id: "TKT-1234",
        title: "Unable to access email account",
        description: "I'm having trouble logging into my email account. It says 'Account locked'.",
        category: "Technical",
        priority: "high",
        status: "open",
        createdBy: {
          id: "user-1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          teamId: "team-1"
        },
        assignee: {
          id: "agent-1",
          name: "Jane Smith",
          role: "agent"
        },
        created: "2023-04-20",
        updated: "2023-04-21",
        dueDate: "2023-04-22",
        escalationLevel: 0,
        teamId: "team-1",
        tags: ["email", "access"]
      },
      {
        id: "TKT-1233",
        title: "Billing inquiry for last month",
        description: "I have a question about my bill from last month.",
        category: "Billing",
        priority: "medium",
        status: "in-progress",
        createdBy: {
          id: "user-2",
          name: "John Doe",
          email: "john@example.com",
          teamId: "team-1"
        },
        assignee: {
          id: "agent-2",
          name: "John Doe",
          role: "agent"
        },
        created: "2023-04-19",
        updated: "2023-04-21",
        dueDate: "2023-04-23",
        escalationLevel: 0,
        teamId: "team-1",
        tags: ["billing", "invoice"]
      },
      {
        id: "TKT-1232",
        title: "Password reset request",
        description: "I need to reset my password but I'm not receiving the email.",
        category: "Account",
        priority: "low",
        status: "resolved",
        createdBy: {
          id: "user-3",
          name: "Mike Brown",
          email: "mike@example.com",
          teamId: "team-2"
        },
        assignee: {
          id: "agent-1",
          name: "Jane Smith",
          role: "agent"
        },
        created: "2023-04-18",
        updated: "2023-04-19",
        dueDate: "2023-04-25",
        escalationLevel: 0,
        teamId: "team-2",
        tags: ["password", "reset"]
      },
      {
        id: "TKT-1229",
        title: "Refund request for subscription",
        description: "I'd like to request a refund for my subscription.",
        category: "Billing",
        priority: "urgent",
        status: "closed",
        createdBy: {
          id: "user-6",
          name: "Emma Wilson",
          email: "emma@example.com",
          teamId: "team-3"
        },
        assignee: {
          id: "agent-1",
          name: "Jane Smith",
          role: "agent"
        },
        created: "2023-04-16",
        updated: "2023-04-17",
        dueDate: "2023-04-17",
        escalationLevel: 2,
        teamId: "team-3",
        tags: ["refund", "subscription"]
      },
    ];
    
    const allTickets = [...demoTickets, ...storedTickets];
    setTickets(allTickets);
    
    // Calculate real SLA compliance
    const complianceRate = calculateSLAComplianceRate(allTickets);
    setSlaCompliance(Math.round(complianceRate));
  }, []);

  // Mock data for charts
  const performanceData = [
    { name: 'Jan', avgResponse: 8, avgResolution: 24 },
    { name: 'Feb', avgResponse: 7, avgResolution: 22 },
    { name: 'Mar', avgResponse: 9, avgResolution: 26 },
    { name: 'Apr', avgResponse: 6, avgResolution: 20 },
    { name: 'May', avgResponse: 5, avgResolution: 18 },
    { name: 'Jun', avgResponse: 7, avgResolution: 21 },
  ];

  // Get real category data from the organization config
  const orgConfig = getOrganizationConfig();
  const ticketVolumeData = orgConfig.ticketCategories.map((category, index) => ({
    name: category.name,
    value: 25 + (index * 5) // Mock values that add up to 100%
  }));

  const agentPerformanceData = [
    { name: 'Jane Smith', resolved: 45, reopened: 3, satisfaction: 92 },
    { name: 'John Doe', resolved: 38, reopened: 2, satisfaction: 88 },
    { name: 'Alex Wilson', resolved: 42, reopened: 4, satisfaction: 85 },
    { name: 'Sara Lee', resolved: 50, reopened: 1, satisfaction: 95 },
  ];

  // New data for trend analysis
  const trendData = [
    { name: 'Week 1', newTickets: 32, resolvedTickets: 28, openTickets: 42 },
    { name: 'Week 2', newTickets: 40, resolvedTickets: 35, openTickets: 47 },
    { name: 'Week 3', newTickets: 35, resolvedTickets: 38, openTickets: 44 },
    { name: 'Week 4', newTickets: 45, resolvedTickets: 40, openTickets: 49 },
  ];

  // New data for SLA trend
  const slaTrendData = [
    { name: 'Jan', compliance: 94 },
    { name: 'Feb', compliance: 89 },
    { name: 'Mar', compliance: 91 },
    { name: 'Apr', compliance: 87 },
    { name: 'May', compliance: 90 },
    { name: 'Jun', compliance: 92 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Function to get report data based on active tab
  const getReportData = (reportType: string) => {
    switch (reportType) {
      case "performance":
        return {
          title: "Performance Report",
          data: performanceData,
          metrics: ["Average Response Time", "Average Resolution Time"]
        };
      case "tickets":
        return {
          title: "Tickets Report",
          data: ticketVolumeData,
          metrics: ["Volume by Category"]
        };
      case "agents":
        return {
          title: "Agent Performance Report",
          data: agentPerformanceData,
          metrics: ["Tickets Resolved", "Tickets Reopened", "Satisfaction %"]
        };
      case "sla":
        return {
          title: "SLA Compliance Report",
          data: slaTrendData,
          metrics: ["Compliance Rate"]
        };
      default:
        return {
          title: "Report",
          data: [],
          metrics: []
        };
    }
  };

  // Convert JSON data to CSV format
  const convertToCSV = (objArray: any[]) => {
    if (!objArray.length) return '';
    
    const header = Object.keys(objArray[0]);
    const headerString = header.join(',');
    
    const rows = objArray.map(obj => {
      return header.map(key => {
        let value = obj[key];
        // Handle values that contain commas or quotes
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    return `${headerString}\n${rows.join('\n')}`;
  };

  // Function to download data as a file
  const downloadFile = (content: string, fileName: string, fileType: string) => {
    const blob = new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to download data as a file
  const handleExport = (reportType: string) => {
    const report = getReportData(reportType);
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${report.title.replace(/\s+/g, '_')}_${timestamp}`;
    
    // Log the export action
    console.log("Exporting report:", {
      reportType,
      dateRange,
      timestamp: new Date().toISOString(),
      format: exportFormat,
    });
    
    switch (exportFormat) {
      case "Excel":
        // Convert data to CSV (Excel can open CSV files)
        const csvContent = convertToCSV(report.data);
        downloadFile(csvContent, `${fileName}.csv`, 'text/csv');
        break;
      case "Word":
        // Create a simple HTML document that Word can open
        const wordContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${report.title}</title>
          </head>
          <body>
            <h1>${report.title}</h1>
            <p>Date Range: ${dateRange}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <h2>Data</h2>
            <table border="1" cellpadding="5">
              <tr>
                ${Object.keys(report.data[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
              ${report.data.map(row => `
                <tr>
                  ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                </tr>
              `).join('')}
            </table>
          </body>
          </html>
        `;
        downloadFile(wordContent, `${fileName}.html`, 'text/html');
        break;
      case "PowerPoint":
        // Create a simple HTML representation for PowerPoint
        const pptContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${report.title}</title>
            <style>
              .slide { page-break-after: always; margin: 50px; padding: 20px; border: 1px solid #ddd; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; border: 1px solid #ddd; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="slide">
              <h1>${report.title}</h1>
              <p>Date Range: ${dateRange}</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
            <div class="slide">
              <h2>Data Overview</h2>
              <table>
                <tr>
                  ${Object.keys(report.data[0]).map(key => `<th>${key}</th>`).join('')}
                </tr>
                ${report.data.map(row => `
                  <tr>
                    ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                  </tr>
                `).join('')}
              </table>
            </div>
          </body>
          </html>
        `;
        downloadFile(pptContent, `${fileName}.html`, 'text/html');
        break;
      default:
        // Default to CSV
        const defaultContent = convertToCSV(report.data);
        downloadFile(defaultContent, `${fileName}.csv`, 'text/csv');
    }
    
    toast.success(`${reportType} report exported as ${exportFormat}`, {
      description: "Your report has been downloaded."
    });
  };

  const handleSchedule = (reportType: string) => {
    const scheduleOptions = ['Daily', 'Weekly', 'Monthly'];
    const recipientOptions = ['Self', 'Team', 'Management'];
    
    // In a real app, we would save this preference to the user's settings
    console.log("Scheduling report:", reportType);
    
    toast.success(`${reportType} report scheduled`, {
      description: "You'll receive this report weekly via email."
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <div className="flex space-x-2 items-center">
          <Select defaultValue={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastWeek">Last Week</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="lastQuarter">Last Quarter</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range...</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => {
                  setExportFormat("Excel");
                  handleExport(activeTab);
                }}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  <span>Excel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setExportFormat("Word");
                  handleExport(activeTab);
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Word</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setExportFormat("PowerPoint");
                  handleExport(activeTab);
                }}>
                  <Presentation className="h-4 w-4 mr-2" />
                  <span>PowerPoint</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={() => handleSchedule(activeTab)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response & Resolution Time</CardTitle>
              <CardDescription>
                Average time to first response and resolution in hours
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgResponse" name="Avg. Response Time (hrs)" fill="#8884d8" />
                  <Bar dataKey="avgResolution" name="Avg. Resolution Time (hrs)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance</CardTitle>
              <CardDescription>
                Percentage of tickets resolved within SLA timeframe
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[100px]">
              <div className="flex items-center justify-center h-full">
                <span className="text-5xl font-bold text-green-500">{slaCompliance}%</span>
                <span className="ml-4 text-sm text-gray-500">
                  +5% from previous month
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ticket Trend Analysis</CardTitle>
              <CardDescription>
                New, resolved, and open tickets over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newTickets" name="New Tickets" stroke="#8884d8" />
                  <Line type="monotone" dataKey="resolvedTickets" name="Resolved Tickets" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="openTickets" name="Open Tickets" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Volume by Category</CardTitle>
              <CardDescription>
                Distribution of tickets across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketVolumeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {ticketVolumeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Status Overview</CardTitle>
              <CardDescription>
                Current state of all active tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-700">Open</h3>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-700">In Progress</h3>
                  <p className="text-2xl font-bold">18</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-700">Resolved</h3>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-red-700">Escalated</h3>
                  <p className="text-2xl font-bold">7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>
                Comparison of agent performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved" name="Tickets Resolved" fill="#8884d8" />
                  <Bar dataKey="reopened" name="Tickets Reopened" fill="#FF8042" />
                  <Bar dataKey="satisfaction" name="Satisfaction %" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Agent</CardTitle>
              <CardDescription>
                Agent with highest resolution rate and satisfaction score
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-support-purple-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-support-purple-600">SL</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Sara Lee</h3>
                  <p className="text-sm text-gray-500">50 tickets resolved, 95% satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance Trend</CardTitle>
              <CardDescription>
                Historical SLA compliance rate over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slaTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="compliance" name="SLA Compliance %" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SLA Breach Analysis</CardTitle>
              <CardDescription>
                Insights into tickets that breached SLA
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700">Top Breach Reason</h3>
                  <p className="text-xl font-bold mt-2">Insufficient Resources</p>
                  <p className="text-sm text-gray-500 mt-1">42% of all breaches</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700">Most Common Category</h3>
                  <p className="text-xl font-bold mt-2">Technical Support</p>
                  <p className="text-sm text-gray-500 mt-1">35% of all breaches</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700">Average Breach Time</h3>
                  <p className="text-xl font-bold mt-2">5.2 hours</p>
                  <p className="text-sm text-gray-500 mt-1">Beyond SLA deadline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
