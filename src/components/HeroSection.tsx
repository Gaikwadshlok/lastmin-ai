import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Brain, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartStudying = () => {
    navigate('/signup');
  };

  const handleSeeHowItWorks = () => {
    navigate('/signup');
  };

  return (
    <section className="bg-black min-h-screen flex items-center justify-center pt-16 sm:pt-20 overflow-y-auto overflow-x-hidden scrollbar-hide">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-full flex items-center py-8">
        <div className="max-w-5xl mx-auto text-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-900/30 text-purple-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-purple-800/30">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            AI-Powered Study Revolution
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
            <span className="block">Last-Minute Study,</span>
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent block mt-1 sm:mt-2">
              Maximum Results
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
            Upload your syllabus and get AI-generated notes, personalized quizzes, and instant doubt solving. 
            Perfect for students who need to maximize their study efficiency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-4">
            <Button 
              variant="hero" 
              size="sm" 
              className="w-full sm:w-auto min-w-48 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm sm:text-base px-6 py-4 h-auto rounded-lg font-medium shadow-lg shadow-purple-600/25 touch-manipulation" 
              onClick={handleStartStudying}
            >
              Start Studying Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto min-w-48 border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 active:bg-gray-700/50 text-gray-200 text-sm sm:text-base px-6 py-4 h-auto rounded-lg font-medium backdrop-blur-sm touch-manipulation" 
              onClick={handleSeeHowItWorks}
            >
              See How It Works
            </Button>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-4">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-gray-700/60 hover:bg-gray-900/80 active:bg-gray-900/90 transition-all duration-300 shadow-lg text-center cursor-pointer touch-manipulation">
              <div className="bg-purple-900/50 p-4 rounded-lg w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-3 text-base sm:text-lg">Upload & Generate</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Upload any syllabus format and get instant AI-generated study notes
              </p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-gray-700/60 hover:bg-gray-900/80 active:bg-gray-900/90 transition-all duration-300 shadow-lg text-center cursor-pointer touch-manipulation">
              <div className="bg-blue-900/50 p-4 rounded-lg w-fit mx-auto mb-4">
                <Brain className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-3 text-base sm:text-lg">Smart Quizzing</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Personalized MCQs and flashcards based on your study material
              </p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-gray-700/60 hover:bg-gray-900/80 active:bg-gray-900/90 transition-all duration-300 shadow-lg text-center cursor-pointer touch-manipulation">
              <div className="bg-yellow-900/50 p-4 rounded-lg w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              </div>
              <h3 className="font-semibold text-white mb-3 text-base sm:text-lg">Instant Doubts</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                AI chatbot ready to solve your doubts 24/7 with contextual answers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;