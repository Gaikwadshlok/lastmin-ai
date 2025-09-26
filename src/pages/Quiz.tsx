import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Clock, 
  Trophy, 
  RotateCcw, 
  Play, 
  FileText, 
  File, 
  Upload, 
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from '@/contexts/AuthContext';

const Quiz = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('selection'); // 'selection', 'quiz', 'results'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [quizSettings, setQuizSettings] = useState({
    source: 'notes', // 'notes' or 'files'
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 15 // minutes
  });
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Mock data - replace with actual API calls
  const [notes, setNotes] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (currentView === 'quiz' && currentQuiz && quizSettings.timeLimit > 0) {
      // Initialize timer when quiz starts
      if (timeRemaining === 0) {
        setTimeRemaining(quizSettings.timeLimit * 60); // Convert minutes to seconds
      }
      
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit quiz
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentView, currentQuiz, timeRemaining]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Load files and notes data
  useEffect(() => {
    const mockNotes = [
      {
        id: 1,
        fileName: 'Data_Structures_Questions.pdf',
        fileType: 'pdf',
        generatedDate: '2025-09-25',
        status: 'completed',
        fileSize: '2.3 MB'
      },
      {
        id: 2,
        fileName: 'Algorithm_Analysis.docx',
        fileType: 'docx',
        generatedDate: '2025-09-24',
        status: 'completed',
        fileSize: '1.8 MB'
      }
    ];

    const mockUploadedFiles = [
      {
        id: 1,
        fileName: 'Data_Structures_Questions.pdf',
        fileType: 'pdf',
        uploadDate: '2025-09-25',
        fileSize: '2.3 MB',
        status: 'processed'
      },
      {
        id: 2,
        fileName: 'Algorithm_Analysis.docx',
        fileType: 'docx',
        uploadDate: '2025-09-24',
        fileSize: '1.8 MB',
        status: 'processed'
      },
      {
        id: 3,
        fileName: 'Web_Development_Guide.pdf',
        fileType: 'pdf',
        uploadDate: '2025-09-22',
        fileSize: '3.1 MB',
        status: 'uploaded'
      }
    ];

    setNotes(mockNotes);
    setUploadedFiles(mockUploadedFiles);
  }, []);

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return <FileText className="h-4 w-4 text-red-400" />;
    if (fileType === 'docx') return <File className="h-4 w-4 text-blue-400" />;
    return <File className="h-4 w-4 text-green-400" />;
  };

  const getStatusBadge = (status) => {
    if (status === 'completed' || status === 'processed') return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ready</Badge>;
    if (status === 'processing') return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Processing</Badge>;
    return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Not Ready</Badge>;
  };

  const handleFileSelection = (fileId, isSelected) => {
    if (isSelected) {
      setSelectedFiles([...selectedFiles, fileId]);
    } else {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    }
  };

  const generateQuiz = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to generate quiz from.');
      return;
    }

    setLoading(true);
    
    // Mock quiz generation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate questions based on the selected count
    const generateQuestions = (count) => {
      const questionPool = [
        {
          id: 1,
          question: "What is the time complexity of searching in a balanced binary search tree?",
          options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
          correctAnswer: 1,
          explanation: "In a balanced BST, the height is log n, so search operations take O(log n) time."
        },
        {
          id: 2,
          question: "Which data structure uses LIFO (Last In, First Out) principle?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correctAnswer: 1,
          explanation: "Stack follows LIFO principle where the last element inserted is the first one to be removed."
        },
        {
          id: 3,
          question: "What is the space complexity of merge sort?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctAnswer: 2,
          explanation: "Merge sort requires O(n) additional space for the temporary arrays used during merging."
        },
        {
          id: 4,
          question: "Which sorting algorithm has the best average-case time complexity?",
          options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
          correctAnswer: 2,
          explanation: "Quick Sort has an average-case time complexity of O(n log n), which is optimal for comparison-based sorting."
        },
        {
          id: 5,
          question: "What is the primary advantage of a linked list over an array?",
          options: ["Faster access to elements", "Dynamic size allocation", "Better cache locality", "Constant time search"],
          correctAnswer: 1,
          explanation: "Linked lists can grow and shrink during runtime, unlike arrays which have fixed sizes in most languages."
        },
        {
          id: 6,
          question: "In which data structure is BFS (Breadth-First Search) typically implemented?",
          options: ["Stack", "Queue", "Priority Queue", "Hash Table"],
          correctAnswer: 1,
          explanation: "BFS uses a queue to maintain the order of nodes to be visited, ensuring breadth-first traversal."
        },
        {
          id: 7,
          question: "What is the worst-case time complexity of QuickSort?",
          options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
          correctAnswer: 2,
          explanation: "QuickSort's worst-case occurs when the pivot is always the smallest or largest element, leading to O(n²) time complexity."
        },
        {
          id: 8,
          question: "Which data structure is best for implementing a priority queue?",
          options: ["Array", "Linked List", "Binary Heap", "Hash Table"],
          correctAnswer: 2,
          explanation: "Binary heaps provide efficient insertion and deletion of the highest/lowest priority element in O(log n) time."
        },
        {
          id: 9,
          question: "What is the time complexity of inserting an element at the beginning of a dynamic array?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctAnswer: 2,
          explanation: "Inserting at the beginning requires shifting all existing elements, resulting in O(n) time complexity."
        },
        {
          id: 10,
          question: "Which tree traversal visits nodes in the order: left subtree, root, right subtree?",
          options: ["Pre-order", "In-order", "Post-order", "Level-order"],
          correctAnswer: 1,
          explanation: "In-order traversal visits the left subtree first, then the root, then the right subtree."
        }
      ];

      // Shuffle and take the required number of questions
      const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, questionPool.length));
    };
    
    const mockQuiz = {
      id: Date.now(),
      title: `Quiz from ${selectedFiles.length} file(s)`,
      questions: generateQuestions(quizSettings.questionCount),
      settings: quizSettings,
      createdAt: new Date().toISOString(),
      startTime: Date.now()
    };

    setCurrentQuiz(mockQuiz);
    setCurrentView('quiz');
    setTimeRemaining(quizSettings.timeLimit > 0 ? quizSettings.timeLimit * 60 : 0);
    setLoading(false);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const submitQuiz = () => {
    const results = {
      totalQuestions: currentQuiz.questions.length,
      correctAnswers: currentQuiz.questions.filter(q => 
        selectedAnswers[q.id] === q.correctAnswer
      ).length,
      answers: selectedAnswers,
      completedAt: new Date().toISOString()
    };

    setQuizResults(results);
    setCurrentView('results');
  };

  const resetQuiz = () => {
    setCurrentView('selection');
    setSelectedFiles([]);
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setTimeRemaining(0);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-16 sm:pt-20">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* File Selection View */}
          {currentView === 'selection' && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  AI Quiz Generator
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Create personalized quizzes from your uploaded files and generated notes
                </p>
              </div>

              {/* Quiz Settings */}
              <Card className="bg-card/95 border border-white/10 mb-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quiz Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Difficulty Level</label>
                      <select 
                        value={quizSettings.difficulty} 
                        onChange={(e) => setQuizSettings({...quizSettings, difficulty: e.target.value})}
                        className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="easy" className="bg-gray-800 text-white">Easy</option>
                        <option value="medium" className="bg-gray-800 text-white">Medium</option>
                        <option value="hard" className="bg-gray-800 text-white">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Number of Questions</label>
                      <select 
                        value={quizSettings.questionCount} 
                        onChange={(e) => setQuizSettings({...quizSettings, questionCount: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="5" className="bg-gray-800 text-white">5 Questions</option>
                        <option value="10" className="bg-gray-800 text-white">10 Questions</option>
                        <option value="15" className="bg-gray-800 text-white">15 Questions</option>
                        <option value="20" className="bg-gray-800 text-white">20 Questions</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Time Limit (minutes)</label>
                      <select 
                        value={quizSettings.timeLimit} 
                        onChange={(e) => setQuizSettings({...quizSettings, timeLimit: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="10" className="bg-gray-800 text-white">10 Minutes</option>
                        <option value="15" className="bg-gray-800 text-white">15 Minutes</option>
                        <option value="30" className="bg-gray-800 text-white">30 Minutes</option>
                        <option value="0" className="bg-gray-800 text-white">No Limit</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Selection Tabs */}
              <Tabs defaultValue="notes" onValueChange={(value) => setQuizSettings({...quizSettings, source: value})}>
                <TabsList className="grid w-full grid-cols-2 bg-card/95 border border-white/10 mb-6">
                  <TabsTrigger value="notes" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Generated Notes ({notes.length})
                  </TabsTrigger>
                  <TabsTrigger value="files" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                    <Upload className="h-4 w-4 mr-2" />
                    Uploaded Files ({uploadedFiles.filter(f => f.status === 'processed').length})
                  </TabsTrigger>
                </TabsList>

                {/* Generated Notes Tab */}
                <TabsContent value="notes">
                  <Card className="bg-card/95 border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Select Notes to Create Quiz From</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {notes.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No generated notes available. Upload files first!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {notes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedFiles.includes(note.id)
                                  ? 'border-purple-500/50 bg-purple-500/10'
                                  : 'border-white/10 hover:border-purple-500/30'
                              }`}
                              onClick={() => handleFileSelection(note.id, !selectedFiles.includes(note.id))}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(note.id)}
                                    onChange={() => {}}
                                    className="text-purple-500"
                                  />
                                  {getFileIcon(note.fileType)}
                                  <div>
                                    <h4 className="text-white font-medium">{note.fileName}</h4>
                                    <p className="text-gray-400 text-sm">Generated: {note.generatedDate} • Size: {note.fileSize}</p>
                                  </div>
                                </div>
                                {getStatusBadge(note.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Uploaded Files Tab */}
                <TabsContent value="files">
                  <Card className="bg-card/95 border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Select Files to Create Quiz From</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {uploadedFiles.filter(f => f.status === 'processed').length === 0 ? (
                        <div className="text-center py-8">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No processed files available. Upload and process files first!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {uploadedFiles.filter(f => f.status === 'processed').map((file) => (
                            <div
                              key={file.id}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedFiles.includes(file.id)
                                  ? 'border-purple-500/50 bg-purple-500/10'
                                  : 'border-white/10 hover:border-purple-500/30'
                              }`}
                              onClick={() => handleFileSelection(file.id, !selectedFiles.includes(file.id))}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(file.id)}
                                    onChange={() => {}}
                                    className="text-purple-500"
                                  />
                                  {getFileIcon(file.fileType)}
                                  <div>
                                    <h4 className="text-white font-medium">{file.fileName}</h4>
                                    <p className="text-gray-400 text-sm">Uploaded: {file.uploadDate} • Size: {file.fileSize}</p>
                                  </div>
                                </div>
                                {getStatusBadge(file.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Generate Quiz Button */}
              <div className="text-center mt-8">
                <Button
                  onClick={generateQuiz}
                  disabled={selectedFiles.length === 0 || loading}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-medium"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Generate Quiz ({selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected)
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Quiz Taking View */}
          {currentView === 'quiz' && currentQuiz && (
            <>
              {/* Quiz Header */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('selection')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Selection
                </Button>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">{currentQuiz.title}</h2>
                  <p className="text-gray-400">Question {currentQuestion + 1} of {currentQuiz.questions.length}</p>
                </div>
                <div className="text-right">
                  {quizSettings.timeLimit > 0 ? (
                    <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-400' : timeRemaining < 600 ? 'text-yellow-400' : 'text-green-400'}`}>
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatTime(timeRemaining)}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">No Time Limit</div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <Progress value={(currentQuestion + 1) / currentQuiz.questions.length * 100} className="h-2" />
              </div>

              {/* Current Question */}
              <Card className="bg-card/95 border border-white/10 mb-6">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    {currentQuiz.questions[currentQuestion].question}
                  </h3>
                  
                  <div className="space-y-3">
                    {currentQuiz.questions[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedAnswers[currentQuiz.questions[currentQuestion].id] === index
                            ? 'border-purple-500/50 bg-purple-500/10'
                            : 'border-white/10 hover:border-purple-500/30'
                        }`}
                        onClick={() => handleAnswerSelect(currentQuiz.questions[currentQuestion].id, index)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`question-${currentQuiz.questions[currentQuestion].id}`}
                            checked={selectedAnswers[currentQuiz.questions[currentQuestion].id] === index}
                            onChange={() => {}}
                            className="text-purple-500"
                          />
                          <span className="text-white">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentQuestion === currentQuiz.questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    Submit Quiz
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(Math.min(currentQuiz.questions.length - 1, currentQuestion + 1))}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Results View */}
          {currentView === 'results' && quizResults && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">Quiz Results</h1>
                <div className="text-6xl mb-4">
                  {quizResults.correctAnswers === quizResults.totalQuestions ? '🏆' : 
                   quizResults.correctAnswers / quizResults.totalQuestions >= 0.8 ? '🎉' :
                   quizResults.correctAnswers / quizResults.totalQuestions >= 0.6 ? '👏' : '📚'}
                </div>
              </div>

              <Card className="bg-card/95 border border-white/10 mb-8">
                <CardContent className="p-8 text-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                      <div className="text-3xl font-bold text-green-400 mb-2">{quizResults.correctAnswers}</div>
                      <div className="text-gray-300">Correct Answers</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-400 mb-2">{quizResults.totalQuestions - quizResults.correctAnswers}</div>
                      <div className="text-gray-300">Incorrect Answers</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-400 mb-2">{Math.round((quizResults.correctAnswers / quizResults.totalQuestions) * 100)}%</div>
                      <div className="text-gray-300">Score</div>
                    </div>
                  </div>

                  <Progress value={(quizResults.correctAnswers / quizResults.totalQuestions) * 100} className="h-4 mb-4" />
                  
                  <p className="text-gray-300 mb-6">
                    {quizResults.correctAnswers === quizResults.totalQuestions ? 'Perfect score! Outstanding work!' :
                     quizResults.correctAnswers / quizResults.totalQuestions >= 0.8 ? 'Excellent performance! Keep it up!' :
                     quizResults.correctAnswers / quizResults.totalQuestions >= 0.6 ? 'Good job! Room for improvement.' :
                     'Keep studying! Practice makes perfect.'}
                  </p>
                </CardContent>
              </Card>

              {/* Answer Review */}
              <Card className="bg-card/95 border border-white/10 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Review Answers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentQuiz.questions.map((question, index) => {
                      const userAnswer = quizResults.answers[question.id];
                      const isCorrect = userAnswer === question.correctAnswer;
                      
                      return (
                        <div key={question.id} className="p-4 rounded-lg border border-white/10">
                          <div className="flex items-start gap-3 mb-3">
                            {isCorrect ? 
                              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" /> : 
                              <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                            }
                            <div className="flex-1">
                              <h4 className="text-white font-medium mb-2">{question.question}</h4>
                              <div className="space-y-1 text-sm">
                                <div className="text-gray-300">
                                  <span className="font-medium">Your answer:</span> {question.options[userAnswer] || 'Not answered'}
                                </div>
                                <div className="text-green-400">
                                  <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                                </div>
                                {question.explanation && (
                                  <div className="text-gray-400 mt-2 p-2 bg-muted/20 rounded">
                                    <Lightbulb className="h-4 w-4 inline mr-1" />
                                    {question.explanation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  onClick={resetQuiz}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Take Another Quiz
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Quiz;
