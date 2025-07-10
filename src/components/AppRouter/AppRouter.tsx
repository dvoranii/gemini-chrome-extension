import {useState, useEffect} from "react";
import ApiKeyModal from "../ApiKeyModal/ApiKeyModal";
import ConversationView from "../ConversationView/ConversationView";
import {getApiKey} from "../../utils/storage";
import { validateApiKey } from "../../utils/validateApiKey";
import "./AppRouter.css";

export default function AppRouter(){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkExistingApiKey();
    }, []);

    const checkExistingApiKey = async () => {
        try {
            const existingKey = await getApiKey();
            if (existingKey) {
                const isValid = await validateApiKey(existingKey);
                setIsAuthenticated(isValid);
                if (!isValid) {
                    if (typeof chrome !== "undefined" && chrome.storage?.local) {
                        await chrome.storage.local.remove('geminiApiKey');
                        } else {
                            localStorage.removeItem("geminiApiKey");
                    }
                }
            }
            
        } catch (error) {
            console.error("Error checking existing API Key:", error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApiKeySuccess = () => {
        setIsAuthenticated(true);
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {isAuthenticated ? (
                <ConversationView/>
            ): (
                <ApiKeyModal onSuccess={handleApiKeySuccess}/>
            )}
        </>
    )


}