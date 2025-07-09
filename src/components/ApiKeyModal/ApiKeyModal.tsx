import { useEffect, useState } from "react";
import { validateApiKey } from "../../utils/validateApiKey";
import "./ApiKeyModal.css"; 

export default function ApiKeyModal() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<{
    loading: boolean;
    message: string | null;
    isSuccess: boolean;
  }>({
    loading: false,
    message: null,
    isSuccess: false
  });

  useEffect(() => {
    const handleBlur = () => {
      if (status.loading) {
        window.focus();
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [status.loading]);

  const handleSave = async () => {
    setStatus({ loading: true, message: null, isSuccess: false });

    try {
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await chrome.storage.local.set({ geminiApiKey: apiKey });
          setStatus({ 
            loading: false, 
            message: 'API key saved successfully!', 
            isSuccess: true 
          });
        } else {
          localStorage.setItem('geminiApiKey', apiKey);
          setStatus({ 
            loading: false, 
            message: 'API key saved (development mode)', 
            isSuccess: true 
          });
        }
      } else {
        setStatus({ 
          loading: false, 
          message: 'Invalid API key. Please check your key and try again.', 
          isSuccess: false 
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setStatus({ 
        loading: false, 
        message: 'Failed to validate key. Check console for details.', 
        isSuccess: false 
      });
    }
  };

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
        onChange={(e) => {
          setApiKey(e.target.value);
          setStatus({ loading: false, message: null, isSuccess: false });
        }}
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
        {status.loading && (
          <span className="loading-spinner" />
        )}
        {status.loading ? 'Verifying...' : 'Save Key'}
      </button>
    </div>
  );
}