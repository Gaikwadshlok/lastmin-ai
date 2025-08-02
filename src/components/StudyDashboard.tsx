import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  MessageCircle, 
  Brain, 
  Download, 
  Play, 
  Clock,
  Target,
  TrendingUp,
  FileText
} from "lucide-react";

const StudyDashboard = () => {
  const studyStats = {
    notesGenerated: 15,
    questionsAnswered: 89,
    studyTime: "4h 32m",
    accuracy: 78
  };

  const recentNotes = [
    { title: "Quantum Physics - Chapter 1", pages: 12, date: "2 hours ago" },
    { title: "Organic Chemistry Basics", pages: 8, date: "1 day ago" },
    { title: "Data Structures Overview", pages: 15, date: "2 days ago" }
  ];

  return (
    <section className="py-20 bg-gradient-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Study Dashboard
            </h2>
            <p className="text-lg text-muted-foreground">
              Track your progress and access all your study materials in one place
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-card border-0">
              <CardContent className="p-4 text-center">
                <div className="bg-primary-lighter p-3 rounded-lg w-fit mx-auto mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{studyStats.notesGenerated}</p>
                <p className="text-sm text-muted-foreground">Notes Generated</p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardContent className="p-4 text-center">
                <div className="bg-accent/20 p-3 rounded-lg w-fit mx-auto mb-2">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-foreground">{studyStats.questionsAnswered}</p>
                <p className="text-sm text-muted-foreground">Questions Solved</p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardContent className="p-4 text-center">
                <div className="bg-warning/20 p-3 rounded-lg w-fit mx-auto mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <p className="text-2xl font-bold text-foreground">{studyStats.studyTime}</p>
                <p className="text-sm text-muted-foreground">Study Time</p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardContent className="p-4 text-center">
                <div className="bg-accent/20 p-3 rounded-lg w-fit mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-foreground">{studyStats.accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="bg-primary-lighter p-4 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">View Notes</CardTitle>
                <CardDescription>
                  Access your AI-generated study notes and summaries
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="study" className="w-full">
                  Open Notes
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="bg-accent/20 p-4 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-lg">Start Chat</CardTitle>
                <CardDescription>
                  Get instant help with your doubts from AI tutor
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="success" className="w-full">
                  Ask Question
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="bg-warning/20 p-4 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-warning" />
                </div>
                <CardTitle className="text-lg">Revise Mode</CardTitle>
                <CardDescription>
                  Practice with flashcards and personalized quizzes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="warning" className="w-full">
                  <Play className="h-4 w-4" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="bg-destructive/20 p-4 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Download className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-lg">Download PDF</CardTitle>
                <CardDescription>
                  Export your notes as PDF for offline studying
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full">
                  Export PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notes */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Recent Notes
              </CardTitle>
              <CardDescription>
                Your recently generated study materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotes.map((note, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-lighter p-2 rounded">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{note.title}</h4>
                        <p className="text-sm text-muted-foreground">{note.pages} pages • {note.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{note.pages} pages</Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StudyDashboard;