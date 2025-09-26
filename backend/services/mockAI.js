// Mock AI service for testing when API keys are unavailable
export async function mockChatCompletion(message, context = '') {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  const responses = [
    `I understand you're asking about: "${message}". Here's a helpful response based on the context provided.`,
    `Thank you for your question about "${message}". Let me provide some insights on this topic.`,
    `That's an interesting question about "${message}". Here's what I can tell you about it.`,
    `Regarding "${message}" - this is a common topic students ask about. Let me explain.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function mockAnalyze(text) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const wordCount = text.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);
  
  return {
    structured: true,
    difficulty: wordCount > 500 ? 'advanced' : wordCount > 200 ? 'intermediate' : 'beginner',
    keyTopics: [
      { topic: 'Main Concept', importance: 8 },
      { topic: 'Supporting Ideas', importance: 6 },
      { topic: 'Key Terms', importance: 7 }
    ],
    concepts: [
      { name: 'Primary Topic', definition: 'The main subject matter discussed', importance: 9 },
      { name: 'Secondary Concepts', definition: 'Supporting ideas and explanations', importance: 7 }
    ],
    wordCount,
    readingTimeMinutes: readingTime
  };
}

export async function mockSummarize(text, type = 'detailed') {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (type === 'brief') {
    return 'This is a brief summary of the provided text content.';
  } else if (type === 'bullet-points') {
    return '• Key point one\n• Important concept two\n• Main takeaway three\n• Supporting detail four';
  }
  
  return 'This is a comprehensive summary of the provided text, covering the main topics and key concepts in a structured format suitable for study purposes.';
}

export async function mockQuizQuestions(text, count = 5) {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      question: `Sample question ${i} based on the provided text?`,
      options: [
        'Option A - First possible answer',
        'Option B - Second possible answer', 
        'Option C - Third possible answer',
        'Option D - Fourth possible answer'
      ],
      correctIndex: Math.floor(Math.random() * 4),
      explanation: `This is the explanation for question ${i}.`,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    });
  }
  
  return questions;
}
