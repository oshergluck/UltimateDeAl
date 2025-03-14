import React, { useState, useEffect } from 'react';
import { AlertCircle, Send, Sparkles } from 'lucide-react';

// Custom hook for typewriter effect
const useTypewriter = (text, speed = 10) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;

    setIsTyping(true);
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
};

const PromptEnhancer = () => {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY);
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { displayedText, isTyping } = useTypewriter(enhancedPrompt);

  const enhancePrompt = async () => {
    if (!apiKey || !originalPrompt) {
      setError('Please provide both API key and prompt');
      return;
    }

    setIsLoading(true);
    setError('');
    setEnhancedPrompt(''); // Clear previous enhanced prompt

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages : [
            {
              role: 'system',
              content: `You are a text markup assistant that adds special symbol markers around text to indicate formatting.
          
          Input Format:
          You will receive text that needs to be marked up with specific symbols.
          
          Markup Rules:
          1. To indicate centered text: Add '$' symbols on both sides
             Example: normal text -> $centered text$
          
          2. To indicate yellow highlighting: Add '~' symbols on both sides
             Example: normal text -> ~highlighted text~
          
          3. To indicate bigger text: Add '^' symbols on both sides
             Example: normal text -> ^bigger text^
          
          4. To indicate bold text: Add '*' symbols on both sides
             Example: normal text -> *bold text*
          
          Multiple Markup Rules:
          - You can apply multiple types of markup to the same text
          - You can use any combination of the symbols, from 2 up to all 4
          - When using multiple symbols, apply them from inside to outside
          - The order of multiple symbols should be: * (innermost), ^, ~, $ (outermost)
          
          Examples of Multiple Markup:
          - Bold and centered: $*text*$
          - Yellow and bigger: ^~text~^
          - Bold, bigger, and yellow: ~^*text*^~
          - All four markups: $~^*text*^~$
          
          Important Instructions:
          - Add ONLY the symbols specified above
          - DO NOT add any HTML tags like <center> or <Yellow>
          - The symbols must be placed directly adjacent to the text without spaces
          - Preserve any existing punctuation and spacing in the original text
          - Process the entire text, not just portions of it
          
          Example Input:
          "Make this centered and bold, this yellow and bigger, and this one with all formats."
          
          Example Output:
          "$*Make this centered and bold*$, ^~this yellow and bigger~^, and $~^*this one with all formats*^~$."
          
          Your task is to apply these markup rules to any text provided in the 'user' messages.`
            },
            {
              role: 'user',
              content: `Add the signs to the text in the right places: ${originalPrompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setEnhancedPrompt('');
      setEnhancedPrompt(data.choices[0].message.content);
    } catch (err) {
      setError('Failed to enhance prompt. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Description Designer Toll
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Prompt
            </label>
            <textarea
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your prompt here..."
            />
          </div>

          <button
            onClick={enhancePrompt}
            disabled={isLoading || isTyping}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Wait...'
            ) : isTyping ? (
              'Typing...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                Run
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {enhancedPrompt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result
              </label>
              <div className="w-full bg-gray-50 rounded-md p-4 whitespace-pre-wrap border border-gray-200">
                {displayedText}
                <span className="animate-pulse">|</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptEnhancer;