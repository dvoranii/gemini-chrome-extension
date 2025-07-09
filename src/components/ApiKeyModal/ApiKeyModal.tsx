import * as S from "./ApiKeyModal.styles";
import { useState } from "react";

export default function ApiKeyModal(){
    const [apiKey, setApiKey] = useState('');

    const handleSave = () => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({geminiApiKey: apiKey}, () => {
                console.log('API key saved');
            });
        } else {
            console.log('Would save API key:', apiKey);
            localStorage.setItem('geminiApiKey', apiKey);
        }
    };

    return(
        <S.ModalContainer>
            <S.Title>Gemini API Key</S.Title>
            <S.InputLabel htmlFor="api-key">Enter your Google Gemini API key:</S.InputLabel>
            <S.InputField
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
            />
            <S.SaveButton onClick={handleSave}>Save Key</S.SaveButton>
        </S.ModalContainer>
    )
}