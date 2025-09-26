// Mixtral AI Service for local Mixtral API integration
import axios from 'axios';

class MixtralService {
  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    this.apiKey = process.env.MIXTRAL_API_KEY;
    this.baseURL = process.env.MIXTRAL_API_URL || 'https://api.mistral.ai/v1';
    this.model = process.env.MIXTRAL_MODEL || 'mistral-large-latest';
    this.temperature = parseFloat(process.env.TEMPERATURE) || 0.7;
    this.maxTokens = parseInt(process.env.MAX_TOKENS) || 1000;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
  }

  // Method to reload configuration after environment variables are loaded
  reloadConfig() {
    console.log('[Mixtral] 🔄 Reloading configuration...');
    this.loadConfig();
  }

  isConfigured() {
    console.log('[Mixtral] Checking configuration:', {
      hasApiKey: !!this.apiKey,
      keyLength: this.apiKey ? this.apiKey.length : 0,
      keyPreview: this.apiKey ? this.apiKey.substring(0, 4) + '...' : 'none'
    });
    return this.apiKey && 
           this.apiKey !== 'your-mixtral-api-key-here' && 
           this.apiKey.length > 10;
  }

  async chatCompletion(message, context = '') {
    if (!this.isConfigured()) {
      throw new Error('Mixtral API key not configured');
    }

    try {
      const systemPrompt = context ? 
        `Context: ${context}\n\nYou are a helpful AI study assistant. Provide clear, educational responses based on the context provided.` :
        'You are a helpful AI study assistant. Provide clear, educational responses to help students learn.';

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: false
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content;
      }
      
      throw new Error('Invalid response format from Mixtral API');
    } catch (error) {
      console.error('[Mixtral] API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async analyze(text) {
    const prompt = `Analyze the following text for educational purposes:

Text: "${text}"

Please provide:
1. Difficulty level (beginner/intermediate/advanced)
2. Key topics covered
3. Important concepts and their definitions
4. Structure assessment

Format your response as a clear analysis.`;

    try {
      const response = await this.chatCompletion(prompt);
      
      // Parse the response to extract structured data
      const wordCount = text.split(' ').length;
      const readingTime = Math.ceil(wordCount / 200);
      
      return {
        structured: true,
        difficulty: wordCount > 500 ? 'advanced' : wordCount > 200 ? 'intermediate' : 'beginner',
        analysis: response,
        readingTime,
        wordCount,
        keyTopics: this.extractTopics(response)
      };
    } catch (error) {
      console.error('[Mixtral] Analysis Error:', error.message);
      throw error;
    }
  }

  async generateQuiz(content, numQuestions = 5) {
    const prompt = `Based on the following content, create ${numQuestions} multiple-choice questions for a quiz:

Content: "${content}"

Format each question as:
Q1: [Question]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
Correct Answer: [Letter]

Make the questions educational and test understanding of key concepts.`;

    try {
      const response = await this.chatCompletion(prompt);
      return this.parseQuizResponse(response);
    } catch (error) {
      console.error('[Mixtral] Quiz Generation Error:', error.message);
      throw error;
    }
  }

  extractTopics(text) {
    // Simple topic extraction from response
    const topics = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.includes('topic') || line.includes('concept')) {
        const topic = line.replace(/^\d+\.?\s*/, '').trim();
        if (topic.length > 0) {
          topics.push({
            topic: topic,
            importance: Math.floor(Math.random() * 3) + 6 // 6-8 importance
          });
        }
      }
    });
    
    return topics.length > 0 ? topics : [
      { topic: 'Main Concepts', importance: 8 },
      { topic: 'Key Terms', importance: 7 }
    ];
  }

  parseQuizResponse(response) {
    // Parse quiz response into structured format
    const questions = [];
    const questionBlocks = response.split(/Q\d+:/).slice(1);
    
    questionBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      if (lines.length >= 5) {
        const question = lines[0].trim();
        const options = lines.slice(1, 5).map(opt => opt.replace(/^[A-D]\)\s*/, '').trim());
        const correctLine = lines.find(line => line.toLowerCase().includes('correct answer'));
        const correct = correctLine ? correctLine.match(/[A-D]/)?.[0] : 'A';
        
        questions.push({
          id: index + 1,
          question,
          options,
          correct: ['A', 'B', 'C', 'D'].indexOf(correct),
          explanation: `Based on the content analysis.`
        });
      }
    });
    
    return questions.length > 0 ? questions : [{
      id: 1,
      question: "What is the main topic discussed?",
      options: ["Topic A", "Topic B", "Topic C", "Topic D"],
      correct: 0,
      explanation: "Generated from content analysis."
    }];
  }
}

export default new MixtralService();