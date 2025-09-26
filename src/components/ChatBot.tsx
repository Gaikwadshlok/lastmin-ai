import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  Shuffle,
  Mic,
  Globe,
  Wifi,
  WifiOff
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { aiService } from "@/services/aiService.js";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestions?: string[];
}

const ChatBot = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    // Start with empty messages array for clean startup
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [webAccessEnabled, setWebAccessEnabled] = useState(false);

  // Auto-scroll to bottom when messages change or typing state changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Predefined suggestions (dynamic based on web access)
  const suggestions = webAccessEnabled ? [
    "What's the latest news in technology?",
    "Search for current weather information", 
    "Find recent research papers on this topic",
    "What's trending on social media today?",
    "Get current stock market updates"
  ] : [
    "Tell me more about this topic",
    "Show me examples", 
    "Quiz me on this",
    "Explain this concept simply",
    "Create study notes for this"
  ];

  // Typing animation (bouncing dots)
  const TypingIndicator = () => (
    <div className="flex gap-1 items-center">
      {[0, 150, 300].map((delay, i) => (
        <span
          key={i}
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setSending(true);

    try {
      let response;
      
      if (webAccessEnabled) {
        // Use web-enabled chat endpoint
        response = await fetch('http://localhost:9002/api/ai/chat-web', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            message: inputMessage,
            urls: [], // Could be enhanced to extract URLs from message
            context: ''
          })
        });
        
        if (!response.ok) {
          throw new Error('Web chat request failed');
        }
        
        const webData = await response.json();
        response = webData;
      } else {
        // Use regular chat
        response = await aiService.chat(inputMessage, "");
      }
      
      const aiContent =
        response.data?.data?.response ||
        response.data?.response ||
        "I'm here to help! Could you please rephrase your question?";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        sender: "bot",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: webAccessEnabled 
            ? "Sorry, I'm having trouble accessing the web right now. Make sure the Chrome extension bridge is running and try again."
            : "Sorry, I'm having trouble connecting right now. Please try again later.",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
      setSending(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    setInputMessage(suggestion);
    await handleSendMessage();
  };

  return (
    <div className="bg-background flex flex-col h-[500px] max-h-[500px] border border-border/20 rounded-lg overflow-hidden no-sparkle">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Study Assistant</h1>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <ScrollArea className="flex-1 px-4">
            <div className="py-3 space-y-4">
              {messages.length === 0 ? (
                // Empty state for startup
                <div className="flex flex-col items-center justify-start h-full text-center px-4 pt-16">
                  <h2 className="text-5xl font-bold mb-3" style={{ color: 'hsl(260, 75%, 65%)' }}>
                    Hello, {user?.name?.split(' ')[0]?.toUpperCase() || 'STUDENT'}
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Want to try out a few things?
                  </p>
                </div>
              ) : (
                // Show messages when they exist
                <>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.sender === "user" ? (
                        // User message (right side)
                        <>
                          <div className="flex flex-col items-end max-w-[70%]">
                            <div className="text-sm text-muted-foreground mb-1">
                              You
                            </div>
                            <div className="bg-primary/20 border border-primary/30 rounded-lg px-4 py-3 mb-1">
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true
                              })}
                            </div>
                          </div>
                          <div className="bg-muted/80 p-2 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </>
                      ) : (
                        // Bot message (left side)
                        <>
                          <div className="flex-shrink-0">
                            <div className="bg-primary/20 p-2 rounded-lg w-10 h-10 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="text-sm text-muted-foreground">Study Assistant</div>
                            <div className="bg-card/60 border border-border/30 rounded-lg px-4 py-3">
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit", 
                                hour12: true
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="bg-primary/20 p-2 rounded-lg w-10 h-10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-sm text-muted-foreground">Study Assistant</div>
                        <div className="bg-card/60 border border-border/30 rounded-lg px-4 py-3">
                          <TypingIndicator />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              {/* Auto-scroll target */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-border/20 bg-card/30 backdrop-blur-sm">
            <div className="px-4 py-2">
              <div className="flex items-center gap-3 bg-input/60 border border-border/40 rounded-lg px-3 py-2 focus-within:border-primary/50">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 h-auto rounded-lg transition-all duration-200"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    side="top"
                    className="w-72 mb-2 bg-card/95 backdrop-blur-md border-border/50 shadow-xl shadow-primary/20"
                    sideOffset={8}
                  >
                    <div className="p-2 border-b border-border/30 mb-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Quick Suggestions
                      </p>
                    </div>
                    {suggestions.map((suggestion, i) => (
                      <DropdownMenuItem
                        key={i}
                        className="cursor-pointer p-3 m-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 focus:bg-primary/10 focus:text-primary"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                          <span className="text-sm font-medium">{suggestion}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Web Access Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setWebAccessEnabled(!webAccessEnabled)}
                  className={`p-2 h-auto rounded-lg transition-all duration-200 ${
                    webAccessEnabled 
                      ? "text-white bg-green-500 hover:bg-green-600" 
                      : "text-muted-foreground hover:text-green-600 hover:bg-green-50"
                  }`}
                  title={webAccessEnabled ? "Disable web access" : "Enable web access"}
                >
                  {webAccessEnabled ? (
                    <Globe className="h-5 w-5" />
                  ) : (
                    <Wifi className="h-5 w-5" />
                  )}
                </Button>

                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Continue your conversation..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-foreground placeholder-muted-foreground px-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary p-1 h-auto"
                >
                  <Mic className="h-5 w-5" />
                </Button>

                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping || sending}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary p-1 h-auto disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;