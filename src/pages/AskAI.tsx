import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, Lightbulb, Calculator, Atom, Database, BookOpen, PenTool, Clock, Target } from "lucide-react";
import Header from "@/components/Header";

const AskAI = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { 
      icon: Lightbulb, 
      title: 'Explain Concepts', 
      description: 'Get detailed explanations of complex topics'
    },
    { 
      icon: Calculator, 
      title: 'Solve Problems', 
      description: 'Step-by-step problem solving assistance'
    },
    { 
      icon: Atom, 
      title: 'Study Tips', 
      description: 'Personalized study strategies and tips'
    },
    { 
      icon: Database, 
      title: 'Science Help', 
      description: 'Assistance with scientific concepts and formulas'
    },
    { 
      icon: BookOpen, 
      title: 'Topic Summary', 
      description: 'Quick summaries of important topics'
    },
    { 
      icon: PenTool, 
      title: 'Essay Help', 
      description: 'Writing assistance and essay structure guidance'
    },
    { 
      icon: Clock, 
      title: 'Quick Review', 
      description: 'Fast revision for last-minute preparation'
    },
    { 
      icon: Target, 
      title: 'Exam Focus', 
      description: 'Target specific exam topics and questions'
    }
  ];

  const suggestionChips = [
    'Explain quantum mechanics basics',
    'Help with calculus derivatives',
    'Organic chemistry reactions',
    'Data structures concepts'
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessage('');
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-16 sm:pt-20">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Study Assistant
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get instant help with your doubts. Ask questions about your syllabus and get detailed explanations.
            </p>
          </div>

          {/* Chat Interface */}
          <Card className="bg-card/95 backdrop-blur-md border-2 border-white/10 shadow-2xl shadow-primary/25 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Study Bot
                <span className="ml-auto text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                  Online
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* AI Introduction Message */}
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-600 p-2 rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">
                      Hi! I'm your AI study assistant. I can help you with doubts about your uploaded syllabus, explain concepts, 
                      solve problems, and provide additional context. What would you like to know?
                    </p>
                    
                    {/* Suggestion Chips */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {suggestionChips.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-sm transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-600 p-2 rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your syllabus..."
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 pr-12 h-12"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isTyping}
                  className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Section with Single Infinite Loop */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Quick actions:</h2>
            
            <style>
              {`
                @keyframes marquee-infinite {
                  from { transform: translateX(0); }
                  to { transform: translateX(-100%); }
                }
                .animate-marquee-infinite {
                  animation: marquee-infinite 40s linear infinite;
                }
                .animate-marquee-infinite:hover {
                  animation-play-state: paused;
                }
              `}
            </style>
            
            <div className="relative overflow-hidden">
              <div className="flex w-full overflow-hidden">
                <div className="flex flex-shrink-0 py-2 animate-marquee-infinite">
                  {/* All quick actions in one continuous loop */}
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <div key={`action-p1-${index}`} className="px-3 flex-shrink-0">
                        <Card className="bg-card/95 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer w-72 h-56 rounded-2xl hover:scale-110 hover:z-10 hover:shadow-2xl hover:shadow-purple-500/25 hover:border-purple-500">
                          <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                            <Icon className="h-6 w-6 text-purple-400 mb-4" />
                            <h3 className="text-white font-medium text-sm mb-3 leading-tight">{action.title}</h3>
                            <p className="text-gray-400 text-xs leading-relaxed px-3">{action.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                  {/* Duplicate for seamless loop */}
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <div key={`action-p2-${index}`} className="px-3 flex-shrink-0">
                        <Card className="bg-card/95 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer w-72 h-56 rounded-2xl hover:scale-110 hover:z-10 hover:shadow-2xl hover:shadow-purple-500/25 hover:border-purple-500">
                          <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                            <Icon className="h-6 w-6 text-purple-400 mb-4" />
                            <h3 className="text-white font-medium text-sm mb-3 leading-tight">{action.title}</h3>
                            <p className="text-gray-400 text-xs leading-relaxed px-3">{action.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AskAI;
