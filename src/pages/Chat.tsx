import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User, MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  content: string;
  sender: string;
  senderType: "user" | "agent";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  lastMessage: string;
  unread: number;
  status: "active" | "closed";
  timestamp: Date;
}

const MOCK_CHATS: ChatSession[] = [
  {
    id: "chat1",
    user: {
      name: "Jane Cooper",
      email: "jane@example.com",
    },
    lastMessage: "I'm having trouble with my order",
    unread: 2,
    status: "active",
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  },
  {
    id: "chat2",
    user: {
      name: "Robert Fox",
      email: "robert@example.com",
    },
    lastMessage: "When will my ticket be resolved?",
    unread: 0,
    status: "active",
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: "chat3",
    user: {
      name: "Leslie Alexander",
      email: "leslie@example.com",
    },
    lastMessage: "Thanks for your help!",
    unread: 0,
    status: "closed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  chat1: [
    {
      id: "msg1",
      content: "Hello, I'm having trouble with my recent order #12345. It says delivered but I haven't received anything.",
      sender: "Jane Cooper",
      senderType: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 10)
    },
    {
      id: "msg2",
      content: "I'm sorry to hear that. Let me look into your order right away.",
      sender: "Support Agent",
      senderType: "agent",
      timestamp: new Date(Date.now() - 1000 * 60 * 8)
    },
    {
      id: "msg3",
      content: "Thank you. I really need this order soon.",
      sender: "Jane Cooper",
      senderType: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 7)
    },
    {
      id: "msg4",
      content: "I can see that your order was marked as delivered yesterday. Let me contact the delivery service for more information.",
      sender: "Support Agent",
      senderType: "agent",
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: "msg5",
      content: "How long will that take?",
      sender: "Jane Cooper",
      senderType: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 3)
    }
  ],
  chat2: [
    {
      id: "msg1",
      content: "Hi there, I submitted a ticket #5678 three days ago but haven't heard back. When will it be resolved?",
      sender: "Robert Fox",
      senderType: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 40)
    },
    {
      id: "msg2",
      content: "Let me check on that ticket for you right away.",
      sender: "Support Agent",
      senderType: "agent",
      timestamp: new Date(Date.now() - 1000 * 60 * 35)
    },
    {
      id: "msg3",
      content: "I see that your ticket is assigned to our technical team. They're working on it and should have an update by tomorrow.",
      sender: "Support Agent",
      senderType: "agent",
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    }
  ]
};

const Chat = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [activeChatId, setActiveChatId] = useState<string | null>("chat1");
  const [inputMessage, setInputMessage] = useState("");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(MOCK_CHATS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);

  const filteredChats = chatSessions.filter(chat => 
    activeTab === "all" || 
    (activeTab === "active" && chat.status === "active") || 
    (activeTab === "closed" && chat.status === "closed")
  );

  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];
  const currentChat = chatSessions.find(chat => chat.id === activeChatId);

  const sendMessage = () => {
    if (!inputMessage.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      content: inputMessage,
      sender: `${user?.name || "Support Agent"}`,
      senderType: "agent",
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));

    // Update last message in chat list
    setChatSessions(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, lastMessage: inputMessage, unread: 0 }
          : chat
      )
    );

    setInputMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Live Chat</h1>
      </div>

      <div className="flex flex-1 gap-4 h-full overflow-hidden">
        {/* Chat List */}
        <Card className="w-full max-w-xs flex flex-col">
          <CardHeader className="p-4 pb-2">
            <CardTitle>Conversations</CardTitle>
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <ScrollArea className="h-full">
              {filteredChats.length > 0 ? (
                <div className="divide-y">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                        activeChatId === chat.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        setActiveChatId(chat.id);
                        // Mark as read when selected
                        setChatSessions(prev =>
                          prev.map(c =>
                            c.id === chat.id ? { ...c, unread: 0 } : c
                          )
                        );
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={chat.user.avatar} />
                          <AvatarFallback>
                            {chat.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">{chat.user.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage}
                          </p>
                        </div>
                        {chat.unread > 0 && (
                          <span className="flex items-center justify-center h-5 w-5 bg-support-purple-500 text-white text-xs rounded-full">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations found
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="flex-1 flex flex-col">
          {activeChatId && currentChat ? (
            <>
              <CardHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={currentChat.user.avatar} />
                      <AvatarFallback>
                        {currentChat.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{currentChat.user.name}</CardTitle>
                      <CardDescription>{currentChat.user.email}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === "agent" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderType === "agent"
                            ? "bg-support-purple-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderType === "agent" ? "text-white/70" : "text-gray-500"
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                >
                  <Input
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                  />
                  <Button type="submit" disabled={!inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No chat selected</h3>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;
