(() => {
  const store = {};
  let streamRef = null;
  let lastImageTaken = null;
  let isAllowedToTakePhoto = true;

  // Utils
  function dqs(selector) {
    return document.querySelector(selector);
  }
  function appendChild(parent, child) {
    parent.appendChild(child);
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
    const videoContainer = createElement("div");
    setClassName(videoContainer, "video-container");
    const videoElement = createElement("video");
    videoElement.id = "video";
    setClassName(videoElement, "video");
    setAttribute(videoElement, "autoplay", "true");
    const videoStill = createElement("div");
    videoStill.id = "video-still";
    setClassName(videoStill, "video-still");
    const detectButton = createElement("button");
    setClassName(detectButton, "detect-button");
    detectButton.id = "detect-button";
    setInnerText(detectButton, "Detect!");
    addEventListener(detectButton, "click", handleClickDetectButton);
    const urlInputLabel = createElement("label");
    setClassName(urlInputLabel, "url-input-label");
    const labelText = createElement("span");
    setInnerText(labelText, "Url to send request to");
    const urlInput = createElement("input");
    urlInput.value = "https://httpbin.org/post";
    urlInput.id = "url-input";

    appendChild(videoContainer, videoElement);
    appendChild(videoContainer, videoStill);
    appendChild(container, videoContainer);
    appendChild(container, detectButton);
    appendChild(urlInputLabel, labelText);
    appendChild(urlInputLabel, urlInput);
    appendChild(container, urlInputLabel);
    appendChild(app, container);
  }

  function getServerUrl() {
    return dqs("#url-input").value;
  }

  function handleClickDetectButton() {
    if (!isAllowedToTakePhoto) {
      return;
    }
    console.log("detect");
    const canvas = createElement("canvas");
    const video = dqs("#video");
    console.log("video.height", video.videoHeight);
    console.log("video.width", video.videoWidth);
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    lastImageTaken = image_data_url;
    imageToVideo();
    isAllowedToTakePhoto = false
    // sending the nudes
    canvas.toBlob(function(blob) {
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      fetch(getServerUrl(),
        {
          body: formData,
          method: "post"
        }).then(res => res.json()
      ).then(result => {
        console.log("result", result);
      })
        .catch(err => {
        console.log(err);
      }).finally(() =>  {
        streamToVideo();
        setTimeout(() => {
          isAllowedToTakePhoto = true;
        }, 1500);
      })
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

  function initiateWebcam() {

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
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

