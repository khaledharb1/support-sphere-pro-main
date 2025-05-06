
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TicketCategoriesProps {
  category: string;
  setCategory: (value: string) => void;
  subcategory: string;
  setSubcategory: (value: string) => void;
}

const TicketCategories = ({
  category,
  setCategory,
  subcategory,
  setSubcategory,
}: TicketCategoriesProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="category" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          Category
        </Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="account">Account</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subcategory">Subcategory</Label>
        <Select value={subcategory} onValueChange={setSubcategory}>
          <SelectTrigger id="subcategory">
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {category === "technical" && (
              <>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="app">Mobile App</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
              </>
            )}
            {category === "billing" && (
              <>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
              </>
            )}
            {category === "account" && (
              <>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </>
            )}
            {category === "product" && (
              <>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default TicketCategories;
