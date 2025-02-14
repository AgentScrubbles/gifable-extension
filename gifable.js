// content.js
(function () {

    let isOpen = false;
    let gifableUrl;
    let gifableApiToken;
    browser.storage.local.get(["GIFABLE_URL", "GIFABLE_TOKEN"]).then((data) => {
        gifableUrl = data.GIFABLE_URL;
        gifableApiToken = data.GIFABLE_TOKEN;
    });

    function sendMessage(message, cb) {
        let myPort = browser.runtime.connect({ name: "port-from-cs" });
      
        myPort.onMessage.addListener((m) => {
          m.log && console.log(m.log);
          cb(m.data);
        });
        message.gifableUrl = gifableUrl;
        message.gifableApiToken = gifableApiToken;
        myPort.postMessage(message)
      }

      function debounce(func, timeout = 200){
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
      }

    function createGifButton(target) {
        if (target.querySelector('.gif-button')) return;
        debugger;
        
        
    


        const button = document.createElement('button');
        button.innerText = '🌈';
        button.className = 'gif-button';
        button.style.marginLeft = '5px';
        button.style.border = 'none';
        button.style.cursor = 'pointer'
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#1D1F24';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'transparent';
        });
        
        button.onclick = () => isOpen ? closeGifModal() : openGifModal(button);

        target.appendChild(button);
    }

    function openGifModal(button) {
        closeGifModal();
        isOpen = true;
        const modal = document.createElement('div');
        modal.className = 'gif-modal';
        modal.style.position = 'absolute';
        modal.style.width = '500px';
        modal.style.maxWidth = '600px';
        modal.style.height = '500px';
        modal.style.maxHeight = '600px'
        modal.style.border = '1px solid #ccc';
        modal.style.backgroundColor = '#101317'
        modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        modal.style.padding = '10px';
        modal.style.overflowY = 'auto';
        modal.style.zIndex = '1000';

        const rect = button.getBoundingClientRect();
        modal.style.bottom = `40px`;
        modal.style.right = `20px`;
        modal.style.padding = '10px'

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search GIFs...';
        searchInput.margin = '10px'
        searchInput.style.marginBottom = '10px';
        
        
        const gifContainer = document.createElement('div');
        gifContainer.className = 'gif-container';
        gifContainer.style.display = 'flex';
        gifContainer.style.flexWrap = 'wrap';
        gifContainer.style.justifyContent = 'space-between';
        gifContainer.style.overflowY = 'auto';
        gifContainer.style.maxHeight = '600px';

        searchInput.oninput = debounce(() => fetchGifs(searchInput.value, gifContainer));

        modal.appendChild(searchInput);
        modal.appendChild(gifContainer);
        document.body.appendChild(modal);
    }

    function closeGifModal() {
        document.querySelectorAll('.gif-modal').forEach(modal => modal.remove());
        isOpen = false;
    }

    async function simulateFileDrop(imageElement, blob, gif) {
         // Convert image URL to Blob
        const file = new File([blob], "image.gif", { type: "image/gif" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput) {
            console.error("File input not found.");
            return;
        }
        fileInput.files = dataTransfer.files;

        // Dispatch the change event to trigger the upload
        const event = new Event("change", { bubbles: true });
        fileInput.dispatchEvent(event);

    }

    async function handleImgClicked(gif, element) {
        console.log(`User selected:`, gif);
        
        const cb = async (blob) => {
            await simulateFileDrop(element, blob, gif)
            closeGifModal();
        }
        sendMessage({
            text: element.src,
            action: 'image'
        }, cb)
    }

    function fetchGifs(query, gifContainer) {

        console.log('posting message')
        const cb = (gifs) => {
            console.log('Ready to show data')
            const grid = document.createElement('div');
            grid.style.display = 'flex';
            grid.style.flexWrap = 'wrap';
            grid.style.justifyContent = 'space-between';
            grid.style.overflowY = 'auto';
            grid.style.maxHeight = '400px';
            grid.style.width = '100%';

            gifs.forEach(gif => {
                const img = document.createElement('img');
                img.src = gif.url;
                img.width = 120;
                img.style.objectFit = 'cover';
                img.style.marginBottom = '5px';
                img.style.cursor = 'pointer'
                img.onclick = () => handleImgClicked(gif, img)
                
                grid.appendChild(img);
            });

            gifContainer.appendChild(grid)

        }
        gifContainer.innerHTML = ''; // Clear out old search
        sendMessage({
            text: query,
            action: 'query'
        }, cb)
    }

    function observeDOMChanges() {
        // Select the target node to observe (typically the body or specific container)
        const targetNode = document.body;  // You can change this to target a specific container if needed
    
        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: true, subtree: true };
    
        // Callback function to execute when mutations are observed
        const callback = function(mutationsList, observer) {
            for (let mutation of mutationsList) {
                    // Loop through added nodes to find elements with class "detail-group"
                  mutation.addedNodes.forEach(node => {
                      if (node?.nodeType === Node.ELEMENT_NODE) {
                          
                          const node = document.body.querySelector('.mx_EmojiButton');
                          createGifButton(node.parentElement)
                      }
                  });
            }
        };
    
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);
    
        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }

    observeDOMChanges();
})();


