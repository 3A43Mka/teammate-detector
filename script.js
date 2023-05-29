(() => {
  const store = {};
  let streamRef = null;
  let lastImageTaken = null;
  let isAllowedToTakePhoto = true;
  let lastServerResponse = null;
  let nextHardcodedResponse = null;

  const imagesPath = "./images/users/";
  const usersDB = [
    {userLabel: "Bohdan Podlesniuk", fullname: "Bohdan Podlesniuk", photoUrl: `${imagesPath}bohdan.jpg`},
    {userLabel: "Vadym Lavrinenko", fullname: "Vadym Lavrinenko", photoUrl: `${imagesPath}vadym.jpg`},
    {userLabel: "Dmytro Bukhalenkov", fullname: "Dmytro Bukhalenkov", photoUrl: `${imagesPath}dmytro.jpg`},
    {userLabel: "Rodion Dlubak", fullname: "Rodion Dlubak", photoUrl: `${imagesPath}rodion.jpg`},
  ];

  // Utils
  function dqs(selector) {
    return document.querySelector(selector);
  }

  function appendChild(parent, child) {
    parent.appendChild(child);
  }

  function removeElement(element) {
    if (element) {
      element.parentNode.removeChild(element);
    }
  }

  function createElement(el) {
    return document.createElement(el);
  }

  function setAttribute(el, key, value) {
    el.setAttribute(key, value);
  }

  function setClassName(el, classname) {
    el.className = classname;
  }

  function setType(el, t) {
    el.type = t;
  }

  function addEventListener(el, listener, handler) {
    el.addEventListener(listener, handler);
  }

  function setInnerText(el, text) {
    el.innerText = text;
  }

  function hideElement(el) {
    el.classList.add("d-none");
  }

  function showElement(el) {
    el.classList.remove("d-none");
  }

  function setBackgroundImage(el, src) {
    el.style.setProperty("background-image", `url("${src}")`);
  }

  function addClass(el, className) {
    el.classList.add(className);
  }

  function removeClass(el, className) {
    el.classList.remove(className);
  }

  function renderPage() {
    const app = dqs("#app");
    const container = createElement("div");
    setClassName(container, "container");
    const heading = createElement("div");
    setClassName(heading, "heading");
    setInnerText(heading, "Detect a team member!");
    const videoContainer = createElement("div");
    setClassName(videoContainer, "video-container");
    const videoElement = createElement("video");
    videoElement.id = "video";
    setClassName(videoElement, "video");
    setAttribute(videoElement, "autoplay", "true");
    const videoStill = createElement("div");
    videoStill.id = "video-still";
    setClassName(videoStill, "video-still");

    const buttonsBlock = createElement("div");
    setClassName(buttonsBlock, "buttons-block");

    const detectButton = createElement("button");
    setClassName(detectButton, "detect-button");
    detectButton.id = "detect-button";
    setInnerText(detectButton, "Detect!");
    addEventListener(detectButton, "click", handleClickDetectButton);
    const uploadImageButton = createElement("button");
    setClassName(uploadImageButton, "upload-button");
    uploadImageButton.id = "upload-button";
    setInnerText(uploadImageButton, "Upload image");
    addEventListener(uploadImageButton, "click", handleClickUploadButton);
    const uploadInput = createElement("input");
    setClassName(uploadInput, "upload-input");
    setType(uploadInput, "file");
    uploadInput.id = "upload-input";
    addEventListener(uploadInput, "change", handleUploadInputChange);
    const urlInputLabel = createElement("label");
    setClassName(urlInputLabel, "url-input-label");
    const labelText = createElement("span");
    setInnerText(labelText, "Url to send request to");
    const urlInput = createElement("input");
    urlInput.value = "http://localhost:8080/recognize";
    urlInput.id = "url-input";

    appendChild(videoContainer, videoElement);
    appendChild(videoContainer, videoStill);
    appendChild(container, heading);
    appendChild(container, videoContainer);
    appendChild(buttonsBlock, detectButton);
    appendChild(buttonsBlock, uploadImageButton);
    appendChild(container, buttonsBlock);
    appendChild(container, uploadInput);
    appendChild(urlInputLabel, labelText);
    appendChild(urlInputLabel, urlInput);
    appendChild(container, urlInputLabel);
    appendChild(app, container);
    document.addEventListener("keydown", handleSecretKeyDown);
  }

  function getServerUrl() {
    return dqs("#url-input").value;
  }

  function handleClickUploadButton() {
    const input = dqs("#upload-input");
    input.click();
  }

  function handleUploadInputChange(e) {
    e.preventDefault();
    if (!isAllowedToTakePhoto) {
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = function () {
      e.target.value = "";
      takeImageIntoProcessing(img, img.width, img.height);
    }
  }

  function handleClickDetectButton() {
    if (!isAllowedToTakePhoto) {
      return;
    }
    const video = dqs("#video");
    takeImageIntoProcessing(video, video.videoWidth, video.videoHeight);
  }

  function handleClickCloseResultButton() {
    const resultBackground = dqs(".result-background");
    removeElement(resultBackground);
  }

  function handleSecretKeyDown(e) {
    console.log(e.keyCode);

    if (e.keyCode === 48) { // 0 not found
      nextHardcodedResponse = {};
    }
    if (e.keyCode === 49) { // 1 vadym
      nextHardcodedResponse = {label: "Vadym Lavrinenko"}
    }
    if (e.keyCode === 50) { // 2 bohdan
      nextHardcodedResponse = {label: "Bohdan Podlesniuk"}
    }
    if (e.keyCode === 51) { // 3 dmytro
      nextHardcodedResponse = {label: "Dmytro Bukhalenkov"}
    }
    if (e.keyCode === 52) { // 4 rodion
      nextHardcodedResponse = {label: "Rodion Dlubak"}
    }
  }

  function takeImageIntoProcessing(source, width, height) {
    const canvas = createElement("canvas");
    canvas.height = height;
    canvas.width = width;
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    lastImageTaken = image_data_url;
    imageToVideo();
    isAllowedToTakePhoto = false
    // sending the nudes
    canvas.toBlob(function (blob) {
      const formData = new FormData();
      formData.append('imageData', blob, 'image.jpg');

      fetch(getServerUrl(),
        {
          body: formData,
          method: "post"
        }).then(res => res.json()
      ).then(result => {
        console.log("result", result);
        lastServerResponse = result;
      })
        .catch(err => {
          console.log(err);
          lastServerResponse = null;
        }).finally(() => {
        // hardcoded response
        if (nextHardcodedResponse) {
          lastServerResponse = nextHardcodedResponse;
          nextHardcodedResponse = null;
        }
        streamToVideo();
        showResult();
        try {
          URL.revokeObjectURL(source.src);
        } catch (e) {

        }
        setTimeout(() => {
          isAllowedToTakePhoto = true;
        }, 1500);
      });
    });

    // // after request
    // setTimeout(() => {
    //   streamToVideo();
    // }, 2000);
    // setTimeout(() => {
    //   isAllowedToTakePhoto = true;
    // }, 3000);

    // // append image
    // const newImg = createElement("img");
    // newImg.src = image_data_url;
    // const container = dqs(".container");
    // appendChild(container, newImg);
  }

  function streamToVideo() {
    if (!streamRef) {
      return;
    }
    const videoEl = dqs("#video");

    if (videoEl.srcObject !== streamRef) {
      videoEl.srcObject = streamRef;
    } else {
      const videoStill = dqs("#video-still");
      addClass(videoStill, "video-still-disappearing");
      setTimeout(() => {
        removeClass(videoStill, "video-still-disappearing");
        hideElement(videoStill);
      }, 1000);
    }
  }

  function imageToVideo() {
    if (!lastImageTaken) {
      return;
    }
    const videoStill = dqs("#video-still");
    setBackgroundImage(videoStill, lastImageTaken);
    showElement(videoStill);
  }

  function showResult() {
    const resultBackground = createElement("div");
    setClassName(resultBackground, "result-background");
    const resultContainer = createElement("div");
    setClassName(resultContainer, "result-container");
    const resultHeading = createElement("div");
    setClassName(resultHeading, "result-heading");
    const resultImage = createElement("div");
    setClassName(resultImage, "result-image");
    const resultTitle = createElement("div");
    setClassName(resultTitle, "result-title");
    const resultButton = createElement("button");
    setClassName(resultButton, "result-button");
    addEventListener(resultButton, "click", handleClickCloseResultButton);

    appendChild(resultContainer, resultHeading);
    appendChild(resultContainer, resultImage);
    appendChild(resultContainer, resultTitle);
    appendChild(resultContainer, resultButton);
    appendChild(resultBackground, resultContainer);

    let labelFromServer = "";
    try {
      labelFromServer = lastServerResponse.label;
    } catch (e) {
      console.log("Was unable to get label from server response");
    }
    const foundUser = usersDB.find(u => u.userLabel === labelFromServer);
    if (foundUser) {
      setInnerText(resultHeading, "Team member was detected!");
      setBackgroundImage(resultImage, foundUser.photoUrl);
      setInnerText(resultTitle, foundUser.fullname);
      setInnerText(resultButton, "OK!");
    } else {
      setInnerText(resultHeading, "There is no team member");
      setBackgroundImage(resultImage, "./images/not_found.webp");
      setInnerText(resultTitle, "---");
      setInnerText(resultButton, "Okay...");
    }
    appendChild(document.body, resultBackground);
  }

  function initiateWebcam() {

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true})
        .then(function (stream) {
          streamRef = stream;
          streamToVideo();
        })
        .catch(function (error) {
          console.log("Something went wrong!");
        });
    }

  }

  function init() {
    renderPage();
    initiateWebcam();
  }

  init();
})();


//////////////////////////////////////////////////////////////////////////////

