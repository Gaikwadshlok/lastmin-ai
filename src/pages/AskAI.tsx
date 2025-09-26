import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, Lightbulb, Calculator, Atom, Database, BookOpen, PenTool, Clock, Target } from "lucide-react";
import Header from "@/components/Header";
import ChatBot from "@/components/ChatBot";

const AskAI = () => {
  // Local state kept for suggestion chips input prefill (ChatBot manages sending)
  const [message, setMessage] = useState('');
  const [isTyping] = useState(false);

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
    // Deprecated local sender – ChatBot handles sending.
    // We only keep this to clear the local input used by chips.
    if (!message.trim()) return;
    setMessage('');
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Study Assistant
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get instant help with your doubts. Ask questions about your syllabus and get detailed explanations.
            </p>
          </motion.div>

          {/* Chat Interface (wired to backend) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ChatBot />
          </motion.div>

          {/* Quick Actions Section with Single Infinite Loop */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 mt-12"
          >
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
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AskAI;
