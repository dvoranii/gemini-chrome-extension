import "./ApiKeyModal.css"; 
import { useEffect, useState } from "react";

type StatusState = {
  loading: boolean;
  message: string | null;
  isSuccess: boolean;
}

interface ApiKeyModalProps {
  onSuccess: () => void;
}

const initialStatusState: StatusState = {
  loading: false,
  message: null,
  isSuccess: false
}

const STATUS_MESSAGES = {
  SUCCESS: "API key saved successfully!",
  DEV_SUCCESS: "API key saved (development mode)",
  INVALID: "Invalid API key. Please check your key and try again.",
  ERROR: "Failed to validate key. Check console for details.",
};

// Utility functions - inline to avoid import issues
const validateApiKey = async (apiKey: string): Promise<boolean> => {
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

const saveApiKey = async (apiKey: string): Promise<void> => {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({ geminiApiKey: apiKey });
  } else {
    localStorage.setItem("geminiApiKey", apiKey);
  }
};

export default function ApiKeyModal({onSuccess}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<StatusState>(initialStatusState);

  useEffect(() => {
    const handleBlur = () => {
      if (status.loading) window.focus();
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [status.loading]);

  const resetStatus = () => setStatus(initialStatusState);

  const handleSave = async () => {
    setStatus({ ...initialStatusState, loading: true });

    try {
      const isValid = await validateApiKey(apiKey);
      
      if (!isValid) {
        return setStatus({
          loading: false,
          message: STATUS_MESSAGES.INVALID,
          isSuccess: false
        });
      }
      
      await saveApiKey(apiKey);
      setStatus({
        loading: false,
        message: STATUS_MESSAGES.SUCCESS,
        isSuccess: true
      });

      // Navigate to main view after short delay
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Validation failed:', error);
      setStatus({ 
        loading: false, 
        message: STATUS_MESSAGES.ERROR, 
        isSuccess: false 
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    resetStatus();
  }

  return (
    <div className="modal-container">
      <h2 className="modal-title">Gemini API Key</h2>
      <label className="input-label" htmlFor="api-key">
        Enter your Google Gemini API key:
      </label>
      <input
        id="api-key"
        className="input-field"
        type="password"
        value={apiKey}
        onChange={handleInputChange}
        placeholder="AIzaSy..."
        disabled={status.loading}
      />
      
      {status.message && (
        <div className={`response-message ${status.isSuccess ? 'success' : 'error'}`}>
          {status.message}
        </div>
      )}
      
      <button 
        className="save-button"
        onClick={handleSave}
        disabled={status.loading || apiKey.length < 10}
      >
        {status.loading ? (
          <>
            <span className="loading-spinner" />
            Verifying...
          </>
        ) : (
          "Save Key"
        )}
      </button>
    </div>
  );
}