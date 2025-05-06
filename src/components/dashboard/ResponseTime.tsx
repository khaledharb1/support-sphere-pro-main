
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ResponseTimeProps {
  userRole?: string;
}

const ResponseTime = ({ userRole }: ResponseTimeProps) => {
  // Data would normally come from an API based on the user role
  const data = [
    { name: "Mon", time: 2.4 },
    { name: "Tue", time: 1.8 },
    { name: "Wed", time: 3.2 },
    { name: "Thu", time: 2.5 },
    { name: "Fri", time: 1.5 },
    { name: "Sat", time: 0.8 },
    { name: "Sun", time: 1.2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time (Hours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ResponseTime;
