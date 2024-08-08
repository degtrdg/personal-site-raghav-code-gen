async function getComponentInfo(element) {
  const reactFiberKey = Object.keys(element).find((key) =>
    key.startsWith("__reactFiber$")
  );

  if (!reactFiberKey) {
    return null;
  }

  // @ts-ignore
  const fiberNode = element[reactFiberKey];

  if (fiberNode) {
    const componentHierarchy = [];

    let currentFiber = fiberNode;
    while (currentFiber) {
      if (currentFiber._debugSource) {
        const { fileName, lineNumber } = currentFiber._debugSource;
        componentHierarchy.push({
          filePath: fileName,
          lineNumber: lineNumber,
          componentName: currentFiber.elementType?.name || "Unknown",
        });
      }
      currentFiber = currentFiber.return;
    }

    return componentHierarchy;
  }

  return null;
}

function initBrowserCode() {
  let currentBoundingBox = null;

  function createBoundingBox(rect) {
    const box = document.createElement("div");
    box.style.cssText = `
      position: fixed;
      border: 2px dashed red;
      background-color: rgba(255, 0, 0, 0.1);
      pointer-events: none;
      z-index: 2147483647;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;
    return box;
  }

  function removeBoundingBox() {
    if (currentBoundingBox) {
      document.body.removeChild(currentBoundingBox);
      currentBoundingBox = null;
    }
  }

  function highlightElement(element) {
    element.style.transition = "background-color 0.3s";
    element.style.backgroundColor = "rgba(0, 0, 255, 0.3)";
    setTimeout(() => {
      element.style.backgroundColor = "";
      setTimeout(() => {
        element.style.transition = "";
      }, 300);
    }, 3000);
  }

  let selectionModeEnabled = true;

  function createToggleButton() {
    const button = document.createElement("div");
    button.id = "selection-mode-toggle";
    button.innerHTML = `
      <div class="toggle-track">
        <div class="toggle-thumb"></div>
      </div>
    `;
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 2147483647;
      cursor: pointer;
    `;

    const style = document.createElement("style");
    style.textContent = `
      #selection-mode-toggle .toggle-track {
        width: 50px;
        height: 24px;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        backdrop-filter: blur(5px);
        transition: background-color 0.3s;
      }
      #selection-mode-toggle .toggle-thumb {
        width: 20px;
        height: 20px;
        background-color: white;
        border-radius: 50%;
        position: relative;
        left: 2px;
        top: 1px;
        transition: left 0.3s;
      }
      #selection-mode-toggle[data-enabled="true"] .toggle-track {
        background-color: rgba(0, 123, 255, 0.2);
      }
      #selection-mode-toggle[data-enabled="true"] .toggle-thumb {
        left: 27px;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(button);

    button.addEventListener("click", toggleSelectionMode);
    updateToggleState();
  }

  function toggleSelectionMode() {
    selectionModeEnabled = !selectionModeEnabled;
    updateToggleState();
  }

  function updateToggleState() {
    const toggle = document.getElementById("selection-mode-toggle");
    toggle.setAttribute("data-enabled", selectionModeEnabled);
  }

  document.addEventListener("mouseover", async (event) => {
    if (!selectionModeEnabled) return;
    const element = event.target;
    try {
      const componentHierarchy = await getComponentInfo(element);
      if (componentHierarchy && componentHierarchy.length > 0) {
        removeBoundingBox();
        const rect = element.getBoundingClientRect();
        currentBoundingBox = createBoundingBox(rect);
        document.body.appendChild(currentBoundingBox);
      } else {
        removeBoundingBox();
      }
    } catch (error) {
      console.error("Error getting component info:", error);
      removeBoundingBox();
    }
  });

  document.addEventListener("mouseout", (event) => {
    removeBoundingBox();
  });

  document.addEventListener("click", async (event) => {
    if (!selectionModeEnabled) return;
    const element = event.target;
    event.preventDefault();
    const componentHierarchy = await getComponentInfo(element);
    if (componentHierarchy && componentHierarchy.length > 0) {
      highlightElement(element);
      fetch("http://localhost:3015/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(componentHierarchy),
      });
    } else {
      console.log("Component Info not found for the clicked element.");
    }
  });

  createToggleButton();
}

if (typeof window !== "undefined") {
  initBrowserCode();
}
