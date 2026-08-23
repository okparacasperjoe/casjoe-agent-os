import React, { useState } from 'react';
import { Bot, CheckCircle, AlertTriangle, ArrowRight, Settings } from 'lucide-react';

const OnboardingWizard = ({ onComplete, ollamaConnected, ollamaModels }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-[#FF9F00]/20 p-4 rounded-full">
              <Bot className="w-16 h-16 text-[#FF9F00]" />
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome to Casjoe Local AI</h1>
            <p className="text-gray-400 max-w-md">
              Your intelligent, offline-first assistant for business automation.
              Let's get you set up in just a few steps.
            </p>
            <button
              onClick={nextStep}
              className="mt-8 flex items-center px-6 py-3 bg-[#FF9F00] text-black font-semibold rounded-lg hover:bg-[#FF6B00] transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className={`p-4 rounded-full ${ollamaConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {ollamaConnected ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">AI Engine Check</h2>
            
            {ollamaConnected ? (
              <div className="space-y-4">
                <p className="text-green-400 font-medium">✅ AI Engine detected! You are ready to go.</p>
                <p className="text-gray-400 text-sm">
                  Found {ollamaModels?.length || 0} local models available.
                </p>
                <button
                  onClick={nextStep}
                  className="mt-6 flex items-center px-6 py-3 bg-[#FF9F00] text-black font-semibold rounded-lg hover:bg-[#FF6B00] transition-colors mx-auto"
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-400 font-medium">⚠️ AI Engine not detected.</p>
                <p className="text-gray-400 max-w-md">
                  Casjoe Offline AI requires Ollama to run local AI models. 
                  Please install it from <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-[#FF9F00] hover:underline">ollama.com</a> and start the application.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center px-6 py-3 border border-gray-600 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Check Again
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex items-center px-6 py-3 text-gray-400 font-semibold hover:text-white transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-[#FF9F00]/20 p-4 rounded-full">
              <Settings className="w-16 h-16 text-[#FF9F00]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Setup Complete</h2>
            <p className="text-gray-400 max-w-md">
              You are all set! Explore our built-in <span className="text-[#FF9F00] font-semibold">100+ Enterprise Prompt Library</span> across 12 sectors, upload documents for offline RAG analysis, or start automating your business workflows.
            </p>
            <button
              onClick={onComplete}
              className="mt-8 flex items-center px-6 py-3 bg-[#FF9F00] text-black font-semibold rounded-lg hover:bg-[#FF6B00] transition-colors"
            >
              Start Exploring
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811]">
      <div className="w-full max-w-2xl p-8 mx-4 bg-[#050811] border border-gray-800 rounded-2xl shadow-2xl shadow-[#FF9F00]/5">
        {renderStep()}
        
        {/* Progress indicators */}
        <div className="flex justify-center mt-12 space-x-3">
          {[0, 1, 2].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === currentStep 
                  ? 'w-8 bg-[#FF9F00]' 
                  : step < currentStep 
                    ? 'w-2 bg-[#FF9F00]/50' 
                    : 'w-2 bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
