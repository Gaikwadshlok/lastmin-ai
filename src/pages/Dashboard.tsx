import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, MessageSquare, FileText, BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Dashboard = () => {
  const features = [
    {
      icon: Upload,
      title: "Upload Study Materials",
      description: "Upload PDFs, documents, or images to get started",
      action: "Upload Files",
      color: "bg-blue-500/20 border-blue-500/30",
      link: "/syllabus"
    },
    {
      icon: MessageSquare,
      title: "AI Chat Tutor",
      description: "Get instant help and explanations from your AI tutor",
      action: "Start Chat",
      color: "bg-purple-500/20 border-purple-500/30",
      link: "/ask-ai"
    },
    {
      icon: FileText,
      title: "Generate Summaries",
      description: "Create concise summaries of your study materials",
      action: "Create Summary",
      color: "bg-green-500/20 border-green-500/30",
      link: "/syllabus"
    },
    {
      icon: Target,
      title: "Practice Quiz",
      description: "Test your knowledge with AI-generated quizzes",
      action: "Take Quiz",
      color: "bg-orange-500/20 border-orange-500/30",
      link: "/quiz"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-16 sm:pt-20">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Welcome Section */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Welcome to LastMin AI
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto px-4">
              Your intelligent study companion is ready to help you learn faster and more effectively.
              Choose how you'd like to get started below.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Link to={feature.link}>
                  <Card className={`bg-card/80 backdrop-blur-sm border-border hover:shadow-glow active:shadow-glow-strong transition-all duration-300 cursor-pointer group ${feature.color} h-full flex flex-col touch-manipulation`}>
                    <CardHeader className="space-y-3 sm:space-y-4 p-5 sm:p-6 flex-grow">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="bg-gradient-primary p-2 sm:p-2.5 rounded-lg group-hover:scale-110 group-active:scale-105 transition-transform">
                          <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-lg sm:text-xl lg:text-2xl text-foreground">
                          {feature.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6 pt-0 mt-auto">
                      <Button 
                        className="w-full bg-gradient-primary hover:opacity-90 active:opacity-80 shadow-soft text-sm sm:text-base lg:text-lg h-12 sm:h-14 touch-manipulation font-medium"
                      >
                        {feature.action}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <Card className="bg-card/80 backdrop-blur-sm border-border text-center">
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">0</div>
                <div className="text-sm sm:text-base text-muted-foreground">Documents Uploaded</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border text-center">
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">0</div>
                <div className="text-sm sm:text-base text-muted-foreground">Study Sessions</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border text-center">
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">0</div>
                <div className="text-sm sm:text-base text-muted-foreground">Quizzes Completed</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-foreground text-lg sm:text-xl">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No recent activity yet.</p>
                  <p className="text-xs sm:text-sm mt-1 sm:mt-2">Start by uploading your first study material!</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
