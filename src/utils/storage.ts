export const storeApiKey = async (apiKey: string): Promise<void> => {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({ geminiApiKey: apiKey });
  } else {
    localStorage.setItem("geminiApiKey", apiKey);
  }
};