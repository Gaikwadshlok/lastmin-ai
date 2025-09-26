import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  Shuffle,
  Mic
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { aiService } from "@/services/aiService.js";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestions?: string[];
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1", 
      sender: "user",
      content: "hii",
      timestamp: new Date("2024-01-01T21:02:00"),
    },
    {
      id: "2",
      sender: "bot", 
      content: "That's an interesting question about \"hii\". Here's what I can tell you about it.",
      timestamp: new Date("2024-01-01T21:02:00"),
      suggestions: ["Tell me more about this topic", "Show me examples", "Quiz me on this"]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
      const response = await aiService.chat(inputMessage, "");
      const aiContent =
        response.data?.data?.response ||
        response.data?.response ||
        "I'm here to help! Could you please rephrase your question?";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        sender: "bot",
        timestamp: new Date(),
        suggestions: [
          "Tell me more about this topic",
          "Show me examples", 
          "Quiz me on this"
        ]
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content:
            "Sorry, I'm having trouble connecting right now. Please try again later.",
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <ScrollArea className="flex-1 px-6">
            <div className="py-6 space-y-6">
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
                          hii
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
                        <div className="text-sm text-muted-foreground">
                          Study Assistant
                        </div>
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

                        {/* Suggestion Pills */}
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.suggestions.map((suggestion, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                className="rounded-full text-xs h-8 px-4 bg-muted/30 border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
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

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border/20 bg-card/30 backdrop-blur-sm">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3 bg-input/60 border border-border/40 rounded-lg px-4 py-3 focus-within:border-primary/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary p-1 h-auto"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary p-1 h-auto"
                >
                  <Shuffle className="h-5 w-5" />
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