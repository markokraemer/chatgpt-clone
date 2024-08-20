import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ApiTester() {
  const [apiResponse, setApiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('Hello, how are you?');

  const testApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
      }

      setApiResponse(result);
    } catch (error) {
      console.error('Error testing API:', error);
      setApiResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={testMessage}
        onChange={(e) => setTestMessage(e.target.value)}
        placeholder="Enter a test message"
      />
      <Button onClick={testApi} disabled={isLoading}>
        {isLoading ? 'Testing...' : 'Test API'}
      </Button>
      <Textarea
        value={apiResponse}
        readOnly
        placeholder="API response will appear here"
        className="h-40"
      />
    </div>
  );
}