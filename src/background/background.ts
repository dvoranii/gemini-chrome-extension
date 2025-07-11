chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "importHighlightedText",
    title: "Import into Gemini Sidebar",
    contexts: ["selection"],
    documentUrlPatterns: ["https://gemini.google.com/*"] 
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "importHighlightedText" && tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getSelectionText,
    }, async (results) => {
      if (results && results[0] && results[0].result) {
        const highlightedText = results[0].result;
        await saveHighlightedTextToStorage(highlightedText);
       
      }
    });
  }
});

function getSelectionText(): string {
  return window.getSelection()?.toString() || '';
}

async function saveHighlightedTextToStorage(text: string) {
  const newConversation = {
    id: Date.now().toString(),
    highlightedText: text,
    context: "", 
    contextType: 'auto',
    messages: [],
    created: new Date().toISOString(),
    isActive: true
  };

  const result = await chrome.storage.local.get(['subConversations']);
  let subConversations = [];
  if (result.subConversations) {
    subConversations = JSON.parse(result.subConversations).map((conv: any) => ({
      ...conv,
      created: new Date(conv.created) 
    }));
  }
  
  const updatedConversations = [newConversation, ...subConversations];
  await chrome.storage.local.set({ subConversations: JSON.stringify(updatedConversations) });
  console.log("Saved new conversation to storage from background script:", newConversation);
}