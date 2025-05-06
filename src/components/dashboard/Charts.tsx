
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ticketData = [
  { name: "Mon", tickets: 12 },
  { name: "Tue", tickets: 19 },
  { name: "Wed", tickets: 15 },
  { name: "Thu", tickets: 24 },
  { name: "Fri", tickets: 18 },
  { name: "Sat", tickets: 10 },
  { name: "Sun", tickets: 8 },
];

const categoryData = [
  { name: "Technical", value: 35 },
  { name: "Billing", value: 25 },
  { name: "Account", value: 20 },
  { name: "Product", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ["#8b5cf6", "#c4b5fd", "#a78bfa", "#7e69ab", "#6e59a5"];

const responseTimeData = [
  { name: "Jan", time: 35 },
  { name: "Feb", time: 30 },
  { name: "Mar", time: 25 },
  { name: "Apr", time: 28 },
  { name: "May", time: 20 },
  { name: "Jun", time: 18 },
  { name: "Jul", time: 16 },
];

const Charts = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Ticket Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Tickets by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;
