import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import Header from '@/components/Header';

const About = () => {
  const [activeTeamMember, setActiveTeamMember] = useState(1);

  // Team members data with LastMin AI context
  const teamMembers = [
    { 
      id: 1, 
      name: 'Shlok Gaikwad', 
      role: 'Full Stack Developer', 
      imageUrl: '/shlok-profile-photo.jpg',
      description: 'Expert in building end-to-end web applications with modern technologies and seamless user experiences'
    },
    { 
      id: 2, 
      name: 'Aaryan Kadam', 
      role: 'Generative AI Developer', 
      imageUrl: '/aaryan-beach-photo.jpg',
      description: 'Specialist in AI model development and integration, creating intelligent educational solutions'
    },
  ];

  const currentMember = teamMembers.find(member => member.id === activeTeamMember) || teamMembers[0];

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-16 sm:pt-20">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16">
        {/* Team Section - Moved to top */}
        <motion.section 
          className="mb-12 sm:mb-14 md:mb-16 lg:mb-20 xl:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">Meet Our Team</h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-muted-foreground max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4">
              Passionate educators and technologists building the future of learning
            </p>
          </div>

          <div className="flex flex-col lg:flex-row xl:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-start">
            {/* Team List */}
            <div className="w-full lg:w-2/3 xl:w-2/3">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  className={`relative flex flex-col sm:flex-row md:flex-row items-start sm:items-center md:items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 border-b border-border/50 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 rounded-lg mb-2 md:mb-3 ${
                    activeTeamMember === member.id ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30' : 'hover:bg-card/30'
                  }`}
                  onMouseEnter={() => setActiveTeamMember(member.id)}
                  whileHover={{ x: 5, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Highlight bar */}
                  <div 
                    className={`absolute left-0 top-0 w-1 h-full bg-primary transition-all duration-300 ${
                      activeTeamMember === member.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  
                  <div className="flex items-start sm:items-center md:items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 flex-grow">
                    <span className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground font-medium mt-1 sm:mt-0 md:mt-0 flex-shrink-0">
                      0{index + 1}
                    </span>
                    <div className="flex-grow min-w-0">
                      <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold transition-colors duration-300 mb-1 sm:mb-1 md:mb-2 lg:mb-2 xl:mb-3 ${
                        activeTeamMember === member.id ? 'text-primary' : 'text-foreground'
                      }`}>
                        {member.name}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground leading-relaxed">
                        {member.description}
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold tracking-wider text-muted-foreground uppercase mt-2 sm:mt-2 md:mt-0 lg:mt-0 xl:mt-0 self-start sm:self-start md:self-center lg:self-center xl:self-center flex-shrink-0">
                    {member.role}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Team Member Icon */}
            <div className="hidden lg:block xl:block sticky top-32 w-full lg:w-1/3 xl:w-1/3 mt-6 lg:mt-0">
              <motion.div 
                className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 mx-auto"
                key={activeTeamMember}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="rounded-full w-full h-full overflow-hidden shadow-2xl border-4 border-primary/20">
                  <img 
                    src={currentMember.imageUrl} 
                    alt={currentMember.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient with User icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallbackDiv) fallbackDiv.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center" style={{ display: 'none' }}>
                    <User className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-32 xl:w-32 text-white" />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-primary/20 animate-pulse"></div>
              </motion.div>
              
              <motion.div 
                className="text-center mt-3 sm:mt-4 md:mt-5 lg:mt-6 xl:mt-8 px-2 sm:px-3 md:px-4"
                key={`info-${activeTeamMember}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h4 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-semibold text-foreground mb-1 sm:mb-2">{currentMember.name}</h4>
                <p className="text-primary font-medium text-sm sm:text-sm md:text-base lg:text-base xl:text-lg mb-2 sm:mb-3">{currentMember.role}</p>
                <p className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base text-muted-foreground leading-relaxed">{currentMember.description}</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Mission Section - Moved to middle */}
        <motion.section 
          className="mb-12 sm:mb-14 md:mb-16 lg:mb-20 xl:mb-24 border-2 border-solid border-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-2xl xl:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 xl:p-12 bg-card/30 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8 text-foreground">Our Mission</h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-muted-foreground leading-relaxed mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8">
                We believe that quality education shouldn't be limited by time constraints. Whether you're cramming 
                for an exam, preparing for a presentation, or learning something new on a tight deadline, LastMin AI 
                is your intelligent study partner.
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-muted-foreground leading-relaxed">
                Our AI-powered platform creates personalized study plans, generates practice quizzes, and provides 
                instant explanations to help you master any subject efficiently and effectively.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-primary/20 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-2xl xl:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 backdrop-blur-sm border border-primary/20">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-semibold mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 text-primary">Why LastMin AI?</h3>
                <ul className="space-y-2 sm:space-y-2 md:space-y-3 lg:space-y-3 xl:space-y-4 text-muted-foreground">
                  <li className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-4">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg">AI-powered personalized learning paths</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-4">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg">Instant quiz generation from any content</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-4">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg">Real-time adaptive difficulty adjustment</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-4">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg">24/7 AI tutor for instant explanations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Values Section - Moved to bottom */}
        <motion.section 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-16 text-foreground">Our Values</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10">
            {[
              {
                title: "Innovation",
                description: "Pushing the boundaries of AI in education to create breakthrough learning experiences.",
                icon: "🚀"
              },
              {
                title: "Accessibility", 
                description: "Making quality education available to everyone, regardless of time constraints or background.",
                icon: "🌍"
              },
              {
                title: "Excellence",
                description: "Committed to delivering the highest quality educational tools that truly make a difference.",
                icon: "⭐"
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                className={`bg-card/50 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-2xl xl:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 border border-border/50 hover:border-primary/50 transition-all duration-300 ${
                  index === 2 ? 'sm:col-span-2 md:col-span-1 lg:col-span-1' : ''
                }`}
                whileHover={{ y: -5, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">{value.icon}</div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-semibold text-foreground mb-2 sm:mb-2 md:mb-3 lg:mb-3 xl:mb-4">{value.title}</h3>
                <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a 
              href="#" 
              className="inline-flex items-center gap-2 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              JOIN OUR MISSION →
            </a>
          </motion.div>

          {/* Mission Statement at Bottom */}
          <motion.div 
            className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 xl:mt-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-muted-foreground max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto leading-relaxed px-3 sm:px-4 md:px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              Revolutionizing last-minute learning with AI-powered study companions that adapt to your pace, 
              understand your needs, and help you succeed when time is running out.
            </motion.p>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
};

export default About;
