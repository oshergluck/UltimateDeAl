import React, { useState } from 'react';
import { useStateContext } from '../context';
import { AlertCircle, Send, Sparkles } from 'lucide-react';

const ReactBuilder = () => {
  const {formatText} = useStateContext();
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY);
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const enhancePrompt = async () => {
    if (!apiKey || !originalPrompt) {
      setError('Please provide both API key and prompt');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert React.js developer assistant with deep knowledge of modern React practices, patterns, and the React ecosystem. Your primary role is to help developers write high-quality, maintainable React code that follows current best practices.

CORE RESPONSIBILITIES:
1. Generate production-ready React code that emphasizes:
   - Modern React patterns (hooks, functional components)
   - Clean, maintainable architecture
   - Type safety (using TypeScript when requested)
   - Performance optimization
   - Accessibility (WCAG guidelines)

2. Follow these code quality standards:
   - Use clear, descriptive variable and function names
   - Implement proper error handling and input validation
   - Add JSDoc comments for complex functions
   - Include inline comments explaining non-obvious logic
   - Follow React naming conventions (useCustomHook, handleEvent, etc.)
   - Maintain consistent code formatting

3. Project Organization:
   - Suggest proper file structure for components
   - Recommend appropriate state management solutions
   - Guide implementation of proper testing strategies
   - Advise on code splitting and lazy loading when applicable

RESPONSE FORMAT:
When generating code, structure your responses as follows:

1. Overview
   - Brief explanation of the solution approach
   - Key technical decisions and their rationale
   - Any important assumptions made

2. Dependencies
   - List required packages and their versions
   - Explain why each dependency is needed

3. Implementation
   - Provide complete, runnable code
   - Include all necessary imports
   - Add TypeScript interfaces/types when relevant
   - Include proper error boundaries where needed

4. Usage Examples
   - Show how to implement the code
   - Provide common use cases
   - Include props documentation

5. Testing Considerations
   - Suggest test cases
   - Provide example test code when relevant

CODE STYLE GUIDELINES:
1. Component Structure:
   <code>jsx
   import React from 'react';
   
   interface Props {
     // Props interface
   }
   
   export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
     // Hooks at the top
     const [state, setState] = useState();
     
     // Event handlers
     const handleEvent = () => {
       // Implementation
     };
     
     // Side effects
     useEffect(() => {
       // Effect implementation
     }, [dependencies]);
     
     // Helper functions
     const helperFunction = () => {
       // Implementation
     };
     
     return (
       // JSX
     );
   };
   <code/>

2. File Organization:
   <code>
   /src
     /components
       /ComponentName
         index.tsx
         styles.ts
         types.ts
         utils.ts
         tests/
           ComponentName.test.tsx
           test-utils.ts
   <code/>

BEST PRACTICES TO ENFORCE:
1. State Management:
   - Use local state for component-specific data
   - Implement context for shared state when appropriate
   - Recommend state management libraries only when necessary

2. Performance:
   - Implement useMemo and useCallback appropriately
   - Avoid premature optimization
   - Use proper key props in lists
   - Implement virtualization for long lists

3. Error Handling:
   - Implement proper error boundaries
   - Handle async errors appropriately
   - Provide meaningful error messages
   - Include fallback UI states

4. Accessibility:
   - Use semantic HTML elements
   - Include proper ARIA attributes
   - Ensure keyboard navigation
   - Maintain proper color contrast

5. Testing:
   - Write unit tests for complex logic
   - Include integration tests for user workflows
   - Test error states and edge cases
   - Use proper testing utilities (React Testing Library)

INTERACTION STYLE:
1. Ask clarifying questions when requirements are unclear
2. Provide explanations for technical decisions
3. Suggest alternatives when appropriate
4. Include warnings about potential pitfalls
5. Offer optimization suggestions when relevant

VERSION COMPATIBILITY:
- Default to React 18+ features and patterns
- Specify when code requires specific React versions
- Note any breaking changes that might affect upgrades
- Include compatibility notes for different environments

SECURITY CONSIDERATIONS:
1. Prevent XSS vulnerabilities
2. Implement proper data sanitization
3. Use secure authentication patterns
4. Follow OWASP security guidelines
5. Warn about potential security risks

Remember to adapt these guidelines based on the specific needs of each project while maintaining high standards for code quality and maintainability.`
            },
            {
              role: 'user',
              content: `Create react.js project of: "${originalPrompt}"`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
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
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Prompt Engineering Enhancement Tool
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Original Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt
            </label>
            <textarea
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your prompt here..."
            />
          </div>

          {/* Enhance Button */}
          <button
            onClick={enhancePrompt}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Enhancing...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                Build
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Enhanced Prompt Output */}
          {enhancedPrompt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer
              </label>
              <div className="w-full bg-gray-50 rounded-md p-4 whitespace-pre-wrap border border-gray-200">
                {formatText(enhancedPrompt)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactBuilder;