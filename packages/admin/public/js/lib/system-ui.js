(function (system, tween) {
  system.UI = system.ui = new SystemUI();



  /**
   * System ui
   */
  function SystemUI() {
    this.DEFAULTS = {
      animationDuration: 1
    };
    this.COMPONENT_STRUCTURE = {
      el: null,
      events: {},
      on: function (event, handler) {
        this.events[event] = handler;
      },
      trigger: function (event) {
        if (this.events[event])
          this.events[event].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    };
    this.body = document.getElementsByTagName("body")[0];
    this.components = {
      body: this.body
    };
    this.forms = {};
    this.elements = {};
    this.containers = {};
    this.templates = {};
    this.behaviors = {};
  }

  SystemUI.prototype.utility = {
    viewRegex: /\{\{([^\{\}]*)\}\}/g
  };

  // Simply replace {{key}} with its value in the template string and returns it
  SystemUI.prototype.utility.populate = function (template, data) {
    template = template.replace(this.viewRegex, function (match, key) {
      //eval make it possible to reach nested objects
      return eval("data." + key) || "";
    });
    return template;
  };

  SystemUI.prototype.utility.hasClass = function (element, className) {
    if (element.classList)
      return  element.classList.contains(className);
    else
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
  };

  SystemUI.prototype.utility.addClass = function (el, className) {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  };

  SystemUI.prototype.utility.removeClass = function (el, className) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  };

  SystemUI.prototype.utility.toTreeObject = function (element) {
    var jsTree = {
      _: element,
      _children: []
    };
    var indexIndicator = {};
    for (var index in element.childNodes) {
      var node = element.childNodes[index];

      if (node.nodeType === Node.ELEMENT_NODE) {
        var key = node.nodeName.toLowerCase();
        if (indexIndicator[key]) {
          indexIndicator[key]++;
          jsTree[key + '_' + indexIndicator[key]] = System.ui.utility.toTreeObject(node);
        } else {
          indexIndicator[key] = 1;
          jsTree[node.nodeName.toLowerCase()] = System.ui.utility.toTreeObject(node);
        }

        jsTree._children.push(node);
      }
    }

    return jsTree;
  };

  SystemUI.prototype.behaviorProxy = function (component, behaviorId) {
    var ui = this;
    var proxied = function () {
      Array.prototype.unshift.call(arguments, component);
      if (!ui.behaviors[behaviorId]) {
        throw 'Behavior does not exist: ' + behaviorId;
      }

      ui.behaviors[behaviorId].apply(null, arguments);
    };

    return proxied;
  };

  /**
   * 
   * @param {type} behavior The behavior method that should apply on `hostObject`
   * @param {type} hostObject The object that will be passed to the behavior method as the host
   * @returns {mixed} Returned value from behavior method
   */
  SystemUI.prototype.behave = function (behavior, hostObject) {
    if ('function' !== typeof (behavior)) {
      var error = new Error('Behavior should be a function ');
      throw error;
    }

    var proxiedBehavior = function () {
      Array.prototype.unshift.call(arguments, hostObject);
      return behavior.apply(null, arguments);
    };

    return proxiedBehavior;
  };

  SystemUI.prototype.clone = function (obj) {
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i))
      {
        target[i] = obj[i];
      }
    }
    return target;
  }

  SystemUI.prototype.getCenterPoint = function (rect) {
    var pos = document.activeElement.getBoundingClientRect();
    return         {
      left: rect.left + (rect.width / 2),
      top: rect.top + (rect.height / 2)
    };

  };

  SystemUI.prototype.createModal = function (ori, text) {
    var lockPane;
    var modal = system.UI.clone(system.UI.COMPONENT_STRUCTURE);
    modal.close = function () {

    };

    modal.dispose = function () {

    };

    modal.remove = function () {
      this.el.parentNode.removeChild(this.el);
    };

    modal.el = document.createElement("div"); //or use jQuery's $("#photo")
    modal.el.className = "dialog center open";
    modal.el.innerHTML = "<h1 class='dialog-header-bar'>" + text + "</h1><div class='dialog-content-pane'></div><div class='dialog-action-bar'></div>";
    var origin = ori || document.activeElement;

    var loadModal = setTimeout(function () {
      lockPane = system.UI.lock(document.getElementsByClassName("app-pane")[0]);
      document.getElementsByTagName("body")[0].appendChild(modal.el);
      system.UI.animation.transform({
        from: loader.el,
        to: modal.el,
        el: modal.el,
        time: .4,
        flow: true,
        onComplete: function () {
          loader.dispose();
          origin.style.visibility = "hidden";

        }
      });

    }, 1000);

    var loader = system.UI.animation.toLoader(origin, "btn-loader");
    loader.on("cancel", function () {
      clearTimeout(loadModal);
    });

    //origin.style.opacity = "0";
    modal.el.addEventListener("click", function () {
      lockPane.dispose();
      system.UI.animation.scaleTransform({
        from: modal.el,
        to: origin,
        time: .6,
        onComplete: function () {
          origin.style.visibility = "";
        }
      });
      modal.remove();
    });
  };
  /**
   * 
   * @param {object} conf
   * @param {number} t
   * @returns {HTMLElement}
   */
  SystemUI.prototype.lock = function (conf, t) {
    var _this = this;
    t = t || system.UI.DEFAULTS.animationDuration;
    var sourceRect = conf.element.getBoundingClientRect();
    var ss = window.getComputedStyle(conf.element);
    var lockPane = document.createElement("div");
    lockPane.className = "lock-pane";
    lockPane.style.position = "fixed";
    lockPane.style.left = sourceRect.left + 'px';
    lockPane.style.top = sourceRect.top + 'px';
    lockPane.style.width = sourceRect.width + "px";
    lockPane.style.height = sourceRect.height + "px";
    lockPane.style.zIndex = (ss.zIndex === "0" || ss.zIndex === "auto") ? 1 : ss.zIndex;
    //conf.element.style.opacity = .5;
    //lockPane.style.transition = "opacity " + t + "s";

    if (conf.akcent) {
      var akcent = document.createElement("div");
      akcent.className = conf.akcent;
      akcent.style.transform = "scale(0)";
      lockPane.appendChild(akcent);
      tween.to(akcent, t, {
        transform: "scale(1)",
        ease: Back.easeOut.config(2),
        y: 0
      });
    }

    conf.element.parentNode.insertBefore(lockPane, conf.element.nextSibling);
    tween.to(lockPane, t, {
      className: "lock-pane show"
    });


    lockPane.dispose = function (fast) {
      if (conf.akcent) {
        tween.to(akcent, fast ? 0 : t, {
          transform: "scale(.5)",
          opacity: 0,
          ease: "Power2.easeInOut"
        });
      }

      tween.to(lockPane, fast ? 0 : t, {
        opacity: "0",
        onComplete: function () {
          lockPane.parentNode.removeChild(lockPane);
        }
      });

    };

    return lockPane;
  };

  SystemUI.prototype.animations = SystemUI.prototype.Animation = {
    transformBetween: function (conf) {
      var time = conf.time || system.UI.DEFAULTS.animationDuration;
      var sourceRect = conf.from.getBoundingClientRect();
      var distRect = conf.to.getBoundingClientRect();
      var ss = window.getComputedStyle(conf.from);
      var ds = window.getComputedStyle(conf.to);

      tween.fromTo(conf.el, time, {
        opacity: .1,
        left: sourceRect.left,
        top: sourceRect.top,
        borderRadius: distRect.width * parseInt(ss.borderRadius, 10) / sourceRect.width,
        margin: 0,
        transform: "scale(" + sourceRect.width / distRect.width + "," + sourceRect.height / distRect.height + ")",
        //boxShadow: ss.boxShadow,
        transformOrigin: "0 0"
      }, {
        opacity: 1,
        left: ds.left,
        top: ds.top,
        margin: ds.margin,
        transform: "scale(1,1)",
        borderRadius: ds.borderRadius,
        //boxShadow: ds.boxShadow,
        ease: conf.ease || "Power2.easeInOut",
        onComplete: function () {
          if (conf.onComplete)
            conf.onComplete();
        }
      });
    },
    slideOut: function (conf) {
      var t = conf.time || system.UI.DEFAULTS.animationDuration,
              sourceRect = conf.element.getBoundingClientRect(),
              direction = conf.to;

      tween.to(conf.element, t, {
        left: -sourceRect.width,
        ease: conf.ease || "Power2.easeInOut",
        delay: conf.delay || 0,
        onComplete: function () {
          conf.element.style.visibility = "";

          if (conf.onComplete)
            conf.onComplete();
        }
      });
    },
    slideIn: function (conf) {
      var t = conf.time || system.UI.DEFAULTS.animationDuration,
              sourceRect = conf.element.getBoundingClientRect(),
              direction = conf.from,
              transformBox = document.createElement("div"),
              sourceStyle = window.getComputedStyle(conf.element, null);

      transformBox.style.position = "absolute";
      transformBox.style.textAlign = "center";
      transformBox.style.backgroundColor = (sourceStyle.backgroundColor.indexOf("rgba") !== -1 ||
              sourceStyle.backgroundColor === "transparent") ? "rgb(190,190,190)" : sourceStyle.backgroundColor;
      transformBox.style.boxShadow = sourceStyle.boxShadow;
      transformBox.style.borderRadius = sourceStyle.borderRadius;
      //transformBox.style.padding = ss.padding;
      transformBox.style.color = conf.textColor || sourceStyle.color;
      transformBox.style.fontSize = sourceStyle.fontSize;
      transformBox.style.fontWeight = sourceStyle.fontWeight;
      transformBox.style.lineHeight = sourceRect.height + 'px';
      transformBox.style.textTransform = sourceStyle.textTransform;
      transformBox.style.zIndex = (sourceStyle.zIndex === "0" || sourceStyle.zIndex === "auto") ? 1 : sourceStyle.zIndex;
      transformBox.style.overflow = "hidden";
      if (conf.text) {
        transformBox.innerHTML = conf.text;
      }

      conf.element.style.visibility = "hidden";

      system.UI.body.appendChild(transformBox);

      tween.fromTo(transformBox, t, {
        width: sourceRect.width,
        height: sourceRect.height,
        left: -sourceRect.width,
        lineHeight: sourceRect.height + 'px',
        fontSize: '3em'
      }, {
        left: 0,
        ease: conf.ease || "Power2.easeInOut",
        delay: conf.delay || 0,
        onComplete: function () {
          conf.element.style.visibility = "";

          if (conf.fade > 0) {
            tween.to(transformBox, conf.fade, {
              opacity: 0,
              ease: "Power0.easeNone",
              onComplete: function () {
                transformBox.parentNode.removeChild(transformBox);
              }
            });
          } else {
            transformBox.parentNode.removeChild(transformBox);
          }

          if (conf.onComplete)
            conf.onComplete();
        }
      });
    },
    blastTo: function (conf) {
      var t = conf.time || system.UI.DEFAULTS.animationDuration;
      //var sourceRect = conf.from.getBoundingClientRect();
      //var sourceRect = conf.fromPoint;
      var sourceRect = conf.fromPoint;
      var distRect = conf.area.getBoundingClientRect();
      var to = conf.to.getBoundingClientRect();
      var wrapper = document.createElement("div");
      var blast = document.createElement("div");
      //var sourceStyle = window.getComputedStyle(conf.from, null);
      var ds = window.getComputedStyle(conf.area, null);
      var radius = distRect.width > distRect.height ? distRect.width : distRect.height;

      tween.set(wrapper, {
        position: 'absolute',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
      });
//      wrapper.style.position = "absolute";
//      /*wrapper.style.textAlign = "center";
//       wrapper.style.fontSize = "3em";
//       wrapper.style.lineHeight = radius + 'px';
//       wrapper.style.whiteSpace = "nowrap";*/
//      //wrapper.style.zIndex = (ds.zIndex === "0" || ds.zIndex === "auto") ? 1 : ds.zIndex;
//      wrapper.style.zIndex = "";
//      wrapper.style.overflow = "hidden";
//      //wrapper.style.width = distRect.width + "px";
//      //wrapper.style.height = distRect.height + "px";
//      wrapper.style.width = "100%";
//      wrapper.style.height = "100%";
//      //wrapper.style.top = distRect.top + "px";
//      //wrapper.style.left = distRect.left + "px";
//      wrapper.style.top = "0px";
//      wrapper.style.left = "0px";
      //wrapper.style.borderRadius = ds.borderRadius;

      blast.style.position = "absolute";
      blast.style.backgroundColor = (ds.backgroundColor.indexOf("rgba") !== -1 ||
              ds.backgroundColor === "transparent") ? "rgb(190,190,190)" : ds.backgroundColor;

      if (conf.color) {
        blast.style.backgroundColor = conf.color;
      }
      blast.style.width = blast.style.height = radius + "px";
      blast.style.borderRadius = "50%";
      blast.style.zIndex = 1;

      //var initScale = sourceRect.width < sourceRect.height ? sourceRect.width / distRect.width : sourceRect.height / distRect.height;
      blast.style.transform = "scale(0)";
      blast.style.top = (sourceRect.top + (sourceRect.height / 2)) - (radius / 2) - distRect.top + "px";
      blast.style.left = (sourceRect.left + (sourceRect.width / 2)) - (radius / 2) - distRect.left + "px";

      if (conf.text) {
        blast.innerHTML = conf.text;
      }

      //conf.to.style.visibility = "hidden";
      if (conf.flow) {
        //conf.from.style.visibility = "hidden";
        //conf.from.style.transition = "none";
      }

      wrapper.appendChild(blast);

      //wrapper
      conf.area.style.position = "relative";
      conf.area.appendChild(wrapper);
      if (conf.from)
        tween.to(conf.from, t / 2, {
          opacity: 0
        });

      tween.to(blast, t, {
        transform: "scale(1.42)",
        top: (distRect.height - radius) / 2,
        left: (distRect.width - radius) / 2,
        //transformOrigin: "50% 50%",
        //top: (sourceRect.top-radius)/2,
        //left: (sourceRect.left-radius)/2,
        ease: "Power2.easeInOut",
        onComplete: function () {
          //conf.area.style.position = "";
          //conf.to.style.visibility = "";
          //conf.to.style.opacity = "1";
          //conf.from.style.transition = "";
          if (conf.fade > 0) {
            tween.to(wrapper, conf.fade, {
              opacity: 0,
              ease: "Power0.easeNone",
              onComplete: function () {
                conf.area.style.position = "";
                wrapper.parentNode.removeChild(wrapper);
              }
            });
          } else {
            wrapper.parentNode.removeChild(wrapper);
          }

          if (conf.onComplete)
            conf.onComplete();
        }
      });
    },
    transform: function (conf) {
      var t = conf.time || system.UI.DEFAULTS.animationDuration;
      var sourceRect = conf.from.getBoundingClientRect();
      var distRect = conf.to.getBoundingClientRect();
      var transformBox = document.createElement("div");
      var sourceStyle = window.getComputedStyle(conf.from, null);
      var ds = window.getComputedStyle(conf.to, null);

      tween.set(transformBox, {
        position: 'absolute',
        x: sourceRect.left,
        y: sourceRect.top,
//        textAlign: 'center',
        backgroundColor: (sourceStyle.backgroundColor.indexOf("rgba") !== -1 ||
                sourceStyle.backgroundColor === "transparent") ? "rgb(190,190,190)" : sourceStyle.backgroundColor,
        boxShadow: sourceStyle.boxShadow,
        borderRadius: sourceStyle.borderRadius,
//        color: conf.textColor || sourceStyle.color,
//        fontSize: sourceStyle.fontSize,
//        fontWeight: sourceStyle.fontWeight,
//        lineHeight: sourceRect.height + 'px',
//        textTransform: sourceStyle.textTransform,
//        whiteSpace: "nowrap",
        zIndex: (ds.zIndex === "0" || ds.zIndex === "auto") ? 1 : ds.zIndex,
        overflow: "hidden",
        transformOrigin: "top left",
        width: sourceRect.width + 'px',
        height: sourceRect.height + 'px',
        left: 0,
        top: 0
      });

//      if (conf.text) {
//        transformBox.innerHTML = conf.text;
//      }

      conf.to.style.visibility = "hidden";
      if (conf.flow) {
        conf.from.style.visibility = "hidden";
        conf.from.style.transition = "none";
      }

      system.UI.body.appendChild(transformBox);

      setTimeout(function () {
        animate();
      }, 1);

      function animate() {
        tween.to(transformBox, t, {
          width: distRect.width,
          height: distRect.height,
          x: distRect.left,
          y: distRect.top,
          lineHeight: distRect.height + 'px',
          fontSize: '3em',
          backgroundColor: (ds.backgroundColor.indexOf("rgba") !== -1 ||
                  ds.backgroundColor === "transparent") ? "rgb(190,190,190)" : ds.backgroundColor,
          //boxShadow: ds.boxShadow,
          borderRadius: ds.borderRadius,
          ease: conf.ease || "Power2.easeInOut",
          delay: conf.delay || 0,
          onComplete: function () {
            conf.from.style.transition = "";
            conf.to.style.visibility = "";

            if (conf.fade > 0) {
              tween.to(transformBox, conf.fade, {
                opacity: 0,
                ease: "Power0.easeNone",
                delay: .01,
                onComplete: function () {
                  transformBox.parentNode.removeChild(transformBox);
                }
              });
            } else {
              transformBox.parentNode.removeChild(transformBox);
            }

            if (conf.onComplete) {
              conf.onComplete();
            }
          }
        });
      }
    },
    /**
     * 
     * @param {object} conf
     * @returns {undefined}
     */
    sizeTransform: function (conf) {
      var t = conf.time || system.UI.DEFAULTS.animationDuration;
      var sourceRect = conf.from.getBoundingClientRect();
      var distRect = conf.to.getBoundingClientRect();
      var transformBox = document.createElement("div");
      //var sourceStyle = window.getComputedStyle(conf.from, null);
      //var ds = window.getComputedStyle(conf.to, null);
      transformBox.style.position = "absolute";
      transformBox.style.textAlign = "center";
      transformBox.className = conf.to.className;

      conf.to.style.visibility = "hidden";
      if (conf.flow) {
        conf.from.style.visibility = "hidden";
        conf.from.style.transition = "none";
      }

      if (conf.to.parentNode) {
        conf.to.parentNode.appendChild(transformBox);
      } else {
        system.UI.body.appendChild(transformBox);
      }

      tween.fromTo(transformBox, t, {
        width: sourceRect.width,
        height: sourceRect.height,
        left: sourceRect.left,
        top: sourceRect.top
                //opacity: 1
      }, {
        width: distRect.width,
        height: distRect.height,
        left: distRect.left,
        top: distRect.top,
        ease: conf.ease || "Power2.easeInOut",
        onComplete: function () {
          conf.to.style.visibility = "";
          conf.from.style.transition = "";
          if (conf.fade > 0) {
            tween.to(transformBox, conf.fade, {
              opacity: 0,
              ease: "Power0.easeNone",
              onComplete: function () {
                transformBox.parentNode.removeChild(transformBox);
              }
            });
          } else {
            transformBox.parentNode.removeChild(transformBox);
          }

          if (conf.onComplete)
            conf.onComplete();
        }
      });
    },
    /**
     * 
     * @param {object} conf
     * @returns {undefined}
     */
    rippleOut: function (conf) {
      var t = conf.time || system.UI.DEFAULTS.animationDuration;
      var sourceRect = conf.from.getBoundingClientRect();
      var distRect = conf.to.getBoundingClientRect();
      var transformBox = document.createElement("div");
      var ds = window.getComputedStyle(conf.to, null);
      transformBox.style.position = "absolute";
      transformBox.style.textAlign = "center";
      transformBox.style.borderRadius = "50%";
      transformBox.style.backgroundColor = ds.backgroundColor;
      transformBox.style.zIndex = ds.zIndex;

      conf.to.style.visibility = "hidden";
      if (conf.flow) {
        conf.from.style.visibility = "hidden";
        conf.from.style.transition = "none";
      }

      if (conf.to.parentNode) {
        conf.to.parentNode.appendChild(transformBox);
      } else {
        system.UI.body.appendChild(transformBox);
      }
      var width = distRect.width > distRect.height ? distRect.width : distRect.height,
              halfWidth = distRect.width / 2,
              sourceLeft = sourceRect.left + (sourceRect.width / 2),
              sourceTop = sourceRect.top + (sourceRect.height / 2);
      tween.fromTo(transformBox, t, {
        width: width,
        height: width,
        left: sourceLeft - halfWidth,
        top: sourceTop - halfWidth,
        transform: "scale(0)"
                //opacity: 1
      }, {
        transform: "scale(2)",
        ease: conf.ease || "Power2.easeInOut",
        delay: conf.delay || 0,
        onComplete: function () {
          conf.to.style.visibility = "";
          conf.from.style.transition = "";
          if (conf.fade > 0) {
            tween.to(transformBox, conf.fade, {
              opacity: 0,
              ease: "Power0.easeNone",
              onComplete: function () {
                transformBox.parentNode.removeChild(transformBox);
              }
            });
          } else if (transformBox.parentNode) {
            transformBox.parentNode.removeChild(transformBox);
          }

          if (conf.onComplete)
            conf.onComplete();
        }
      });
    },
    scaleTransform: function (conf) {
      var time = conf.time || system.UI.DEFAULTS.animationDuration;
      var ease = conf.ease || "Power2.easeInOut";
      var sourceRect = conf.from.getBoundingClientRect();
      var distRect = conf.to.getBoundingClientRect();
      //console.log(sourceRect, distRect);
      var distBox = document.createElement("div");
      var sourceStyle = window.getComputedStyle(conf.from, null);
      var distStyle = window.getComputedStyle(conf.to, null);
      distBox.style.position = "absolute";
      distBox.style.backgroundColor = (distStyle.backgroundColor.indexOf("rgba") !== -1 ||
              distStyle.backgroundColor === "transparent") ? "rgb(255,255,255)" : distStyle.backgroundColor;
      distBox.style.boxShadow = distStyle.boxShadow;
      distBox.style.borderRadius = conf.to.style.borderRadius;
      distBox.style.padding = distStyle.padding;
      distBox.style.color = distStyle.color;
      distBox.style.fontSize = distStyle.fontSize;
      distBox.style.fontWeight = distStyle.fontWeight;
      distBox.style.textAlign = distStyle.textAlign;
      distBox.style.textTransform = distStyle.textTransform;
      distBox.style.zIndex = (system.UI.body.style.zIndex === "0" || system.UI.body.style.zIndex === "auto") ? 1 : system.UI.body.style.zIndex || 1;
      distBox.style.width = distRect.width + "px";
      distBox.style.height = distRect.height + "px";
      distBox.style.lineHeight = distStyle.lineHeight;
      distBox.style.border = distStyle.border;
      distBox.style.borderRadius = distStyle.borderRadius;
      distBox.style.margin = "0px";
      distBox.style.transition = "none";
      distBox.innerHTML = conf.to.innerHTML;
      distBox.className = conf.to.className;

      var originBox = document.createElement("div");
      originBox.style.position = "absolute";
      originBox.style.backgroundColor = (sourceStyle.backgroundColor.indexOf("rgba") !== -1 ||
              sourceStyle.backgroundColor === "transparent") ? "rgb(255,255,255)" : sourceStyle.backgroundColor;
      originBox.style.boxShadow = 'none';
      //origin.style.borderRadius = conf.from.style.borderRadius;
      originBox.style.padding = sourceStyle.padding;
      originBox.style.color = sourceStyle.color;
      originBox.style.fontSize = sourceStyle.fontSize;
      originBox.style.fontWeight = sourceStyle.fontWeight;
      originBox.style.textAlign = sourceStyle.textAlign;
      originBox.style.textDecoration = sourceStyle.textDecoration;
      originBox.style.zIndex = (system.UI.body.style.zIndex === "0" || system.UI.body.style.zIndex === "auto") ? 2 : parseInt(system.UI.body.style.zIndex || 1) + 1;
      //alert((Anim.body.zIndex === "0" || Anim.body.zIndex === "auto") ? 2 : parseInt(Anim.body.zIndex) +1)
      originBox.style.margin = "0px";
      originBox.style.width = sourceRect.width + "px";
      originBox.style.height = sourceRect.height + "px";
      originBox.style.lineHeight = sourceStyle.lineHeight;
      originBox.style.border = sourceStyle.border;
      originBox.style.transition = "none";
      originBox.innerHTML = conf.from.innerHTML;
      originBox.className = conf.from.className;

      conf.to.style.visibility = "hidden";
      if (conf.flow) {
        conf.from.style.visibility = "hidden";
        conf.from.style.transition = "none";
      }

      system.UI.body.appendChild(distBox);
      system.UI.body.appendChild(originBox);

      tween.fromTo(originBox, time,
              {
                //boxShadow: 'none',
                left: sourceRect.left,
                top: sourceRect.top,
                //transform: "scale(1,1)",
                transformOrigin: "0 0"
              },
              {
                left: distRect.left,
                top: distRect.top,
                borderRadius: distStyle.borderRadius,
                opacity: 0,
                //boxShadow: ss.boxShadow,
                //margin:0,
                transform: "scale(" + distRect.width / sourceRect.width + "," + distRect.height / sourceRect.height + ")",
                ease: ease,
                onComplete: function () {
                  originBox.parentNode.removeChild(originBox);
                  conf.from.style.transition = "";
                }
              });


      tween.fromTo(distBox, time,
              {
                //boxShadow:'none',
                //borderRadius: ss.borderRadius,
                left: sourceRect.left,
                top: sourceRect.top,
                margin: 0,
                //opacity: .5,
                transform: "scale(" + sourceRect.width / distRect.width + "," + sourceRect.height / distRect.height + ")",
                //transform: "scale(" + sourceRect.width / distRect.width + "," + sourceRect.height / distRect.height + ")",
                transformOrigin: "0 0"
              },
              {
                //opacity: 1,
                //borderRadius: ds.borderRadius,
                left: distRect.left,
                top: distRect.top,
                transform: "scale(1,1)",
                ease: ease,
                onComplete: function () {
                  conf.to.style.visibility = "";
                  if (conf.onComplete)
                    conf.onComplete();
                  setTimeout(function () {
                    distBox.parentNode.removeChild(distBox);
                  }, 1);

                }
              });
    },
    toLoader: function (el, loaderClass) {
      var loader = system.UI.clone(system.UI.COMPONENT_STRUCTURE);

      loader.el = document.createElement("div");
      loader.cancel = function () {
        this.trigger("cancel");
        this.dispose();
      };
      loader.dispose = function () {
        tween.fromTo(el, .15, {
          opacity: 0
        },
                {
                  opacity: 1
                });
        el.style.visibility = "";
        this.disposed = true;
        loader.el.parentNode.removeChild(loader.el);
        this.trigger('dispose');
      };


      var elemStyle = window.getComputedStyle(el);
      var elemRect = el.getBoundingClientRect();
      var elemCent = system.UI.getCenterPoint(elemRect);
      loader.el.className = loaderClass;
      system.UI.body.appendChild(loader.el);

      var loaderStyle = window.getComputedStyle(loader.el);
      var loaderRect = loader.el.getBoundingClientRect();

      loader.el.style.position = "absolute";
      loader.el.style.width = elemRect.width + "px";
      loader.el.style.height = elemRect.height + "px";
      loader.el.style.top = elemRect.top + 'px';
      loader.el.style.left = elemRect.left + 'px';
      loader.el.style.zIndex = (elemStyle.zIndex === "0" || elemStyle.zIndex === "auto") ? 1 : elemStyle.zIndex;

      var animProperties = (loaderClass) ? {
        top: elemCent.top - loaderRect.width / 2,
        left: elemCent.left - loaderRect.height / 2,
        width: loaderRect.width,
        height: loaderRect.height,
        borderRadius: loaderStyle.borderRadius,
        //backgroundColor: loaderStyle.backgroundColor,
        boxShadow: loaderStyle.boxShadow,
        ease: "Power3.easeOut"
      } : {
        top: elemCent.top - 30,
        left: elemCent.left - 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        ease: "Power2.easeOut"
      };

      loader.el.style.visibility = "hidden";
      setTimeout(function () {
        loader.el.className = "";
        loader.el.style.visibility = "";
        loader.el.style.borderRadius = elemStyle.borderRadius;
        loader.el.style.backgroundColor = (elemStyle.backgroundColor.indexOf("rgba") !== -1 ||
                elemStyle.backgroundColor === "transparent" || elemStyle.backgroundColor === "rgb(255, 255, 255)") ? elemStyle.color : elemStyle.backgroundColor;
        el.style.visibility = "hidden";
        tween.to(loader.el, 5,
                {
                  top: elemCent.top - 14,
                  left: elemCent.left - 14,
                  width: 28,
                  height: 28,
                  borderRadius: 28,
                  ease: "Power4.easeOut",
                  onComplete: function () {
                    loader.el.className = loaderClass;
                  }
                });

        animProperties.delay = 5;
        tween.to(loader.el, .3, animProperties);
        loader.el.addEventListener("click", function () {
          loader.cancel();
        });
      }, 0);
      return loader;
    }
  };
}(System, TweenLite));