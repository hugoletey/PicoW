class WinkVideo {
  element;
  videoData;
  controlBarSize;

  constructor(html5VideoElement, videoData) {
    this.element = html5VideoElement;
    if (!videoData) return;
    this.videoData = videoData;
    if (videoData.dataVersion > 1) {
      alert("Wink: Data version doesn't match this player.");
      return;
    }

    // Cache the pixel sizes of each part of the progress bar for layout calculations later.
    this.controlBarSize = {
      playWidth: -1,
      playHeight: -1,
      progressLeftWidth: -1,
      progressRightWidth: -1,
      progressMiddleWidth: -1,
    };

    var me = this;  // for the following closures.

    var playOverlay = this.getPlayOverlay();
    if (playOverlay) {
      playOverlay.onclick = function () {
        playOverlay.style.visibility = "hidden";
        me.element.play();
      }
    }

    var controlBar = this.getControlBar();
    if (controlBar) {
      var playButton = controlBar.getElementsByClassName("winkVideoControlBarPlayButtonClass")[0];
      playButton.onclick = function () {
        me.onPlayClick();
      };
      var pauseButton = controlBar.getElementsByClassName("winkVideoControlBarPauseButtonClass")[0];
      pauseButton.style.visibility = "hidden";  // Hide the pause button initially.
      pauseButton.onclick = function () {
        me.onPauseClick();
      };
      controlBar.onclick = function (ev) {
        // User clicked on the progress part of control bar, to seek the video.
        var emptyMiddle = controlBar.getElementsByClassName("winkVideoControlBarProgressEmptyMiddleClass")[0];
        var filledMiddle = controlBar.getElementsByClassName("winkVideoControlBarProgressFilledMiddleClass")[0];
        if (!ev.target ||
          !emptyMiddle ||
          !filledMiddle ||
          (ev.target != emptyMiddle && ev.target != filledMiddle)) {
          return;
        }
        me.element.currentTime = (me.element.duration * ev.offsetX) / emptyMiddle.offsetWidth;
        me.createClickTargetsForCurrentFrame();
      }
    }

    // Event handlers on the video element.
    this.element.ontimeupdate = function() {
      me.onTimeUpdate();
    };
    this.element.onplay = function () {
      me.onPlay();
    };
    this.element.onpause = function () {
      me.onPause();
    };
    if (this.element.readyState >= this.element.HAVE_FUTURE_DATA) {
      // video element already has enough buffered data, so it won't fire the below event. We
      // manually handle it instead.
      this.onCanPlay();
    } else {
      // video element is still buffering data, so set a handler to be called once it is ready
      // to play.
      this.element.oncanplay = function () {
        me.onCanPlay();
      }
    };
  }

  /**
   * Returns the integer frame number (zero-indexed) of the current video frame being
   * shown right now.
   */
  getCurrentFrame() {
    return Math.floor(this.element.currentTime.toFixed(5) * this.videoData.frameRate);
  }

  /**
   * Seeks the video to the given zero-indexed frame number.
   */
  setCurrentFrame(frame) {
    this.element.currentTime = frame / this.videoData.frameRate;
  }

  /**
   * Gets the container element for this video. The container element is the parent
   * that holds both the video & overlay elements.
   */
  getContainer() {
    var container = this.element;
    while (container != null &&
         container.className != "winkVideoContainerClass") {
      container = container.parentElement;
    }
    return container;
  }

  getFirstByclassName(classname) {
    var container = this.getContainer();
    if (!container) return null;
    var overlays = container.getElementsByClassName(classname);
    if (overlays == null || overlays.length == 0) return null;
    return overlays[0];
  }

  /**
   * Gets the play overlay element for this video. The play overlay element is the
   * layer that is shown at the beginning, allowing user to click to play the video.
   * We need this because browsers don't allow auto play of videos and the user has
   * to click first, hence this overlay to have them click.
   */
  getPlayOverlay() {
    return this.getFirstByclassName("winkVideoPlayOverlayClass");
  }

  /**
   * Gets the overlay element for this video. The overlay element is the parent of
   * all button click targets (next, previous, goto buttons) over the video.
   */  
  getOverlay() {
    return this.getFirstByclassName("winkVideoOverlayClass");
  };

  /**
   * Gets the control bar element for this video.
   */
  getControlBar() {
    return this.getFirstByclassName("winkVideoControlBarClass");
  };

  /**
   * Checks if the given frame has any click targets to show, and if so creates
   * them.
   */
  createClickTargetsForFrame(frame) {
    var videoData = this.videoData;
    var overlay = this.getOverlay();
    if (!videoData || !videoData.frameStops || !overlay) return;

    // Is the current frame one where the video pauses to show buttons?
    var buttons = videoData.frameStops[frame];
    if (!buttons) return;
    var echelle= this.element.getBoundingClientRect().width / this.element.videoWidth ;

    // Add a click target div for each button along with the handler.
    for (var i = 0; i < buttons.length; i++) {
      var div = document.createElement("div");
      div.className = "winkVideoOverlayButtonClass";
      div.rect=buttons[i].rect;
      div.style.left = (div.rect.x * echelle) + "px";
      div.style.top = (div.rect.y * echelle) + "px";
      div.style.width = (div.rect.width * echelle) + "px";
      div.style.height = (div.rect.height * echelle) + "px";
      div.onclick = function (winkVideo, type, target, windowName) {
        return function () {
          if (type == "gotoframe") {
            winkVideo.setCurrentFrame(target);
            winkVideo.element.play();
          }
        };
      }(this, buttons[i].type, buttons[i].target, buttons[i].window);
      overlay.appendChild(div);
    }
  }

  /**
   * Checks if the current frame has any click targets to show, and if so creates
   * them.
   */
  createClickTargetsForCurrentFrame() {
    var videoData = this.videoData;
    var overlay = this.getOverlay();
    if (!videoData || !videoData.frameStops || !overlay) return;

    // Remove any click targets we've created for previously shown frames.
    this.clearClickTargetsForCurrentFrame();

    // Is the current frame one where the video pauses to show buttons?
    // Buttons are shown for a bunch of video frames so that if our browser calls the JS callback
    // a little late we can still stop and show the buttons to click on. Here we check if the user
    // is seeking to one such frame that shows buttons and if so sets up the click targets.
    var frame = this.getCurrentFrame() - videoData.buttonFrameOffset;
    for (var f = 0; f < videoData.buttonFrameLength; f++, frame++) {
      if (frame in videoData.frameStops) {
        this.createClickTargetsForFrame(frame);
        break;
      }
    }
  }

  clearClickTargetsForCurrentFrame() {
    // Clear out any click targets created for the previous stop frame.
    var overlay = this.getOverlay();
    if (!overlay) return;
    while (overlay.firstChild)
      overlay.removeChild(overlay.firstChild);
  }

  /**
   * Register with requestAnimationCallback.
   */
  registerAnimationCallback() {
    window.requestAnimationFrame(function (winkVideo) {
      return function () {
        winkVideo.animationCallback();
      };
    }(this));
  };

  /**
   * This callback is invoked by requestAnimationFrame at regular intervals. If
   * the video has reached a frame at which it should be paused, this function
   * pauses the video and creates the necessary button click targets. If not, it
   * keeps going until such a frame is reached or the video ends.
   */
  animationCallback() {
    // If the video was paused, just return. We'll get called again when video
    // starts playing.
    var videoData = this.videoData;
    if (this.element.paused || !videoData) return;

    // Should we pause in this frame?
    var frame = this.getCurrentFrame();
    if (frame in videoData.frameStops) {
      this.element.pause();
      this.createClickTargetsForCurrentFrame();
    } else {
      // ask for a callback asap, so we can check the next video frame.
      this.registerAnimationCallback();
    }
  };

  /**
   * Invoked whenever the wink video resumes playing. Clears all button click
   * targets created for the previous stop frame and starts looking for the next
   * frame to pause at.
   */
  onPlay() {
    // Show the pause button (on top of the play button)
    var controlBar = this.getControlBar();
    controlBar.getElementsByClassName("winkVideoControlBarPauseButtonClass")[0].style.visibility = "visible";

    // Clear out any click targets created for the previous stop frame.
    this.clearClickTargetsForCurrentFrame();

    // Start animation callback to look for the next frame to pause at.
    this.registerAnimationCallback();
  };

  /**
   * Invoked whenever the wink video gets paused, either via the control bar or when it
   * reaches a frame with buttons.
   */
  onPause() {
    // Hide the pause button, so the play button shows through.
    var controlBar = this.getControlBar();
    controlBar.getElementsByClassName("winkVideoControlBarPauseButtonClass")[0].style.visibility = "hidden";
  };

  /**
   * Callback received in regular intervals from the video element while it's playing.
   * We update the progress bar position here.
   */
  onTimeUpdate() {
    var controlBar = this.getControlBar();
    if (!controlBar) return;
    var cbSize = this.controlBarSize;
    var filledWidthMax = this.element.getBoundingClientRect().width - cbSize.playWidth - cbSize.progressLeftWidth - cbSize.progressRightWidth;
    var element = controlBar.getElementsByClassName("winkVideoControlBarProgressFilledMiddleClass")[0];
    var pos = Math.floor((filledWidthMax * this.element.currentTime) / this.element.duration);
    element.style.width = pos + "px";
  };

  /*
   * Layout the various parts of the control bar, if present.
   */
  layoutControlBar() {
    var cbSize = this.controlBarSize;

    // Set the height of container & play overlay to include both the video & control bar if present.
    var totalHeight = this.element.getBoundingClientRect().height + cbSize.playHeight;
    this.getContainer().style.height = totalHeight + "px";
    this.getPlayOverlay().style.height = totalHeight + "px";
    this.getPlayOverlay().style.width = this.element.getBoundingClientRect().width + "px";

    var controlBar = this.getControlBar();
    if (!controlBar) return;

    controlBar.style.top = this.element.getBoundingClientRect().height + "px";
    controlBar.style.width = this.element.getBoundingClientRect().width + "px";
    controlBar.style.height = cbSize.playHeight + "px";
    var element = controlBar.getElementsByClassName("winkVideoControlBarPlayButtonClass")[0];
    element.style.width = cbSize.playWidth + "px";
    element = controlBar.getElementsByClassName("winkVideoControlBarPauseButtonClass")[0];
    element.style.width = cbSize.playWidth + "px";
    element = controlBar.getElementsByClassName("winkVideoControlBarProgressLeftClass")[0];
    element.style.left = cbSize.playWidth + "px";
    element.style.width = cbSize.progressLeftWidth + "px";
    element = controlBar.getElementsByClassName("winkVideoControlBarProgressFilledMiddleClass")[0];
    element.style.left = cbSize.playWidth + cbSize.progressLeftWidth + "px";
    element = controlBar.getElementsByClassName("winkVideoControlBarProgressEmptyMiddleClass")[0];
    element.style.left = cbSize.playWidth + cbSize.progressLeftWidth + "px";
    element.style.width = (this.element.getBoundingClientRect().width - cbSize.playWidth - cbSize.progressLeftWidth - cbSize.progressRightWidth) + "px";
    element = controlBar.getElementsByClassName("winkVideoControlBarProgressRightClass")[0];
    element.style.left = (this.element.getBoundingClientRect().width - cbSize.progressRightWidth) + "px";
    element.style.width = cbSize.progressRightWidth + "px";
  };

  /**
   * Click handler for the play button in the control bar.
   * We start playing from the next frame, so if it had paused on a frame with buttons
   * they don't pause the video again.
   */
  onPlayClick() {
    this.setCurrentFrame(this.getCurrentFrame() + 1);
    this.element.play();
  };

  /**
   * Click handler for the pause button in the control bar.
   */
  onPauseClick() {
    this.element.pause();
  };

  /**
   * Event handler that gets called once video is ready to play with at least a few frames.
   * This indicates valid video so we set up the UI to handle playback.
   */
  onCanPlay() {
    // Create any click targets needed for the very first frame of video.
    this.createClickTargetsForCurrentFrame();

    // We load all the control bar images into memory and cache the pixel sizes, so that
    // we can use them in layout calculations later.
    // After each image loads, we set a new 'src' and it calls this same function when finished.
    // If the image was not present in a control bar, the width & height attributes will be
    // invalid and that's ok.
    var winkVideo = this;
    var imageLoadOrErrorHandler = function () {
      if (winkVideo.controlBarSize.playWidth == -1) {
        winkVideo.controlBarSize.playWidth = this.width;
        winkVideo.controlBarSize.playHeight = this.height;
        this.src = "img/progressleft.png";
      } else if (winkVideo.controlBarSize.progressLeftWidth == -1) {
        winkVideo.controlBarSize.progressLeftWidth = this.width;
        this.src = "img/progressright.png";
      } else if (winkVideo.controlBarSize.progressRightWidth == -1) {
        winkVideo.controlBarSize.progressRightWidth = this.width;
        this.src = "img/progressemptymiddle.png";
      } else if (winkVideo.controlBarSize.progressMiddleWidth == -1) {
        winkVideo.controlBarSize.progressMiddleWidth = this.width;
        winkVideo.layoutControlBar();  // all loaded, so layout the control bar.
      }
    };
    var image = new Image();
    image.onload = imageLoadOrErrorHandler;
    image.onerror = imageLoadOrErrorHandler;
    image.src = "img/playnormal.png";  // start loading.
  }

  resize() {
    var echelle= this.element.getBoundingClientRect().width / this.element.videoWidth ;
    var classElements = document.getElementsByClassName("winkVideoOverlayButtonClass");
    for (var index = 0; index < classElements.length; index++) {
      var div=classElements[index];
      div.style.left = (div.rect.x * echelle) + "px";
      div.style.top = (div.rect.y * echelle) + "px";
      div.style.width = (div.rect.width * echelle) + "px";
      div.style.height = (div.rect.height * echelle) + "px";
    }
    this.layoutControlBar();
    this.onTimeUpdate();
  }
}