import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, FileText, Plus, Filter, ChevronRight } from "lucide-react";

// Mock data for KB articles
const kbArticles = [
  {
    id: 1,
    title: "How to reset your password",
    description:
      "Learn how to reset your password if you've forgotten it or need to change it for security reasons.",
    category: "Account",
    subcategory: "Authentication",
    views: 1245,
    helpfulness: 92,
    updatedAt: "2023-04-15",
  },
  {
    id: 2,
    title: "Connecting your email account",
    description:
      "Step-by-step guide to connect your email account to our platform.",
    category: "Email",
    subcategory: "Setup",
    views: 934,
    helpfulness: 89,
    updatedAt: "2023-03-20",
  },
  {
    id: 3,
    title: "Understanding billing cycles",
    description:
      "Learn about our billing cycles, when you'll be charged, and how to manage your subscription.",
    category: "Billing",
    subcategory: "Subscriptions",
    views: 1102,
    helpfulness: 87,
    updatedAt: "2023-02-10",
  },
  {
    id: 4,
    title: "Troubleshooting login issues",
    description:
      "Common login problems and their solutions to help you access your account.",
    category: "Account",
    subcategory: "Authentication",
    views: 2390,
    helpfulness: 95,
    updatedAt: "2023-04-01",
  },
  {
    id: 5,
    title: "Setting up two-factor authentication",
    description:
      "Enhance your account security by enabling two-factor authentication.",
    category: "Security",
    subcategory: "Authentication",
    views: 876,
    helpfulness: 91,
    updatedAt: "2023-03-05",
  },
  {
    id: 6,
    title: "Exporting your data",
    description:
      "How to export your data from our platform in various formats.",
    category: "Data",
    subcategory: "Export",
    views: 567,
    helpfulness: 85,
    updatedAt: "2023-02-15",
  },
];

// Mock categories
const categories = [
  { name: "Account", count: 12 },
  { name: "Billing", count: 8 },
  { name: "Email", count: 6 },
  { name: "Security", count: 5 },
  { name: "Data", count: 4 },
  { name: "API", count: 7 },
  { name: "Integration", count: 3 },
];

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();

  const canCreateArticle = user?.role !== "user";

  const filteredArticles = kbArticles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const popularArticles = [...kbArticles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        {canCreateArticle && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-support-purple-100 to-transparent opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How can we help you today?
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Search our knowledge base for answers to common questions
          </p>
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search for articles..."
                className="pl-10 text-lg py-6"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="articles">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6 pt-6">
          {searchQuery && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">
                Search Results for "{searchQuery}"
                {selectedCategory !== "all" && (
                  <span> in {selectedCategory}</span>
                )}{" "}
                ({filteredArticles.length})
              </h2>
              {filteredArticles.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Try adjusting your search or category selection
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}>
                      Clear filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!searchQuery && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Popular Articles</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {popularArticles.map((article) => (
                  <Card key={article.id}>
                    <CardHeader className="py-4">
                      <Badge className="w-fit mb-2">{article.category}</Badge>
                      <CardTitle className="text-base hover:text-support-purple-600 hover:underline">
                        <Link to={`/knowledge/${article.id}`}>
                          {article.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {article.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredArticles.length > 0 && (searchQuery || selectedCategory !== "all") && (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <Badge className="w-fit">{article.category}</Badge>
                      <div className="text-xs text-gray-500">
                        Updated {article.updatedAt}
                      </div>
                    </div>
                    <CardTitle className="text-lg hover:text-support-purple-600 hover:underline">
                      <Link to={`/knowledge/${article.id}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-gray-600">{article.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{article.views}</span> views
                        <span className="mx-2">•</span>
                        <span className="font-medium">{article.helpfulness}%</span>{" "}
                        found helpful
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/knowledge/${article.id}`}>
                          Read more
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!searchQuery && selectedCategory === "all" && (
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.name} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">{category.name}</h2>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View all
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {kbArticles
                      .filter((article) => article.category === category.name)
                      .slice(0, 2)
                      .map((article) => (
                        <Card key={article.id}>
                          <CardHeader className="py-4">
                            <CardTitle className="text-base hover:text-support-purple-600 hover:underline">
                              <Link to={`/knowledge/${article.id}`}>
                                {article.title}
                              </Link>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {article.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.name}
                className="hover:border-support-purple-300 hover:shadow-md transition-all"
              >
                <CardHeader className="py-6">
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    {category.count} articles
                  </p>
                  <Button variant="outline" size="sm">
                    Browse articles
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border bg-card p-6 shadow-sm mt-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold">Can't find what you need?</h2>
          <p className="mt-2 text-muted-foreground">
            Our support team is ready to assist you with any questions
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild>
              <Link to="/tickets/create">Submit a ticket</Link>
            </Button>
            <Button variant="outline">Contact support</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
