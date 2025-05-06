
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-2">Enter your credentials to sign in</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-support-purple-600 hover:text-support-purple-500">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Demo logins:<br/>
          admin@example.com | agent@example.com | leader@example.com | manager@example.com | user@example.com<br/>
          (any password will work)
        </p>
      </div>

      <div className="mt-4 text-center text-sm">
        <span className="text-gray-500">Don't have an account?</span>{" "}
        <Link to="/register" className="text-support-purple-600 hover:text-support-purple-500">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
