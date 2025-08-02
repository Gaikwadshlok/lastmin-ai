import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Target,
  Timer,
  Trophy
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const QuizMode = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft] = useState(300); // 5 minutes

  const questions: Question[] = [
    {
      id: '1',
      question: "What is the fundamental principle behind quantum superposition?",
      options: [
        "Particles can only exist in one state at a time",
        "Particles can exist in multiple states simultaneously until measured",
        "Particles always collapse to their ground state",
        "Particles cannot be observed directly"
      ],
      correctAnswer: 1,
      explanation: "Quantum superposition allows particles to exist in multiple states simultaneously until a measurement collapses the wave function.",
      difficulty: 'Medium'
    },
    {
      id: '2',
      question: "Which data structure uses LIFO (Last In, First Out) principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correctAnswer: 1,
      explanation: "A stack follows the LIFO principle where the last element added is the first one to be removed.",
      difficulty: 'Easy'
    }
  ];

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showAnswer) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowAnswer(true);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-accent/20 text-accent';
      case 'Medium': return 'bg-warning/20 text-warning';
      case 'Hard': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quizStarted) {
    return (
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Quiz & Revision Mode
              </h2>
              <p className="text-lg text-muted-foreground">
                Test your knowledge with AI-generated questions based on your syllabus
              </p>
            </div>

            {/* Quiz Options */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="bg-accent/20 p-4 rounded-xl w-fit mx-auto mb-4">
                    <Target className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle>Quick Quiz</CardTitle>
                  <CardDescription>5 questions • 5 minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="success" className="w-full" onClick={handleStartQuiz}>
                    <Play className="h-4 w-4" />
                    Start Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="bg-warning/20 p-4 rounded-xl w-fit mx-auto mb-4">
                    <Timer className="h-8 w-8 text-warning" />
                  </div>
                  <CardTitle>Practice Mode</CardTitle>
                  <CardDescription>15 questions • No time limit</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="warning" className="w-full">
                    <Play className="h-4 w-4" />
                    Practice
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="bg-primary/20 p-4 rounded-xl w-fit mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Challenge Mode</CardTitle>
                  <CardDescription>30 questions • 20 minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="hero" className="w-full">
                    <Play className="h-4 w-4" />
                    Challenge
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Flashcard Option */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  Flashcard Review
                </CardTitle>
                <CardDescription>
                  Review key concepts with interactive flashcards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="study" size="lg">
                  Start Flashcards
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">Quick Quiz</h2>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  <Timer className="h-3 w-3 mr-1" />
                  {formatTime(timeLeft)}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
              </div>
            </div>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="shadow-card border-0 mb-6">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <Badge className={getDifficultyColor(questions[currentQuestion].difficulty)}>
                  {questions[currentQuestion].difficulty}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-xl font-bold text-foreground">{score}/{questions.length}</p>
                </div>
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {questions[currentQuestion].question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showAnswer}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? showAnswer
                        ? index === questions[currentQuestion].correctAnswer
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-primary bg-primary/10'
                      : showAnswer && index === questions[currentQuestion].correctAnswer
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                      selectedAnswer === index
                        ? showAnswer
                          ? index === questions[currentQuestion].correctAnswer
                            ? 'border-accent bg-accent text-accent-foreground'
                            : 'border-destructive bg-destructive text-destructive-foreground'
                          : 'border-primary bg-primary text-primary-foreground'
                        : showAnswer && index === questions[currentQuestion].correctAnswer
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                    {showAnswer && index === questions[currentQuestion].correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-accent ml-auto" />
                    )}
                    {showAnswer && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && (
                      <XCircle className="h-5 w-5 text-destructive ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Explanation */}
          {showAnswer && (
            <Card className="shadow-card border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {questions[currentQuestion].explanation}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setQuizStarted(false)}>
              Exit Quiz
            </Button>
            
            <div className="flex gap-3">
              {!showAnswer ? (
                <Button 
                  variant="hero" 
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : currentQuestion < questions.length - 1 ? (
                <Button variant="hero" onClick={handleNextQuestion}>
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="success">
                  <Trophy className="h-4 w-4" />
                  View Results
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizMode;