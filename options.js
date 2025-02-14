document.addEventListener("DOMContentLoaded", function () {
    const apiUrlInput = document.getElementById("api-url");
    const apiTokenInput = document.getElementById("api-token");
    const saveButton = document.getElementById("save");
    const status = document.getElementById("status");

    // Load saved settings
    browser.storage.local.get(["GIFABLE_URL", "GIFABLE_TOKEN"]).then((data) => {
        if (data.GIFABLE_URL) apiUrlInput.value = data.GIFABLE_URL;
        if (data.GIFABLE_TOKEN) apiTokenInput.value = data.GIFABLE_TOKEN;
    });

    // Save settings when user clicks Save
    saveButton.addEventListener("click", function () {
        const newUrl = apiUrlInput.value.trim();
        const newToken = apiTokenInput.value.trim();

        browser.storage.local.set({
            GIFABLE_URL: newUrl,
            GIFABLE_TOKEN: newToken,
        }).then(() => {
            status.textContent = "Settings saved!";
            setTimeout(() => status.textContent = "", 2000);
        });
    });
});