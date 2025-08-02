import { motion } from "framer-motion";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background overflow-x-hidden flex flex-col"
      initial={{ 
        opacity: 0, 
        y: 15
      }}
      animate={{ 
        opacity: 1, 
        y: 0
      }}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0, 0.6, 1],
        staggerChildren: 0.08, // Quick, smooth stagger
        delayChildren: 0.1 
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.4, 0, 0.6, 1]
        }}
      >
        <Header />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.08,
          ease: [0.4, 0, 0.6, 1]
        }}
        className="flex-1 min-h-0"
      >
        <HeroSection />
      </motion.div>
    </motion.div>
  );
};

export default Index;
