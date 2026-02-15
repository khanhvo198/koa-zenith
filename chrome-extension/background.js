// Create a right-click context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendWord",
    title: "Sent it to my FlashCard",
    contexts: ["selection"], // only show when text is selected
  });
});

// When the user clicks the context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "sendWord" && info.selectionText) {
    console.log(info.selectionText);
    // Send the selected text to your server
    await fetch(
      "https://koa-zenith.onrender.com/api/recently_added/extension",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: info.selectionText,
          email: "khanhvo198.y2k@gmail.com",
        }),
      },
    );

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (word) => {
        // Create toast element
        const toast = document.createElement("div");
        toast.textContent = `Saved "${word}" to server ✅`;
        Object.assign(toast.style, {
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#333",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 999999,
          opacity: 1,
          transition: "opacity 0.5s ease",
        });

        document.body.appendChild(toast);

        // Remove after 2s
        setTimeout(() => {
          toast.style.opacity = 0;
          setTimeout(() => toast.remove(), 500);
        }, 2000);
      },
      args: [info.selectionText],
    });
  }
});
