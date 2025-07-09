export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey.startsWith('AIzaSy')) {
    console.warn("API key format is incorrect.");
    return false;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: "Hello, Gemini!" }] 
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json(); 
      console.error('API key validation failed with HTTP error:', response.status, errorData);
      return false; 
    }

    const data = await response.json();

    const isValid = data.candidates && data.candidates.length > 0 &&
                    data.candidates[0].content && data.candidates[0].content.parts &&
                    data.candidates[0].content.parts.length > 0 &&
                    typeof data.candidates[0].content.parts[0].text === 'string' &&
                    data.candidates[0].content.parts[0].text.trim().length > 0; 

    if (!isValid) {
      console.warn("API call was successful, but the model did not return expected content structure.", data);
    }

    console.log('Validation response:', data, 'isValid:', isValid); 
    return isValid;

  } catch (error) {
    console.error('Network or parsing error during API key validation:', error);
    return false;
  }
};