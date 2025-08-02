import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  BookOpen,
  Calculator,
  Atom
} from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI study assistant. I can help you with doubts about your uploaded syllabus, explain concepts, solve problems, and provide additional context. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "Explain quantum mechanics basics",
        "Help with calculus derivatives", 
        "Organic chemistry reactions",
        "Data structures concepts"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "That's a great question! Based on your syllabus, I can help you understand this concept. Let me break it down step by step...",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: [
          "Tell me more about this topic",
          "Show me examples",
          "Quiz me on this"
        ]
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const quickActions = [
    { icon: Lightbulb, label: "Explain Concepts", color: "bg-warning/20 text-warning" },
    { icon: Calculator, label: "Solve Problems", color: "bg-primary/20 text-primary" },
    { icon: BookOpen, label: "Study Tips", color: "bg-accent/20 text-accent" },
    { icon: Atom, label: "Science Help", color: "bg-destructive/20 text-destructive" }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI Study Assistant
            </h2>
            <p className="text-lg text-muted-foreground">
              Get instant help with your doubts. Ask questions about your syllabus and get detailed explanations.
            </p>
          </div>

          <Card className="shadow-card border-0 h-[600px] flex flex-col">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <div className="bg-gradient-primary p-2 rounded-lg">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                Study Bot
                <Badge variant="secondary" className="ml-auto">Online</Badge>
              </CardTitle>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.sender === 'bot' && (
                        <div className="bg-primary-lighter p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                        <div className={`p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-gradient-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      {message.sender === 'user' && (
                        <div className="bg-primary/20 p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="bg-primary-lighter p-2 rounded-full w-8 h-8 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="border-t border-border/50 p-4">
                <p className="text-sm text-muted-foreground mb-3">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => handleSuggestionClick(`Help me with ${action.label.toLowerCase()}`)}
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-border/50 p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about your syllabus..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    variant="hero"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ChatBot;