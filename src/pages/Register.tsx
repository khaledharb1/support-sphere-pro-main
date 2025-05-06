
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const { register, isLoading } = useAuth();

  const validateEmail = (value: string) => {
    if (!value.endsWith("@Genena.com")) {
      setEmailError("Email must end with @Genena.com");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }
    
    try {
      await register(name, email, password, empCode, company);
      // Success notification already handled in AuthContext
      toast.success("Registration successful! An admin will assign your role.");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-gray-500 mt-2">Enter your information to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="empCode">Employee Code</Label>
          <Input
            id="empCode"
            placeholder="EMP001"
            value={empCode}
            onChange={(e) => setEmpCode(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Genena Inc."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email (@Genena.com)</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@Genena.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={emailError ? "border-red-500" : ""}
            onBlur={(e) => validateEmail(e.target.value)}
          />
          {emailError && <p className="text-sm text-red-500">{emailError}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
            ) : (
              "Create account"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center text-sm">
        <p className="text-gray-500 mb-2">
          After registration, an administrator will assign your system role.
        </p>
        <span className="text-gray-500">Already have an account?</span>{" "}
        <Link to="/login" className="text-support-purple-600 hover:text-support-purple-500">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
