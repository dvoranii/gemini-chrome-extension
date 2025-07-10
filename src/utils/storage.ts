export const getApiKey = async (): Promise<string | null> => {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    const result = await chrome.storage.local.get(['geminiApiKey']);
    return result.geminiApiKey || null;
  } else {
    return localStorage.getItem("geminiApiKey");
  }
};