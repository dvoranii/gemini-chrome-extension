import "./ApiKeyModal.css"; 
import { useEffect, useState } from "react";
import { validateApiKey } from "../../utils/validateApiKey";
import { storeApiKey } from "../../utils/storage";


type StatusState = {
  loading: boolean;
  message: string | null;
  isSuccess: boolean;
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
      
      await storeApiKey(apiKey);
      setStatus({
        loading: false,
        message: STATUS_MESSAGES.SUCCESS,
        isSuccess: true
      });
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