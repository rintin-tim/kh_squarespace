    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.matchHeight/0.7.2/jquery.matchHeight-min.js"></script>

      <script>
          console.log("script started");
          window.addEventListener('load', function() {

          // window.onload = function() {

      		console.log("start onload function");

              trimDiv();  // potentially debounce trimDiv  runObserver();
              equalizeHeight();
              // $( document ).ready( function() { equalizeHeight(); });
              window.onresize = function() { trimDiv(); };
      		//window.addEventListener('resize', trimDiv);  // consider change for onresize
      		console.log("finish onload function");

          });

          function equalizeHeight() {
              /** for use on the Overview page. Function equalizes the height of the images next to each other. Use jquery plugin: matchHeight
              https://github.com/liabru/jquery-match-height/blob/master/README.md#usage */

              // var testOverviewPage = document.getElementById('collection-5b53a8a6575d1f8f7ce0d584')
              var overviewPage = document.getElementById('collection-5a526ba10d9297f9a596a5cb')
              // console.log('testOverviewPage element result: ' + testOverviewPage)
              // console.log('overviewPage element result: ' + overviewPage)
              if (overviewPage) { $('.image-block-wrapper').matchHeight();
                  console.log('equalise baby');
              }
          }


          function updateBannerScroll() {

              /** maintains the overflow scroll positon when the viewport size
              changes (e.g. portrait to landscape)
              */

             /** store the leftScroll position */
              var scrollPosition = 0

              /** set tolerance */
              var tolerance = 100;

              var viewportWidth = window.innerWidth

              // overflow page element
              var galleryStrip = document.getElementsByClassName("sqs-gallery-design-strip")[0];

              if (galleryStrip && (viewportWidth < 1024) ) {
                  /** listen for any scroll event and run function. but only on mobile. */
                  console.log('screen is smaller than 1024')
                  galleryStrip.onscroll = function() { scrollLog(galleryStrip); };
              }

              function scrollLog(galleryStrip) {

                  /** if there's a large jump, restore the previous scrollPosition, otherwise update the scroll position */

                  console.log('start scrollLog function')
                  element = galleryStrip
                  console.log('current scrollPosition is: ' + scrollPosition)
                  console.log('current scrollLeft is: ' + element.scrollLeft)
                  var stored = scrollPosition
                  var current = element.scrollLeft

                  if (((stored  - current) > tolerance ) && (current < tolerance)) {
                      console.log('large jump. resetting scrollLeft to: ' + scrollPosition)
                      element.scrollLeft = scrollPosition;
                  } else {
                      console.log('within tolerance. scrollPosition updated to: ' + current)
                      scrollPosition = current;
                  }

              }
          }


          function insertCaption(nextLeftArray, captionNames) {

              /** used on the portrait page to insert caption below image. parameters - an list of widths (nextLeftArray) and list of captions.
              Each caption is inserted in the document from the left margin according to the next corresponding LeftArray value. The distances
              are calculated by the trimDiv function  */

              // debouncer

              captionAction = false;

              console.log('insertCaption fired')
              delay = 250

              clearTimeout(captionAction)

              captionAction = setTimeout(function() {
                  internalInsertCaption(nextLeftArray, captionNames);

              }, delay)

              function internalInsertCaption(nextLeftArray, captionNames) {

                  console.log('insertCaption running')
                  captionArray = captionNames // list of captions
                  nextLeftArray.unshift(0) // insert a zero to be the first position
                  nextLeftArray.pop(); // and remove the last value because this is the distance to the end of the last image
                  nextLeftArray.forEach( function(item, index) {
                      var extra = 2
                      item = item + (extra * index)
                  });  // add extra pixels to each item in the list to accomodate the gap between images

                  // console.log(nextLeftArray)

                  // images are inserted multiple times per page load - remove old captions before re-inserting each time.
                  var sqsWrapperOld = document.getElementsByClassName("sqs-wrapper")[0];  // wrapper
                  oldCaptions = document.querySelectorAll("div.sqs-wrapper div"); // captions to be removed

                  console.log("old captions: " + oldCaptions.length)
                  oldCaptions.forEach(function(item, index) {
                  sqsWrapperOld.removeChild(oldCaptions[index]);
                  });

                  // for item in nextLeftArray, insert the next caption at the corresponding position
                  var array = nextLeftArray;

                  array.forEach(function(item, index) {
                 	    var sqsWrapper = document.getElementsByClassName("sqs-wrapper")[0]; // get wrapper. captions overlap briefly if wrapper is placed outside of loop.
                      var newDiv = document.createElement("div");
                      var content = document.createTextNode(captionArray[index]);

                      // create needed css directly in html
                      var styleAttribute = document.createAttribute("style");
                      styleAttribute.value = "position: absolute; z-index: 1; float: left; left: " + item + "px; bottom: -3px; padding-left: 5px;"

                      // insert into page
                      newDiv.setAttributeNode(styleAttribute); // add style to new div
                      newDiv.appendChild(content); // add text to new div
                      sqsWrapper.appendChild(newDiv); // add new div to wrapper

                  });
              }
          }

          function trimDiv() {

              /**
              1. calculates the width of images in the gallery in order to ascertain:
                  1a. the max length of the wrapper element, which Squarespace is over extending
                  1b. the insertion points for captions on the gallery page
              2. trims the max length of the wrapper element according to above (needed particulalry for mobile)
              3. gathers the alt tags for all gallery images into a list - these are then used as captions by the insertCaption function
              4. triggers the above insert caption function
              5. adds fade class to image borders
              5. prevents clicking on the last image in the carousel as this causes the length of a trimmed wrapper to go crazy
               */

              console.log("trim div kicked in");
              var homePage = document.getElementById("collection-5ac681c4aa4a99b176337f89")
              var portraitPage = document.getElementById("collection-5a52a4c753450aea1728c820")

              // skip function if on the homepage
              if (!homePage) {

                  var imgs = document.getElementsByClassName("sqs-gallery-design-strip-slide");  // images within overflow element

                  // check images are loaded before continuing
                  if (imgs.length > 0) {

                  	var nextLeftArray = []  // list of image widths
                      var captionNames = []  // list of caption names

                      var widthTotal = 34; // // add up the total width of all images. includes value for margin on the left and right of screen
                      var testWidth = 0

                      for (var i = 0; i < imgs.length; i++) {
                          // calculate the width of each gallery image
                          imgWidth = imgs[i].clientWidth;

                          // add the widths to a running total
                          widthTotal += imgWidth;
                          testWidth += imgWidth;
                          // console.log(imgs[i].clientWidth);
                          // console.log("total: " + widthTotal);
                          widthTotal += 12; // gap between images

                          // add captions to list
                          capName = imgs[i].getAttribute("alt")
                          captionNames.push(capName)

                          // add widths to list
                          nextLeftArray.push(widthTotal-34) // add to array but compensate for page margin
                          // console.log("with margin total: " + widthTotal);

                          console.log('testWidth is: ' + testWidth)

                          console.log('calculating img.clientWidth and adding widthTotal')

                          // adds fade class used by the CSS for border transition animation
                          imgs[i].classList.add("border-fade");

                      }

                      //console.log("innerWidth: " + window.innerWidth)

                      // set max width of element to the sum of its images within it (plus margins, etc)
                      var elem = document.getElementsByClassName("sqs-wrapper")[0];

                      console.log("setting new maxWidth: " + widthTotal + "px")
                      elem.style.maxWidth = "" + widthTotal + "px";

      //                console.log(nextLeftArray)

                      var galleryStrip = document.getElementsByClassName("sqs-gallery-design-strip")[0];

                      // identify the last image in the carousel clicked and add identifying class
                      var lastImage = imgs[imgs.length - 1];  // find last image
                      var secondLastImage = imgs[imgs.length - 2];
                      var resetFlag = false;
                      var sqsListenerRemoved = false

                      if (portraitPage) {
                          console.log('adding listener')
                          // secondLastImage.addEventListener("click", resetBanner, true );
                          lastImage.addEventListener("click", resetBanner, true );
                      }

                      function imageVisible(el) {
                          var rect = el.getBoundingClientRect();
                          var elemRight = rect.right
                          viewport = window.innerWidth;
                          if (elemRight < viewport) {
                              console.log('image is fully visible')
                              console.log('nudging')
                              nudgeBannerAlong(25);
                              return true;
                          }
                      }

                      function nudgeBannerAlong(pixels) {
                          // if (viewport >= 1025 && viewport <= 1205) {
                              galleryStrip.scrollLeft = pixels;
                          // }

                      }


                      function bannerScrollObserver() {
                          var wrapper = document.getElementsByClassName('sqs-wrapper')[0];
                          scrollDelay = 50
                          /** detects when the banner has finished scrolling  */

                          var debounce = false

                          var bannerScrollObserver = new MutationObserver(function(mutation) {
                              clearTimeout(debounce)
                              debounce = setTimeout( function() {
                                  console.log('finished scroll')
                                  // debugger;
                                  if (imageVisible(lastImage) && !sqsListenerRemoved) {
                                      resetFlag = true;  // set flag to true - reset banner on next click
                                      Y.detach("click", "undefined", lastImage);  // detatch listener on last image (and second to last) - can this go in the click handler?
                                      sqsListenerRemoved = true
                                  } else if (imageVisible(lastImage) && sqsListenerRemoved) {
                                      resetFlag = true
                                  } else {
                                      resetFlag = false;
                                  }

                              }, scrollDelay )

                          })

                      bannerScrollObserver.observe(wrapper, { attributes: true, subtree: false, attributeFilter: ['style'] } )
                      }

                      // test - run banner scroll only if on portrait page???

                      if (portraitPage) {
                          bannerScrollObserver()
                      }

                      function resetBanner(ev) {
                          console.log('resestBanner function')
                          console.log('resetFlag is: ' + resetFlag)
                          if (resetFlag) {
                              console.log('resetBanner true: reset banner: ' + resetFlag)
                              nudgeBannerAlong(0)  // CHECK IF NEEDED
                              elem.style.left = 0;
                              //galleryStrip.scrollLeft = 0; // TODO check if needed
                          } else if ((sqsListenerRemoved) && (ev.target == lastImage)) {
                              var imageRight = lastImage.getBoundingClientRect().right;
                              scrollAmount = imageRight - window.innerWidth;
                              if (scrollAmount > 0) {
                                  console.log('remove from the scroll: ' + scrollAmount)
                                  elemLeftInt = parseFloat(elem.style.left, 10);
                                  extraMargin = 50  // to try and make sure the last image is visible
                                  //debugger;  see why it doesn't work second time around
                                  updatedElemLeftInt = elemLeftInt - (scrollAmount + extraMargin)
                                  // updatedElemLeftInt = elemLeftInt - scrollAmount
                                  console.log('manual resetBanner')
                                  elem.style.left = updatedElemLeftInt.toString() + 'px';
                                  console.log('elem.style.left: ' + elem.style.left)
                                  nudgeBannerAlong(25)  // 1920 px second pass tweak

                                  if (imageVisible(lastImage)) {
                                      resetFlag = true
                                  };
                              }

                          } else {
                              console.log('resetBanner false: do nothing: ' + resetFlag)
                          }
                      }


                      console.log('resetFlag 0: ' + resetFlag)


                      var visibleFlag = false



                      function imageNudgeObserver(nudgePixels) {

                          /** when the last image is active, nudge to the right to ensure it's fully visible using scrollLeft
                          when the last image is not active, remove the nudge  */
                          console.log("last image width is: " + lastImage.clientWidth)
                          // if portrait image nudge along the whole width of the image (should be overkill!)
                          if (lastImage.clientWidth < lastImage.clientHeight) {
                            var nudge = lastImage.clientWidth/3  // in pixels
                          } else {
                            var nudge = nudgePixels/4  // in pixels
                          }

                          // var nudge = lastImage.clientWidth/3

                          var imgObserver = new MutationObserver(function(mutation) {
                          console.log('running imageNudgeObserver')
                          // TODO add to on-click listener?
                          if (lastImage.classList.contains('sqs-active-slide')) {
                              console.log('adding nudge. scrollLeft is: ' + galleryStrip.scrollLeft)
                              /** debouncer for observer */
                              // TODO NOT DEBOUNCING!!!!
                              console.log('hang on for debounce')
                             setTimeout(function() {
                                 galleryStrip.scrollLeft = nudge;
                                 console.log('debounce cleared scrollLeft is now ' + galleryStrip.scrollLeft)
                             }, 250)

                              } else {
                                  console.log('resetting scrollLeft to 0')
                                 galleryStrip.scrollLeft = 0
                              }
                          })

                      console.log('last image: ' + typeof lastImage)
                      //debugger;

                      imgObserver.observe(lastImage, { attributes: true, subtree: false, attributeFilter: ['class'] } )

                      }


                      /** functions to run depending upon portrait page status */

                      // if portrait page - run these functions
                      if (portraitPage) {
                          insertCaption(nextLeftArray, captionNames)  // insert the captions on the portrait page
                          console.log('running portrait mode')
                         // imageNudgeObserver(80) // nudge on portrait
                      }

                      // if not portrait page - run these functions
                      if (!portraitPage) {
                          console.log('running not portrait mode')
                          imageNudgeObserver(100) // nudge if not on the portrait page
                      }
                  }
              } else {
                  console.log('cancel out - on the homepage');  // else clause can be removed
                  }
          };


          function runObserver() {
              /**
              This function uses a mutation observer to detect changes in the data-image-resolution attribute on the banner.
              There are only a few DOM elements
              that fire on each page.
              This functions is responsible for firing trimDiv and updateBannerScroll each time a new page is opened
              */

              console.log("start function runObserver");

              var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

              var element = document.querySelector('#content'); // ouer wrapper used

              // var observerCount = 0  // TBC counts number of times mutation obeserver has run
              // var myTimestamp = 0

              var actions = false // placeholder value for action in the MutationObserver

              var observer = new MutationObserver(function(mutations) {
                  console.log("start new observer");
                  console.log("mutations length :" + mutations.length);

                  // trimDiv();
                  // updateBannerScroll();

                  // debouncing - ensures functions aren't called unnecessarily. These functions execute when another mutation isn't triggered within  the delay (ms)
                  var delay = 400

                  clearTimeout(actions)

                  actions = setTimeout(function() {
                              console.log('ok doing something now')
                              trimDiv();
                              updateBannerScroll();
                              equalizeHeight();
                              }, delay);


              });

              // run observer with below parameters
              observer.observe(element, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ['data-image-resolution'] //listen for changes to this specific attribute only
              });

          }

          console.log("script finished");

      </script>