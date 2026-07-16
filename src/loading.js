import { rootElement } from "./main";

export function renderLoadingScreen(message = "Lade...") {
  rootElement.innerHTML = getLoadingHtml(message);
}

function getLoadingHtml(message) {
  return `
    <div class="loading">
        <div class="loading__message">${message}</div>
        <div class="lds-heart">
          <div></div>
        </div>
      </div>
    
    `;
}
