//  polyfill the CustomEvent() constructor functionality in Internet Explorer 9 and higher 
(function () {

  if (typeof window.CustomEvent === "function")
    return false;

  function CustomEvent(event, params) {
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

(function (xtag, System, UIUtilty) {
  var SystemList = {
  };

  SystemList.lifecycle = {
    created: function () {
      this.template = this.innerHTML;
      this.innerHTML = "";
      this.links = {};
      this.data = [];
      this.value = -1;
    },
    inserted: function () {
    },
    attributeChanged: function (attrName, oldValue, newValue) {
    }
  };

  SystemList.methods = {
    render: function (data, action) {
      //var data = this.data;
      this.innerHTML = "";
      var a = null;
      for (var i = 0, len = data.length; i < len; i++) {
        data[i]._itemIndex = i;
        var item = xtag.createFragment(UIUtilty.populate(this.template, data[i]));
        if (action) {
          a = xtag.query(item, action)[0];

          if (data[i].id)
            this.links[data[i].id] = a;

          this.links[i] = a;
          a.dataset.index = i;
        }

        this.appendChild(item);
      }
    },
    selectItem: function (i, element) {
      //if (this.onItemSelected) {
      var event = new CustomEvent('item-selected', {
        detail: {
          index: i,
          data: this.xtag.data[i],
          element: element
        }
      });

      this.dispatchEvent(event);
    }
  };

  SystemList.accessors = {
    data: {
      /*attribute: {
       validate: function (value) {
       
       
       return  '[ object data ]';
       }
       },*/
      set: function (value) {
        this.xtag.value = null;
        if ("object" !== typeof value) {
          this.xtag.data = [];
          value = [];
        }

        this.xtag.data = value;

        if (this.onSetData) {
          this.onSetData(value);
        }

        this.render(value, this.xtag.action);
      },
      get: function () {
        return this.xtag.data;
      }
    },
    onSetData: {
      attribute: {
        validate: function (value) {
          this.xtag.onSetData = value;
          return '[ function ]';
        }
      },
      set: function (value) {
      },
      get: function (value) {
        return this.xtag.onSetData;
      }
    },
    value: {
      attribute: {},
      set: function (value) {
        value = parseInt(value);

        if (value > -1 /*&& value !== this.value*/ && this.xtag.data.length) {
          this.selectItem(value, this.links[value]);
        }

        this.xtag.value = value;
      },
      get: function () {
        return this.xtag.value;
      }
    },
    action: {
      attribute: {},
      set: function (value) {
        this.xtag.action = value;
      },
      get: function () {
        return this.xtag.action;
      }
    }
  };

  SystemList.events = {
    "click:delegate(a)": function (e) {
      e.preventDefault();
    },
    "tap:delegate(a)": function (e) {
      e.preventDefault();
      e.currentTarget.value = e.target.dataset.index;

    }
  };

  xtag.register("system-list", SystemList);

  // EW Actions Container

  var ewFloatMenu = {
    lifecycle: {
      created: function () {
        var _this = this;
        this.xtag.indicator = document.createElement("div");
        this.xtag.indicator.className = "ew-float-menu-indicator";
        this.xtag.indicator.style.position = "absolute";

        this.xtag.indicator.addEventListener("click", function () {
          if (_this.expanded) {
            _this.contract();

          } else {
            _this.expand();
          }
        });

        this.style.position = "absolute";
        this.xtag.originClassName = this.className;

        this.render();
      },
      inserted: function () {
        this.className = this.xtag.originClassName;
        this.xtag.indicator.className = "ew-float-menu-indicator";
        this.parentNode.appendChild(this.xtag.indicator);
      },
      attributeChanged: function (attrName, oldValue, newValue) {
      },
      removed: function () {
        this.off(true);
      }
    },
    accessors: {
      position: {
        attribute: {}
      },
      parent: {
        attribute: {}
      },
      onAttached: {
        attribute: {},
        set: function (value) {
          this.xtag.onAttached = value;
        },
        get: function (value) {
          return this.xtag.onAttached;
        }
      }
    },
    methods: {
      render: function () {
        switch (this.position || "css") {
          case "css":
            this.xtag.indicator.style.right = this.style.right = "";
            this.xtag.indicator.style.top = this.style.bottom = "";
            this.xtag.indicator.style.position = "";
            this.style.position = "";
            break;
            /*case "ne":
             this.xtag.indicator.style.right = this.style.right = "5%";
             this.xtag.indicator.style.top = this.style.bottom = "5%";*/
            break;
          case "se":
          default:
            //this.xtag.indicator.style.right = this.style.right = "5%";
            //this.xtag.indicator.style.bottom = this.style.bottom = "5%";
            this.xtag.indicator.setAttribute("position", "se");
            break;
        }
      },
      expand: function () {
        if (this.expanded)
          return;
        this.expanded = true;
        var originDim = this.getBoundingClientRect();
        //this.className += " expand";
        //this.style.width = "auto";
        //this.style.height = "auto";

        var distDim = this.getBoundingClientRect();
        //this.className = this.xtag.originClassNaame;
        /*TweenLite.fromTo(this, 1, {
         width: originDim.width,
         height: originDim.height
         }, {
         width: distDim.width,
         height: distDim.height
         });*/

        TweenLite.to(this, .3, {
          className: this.xtag.originClassName + " expand",
          ease: "Power2.easeInOut"
        });

        TweenLite.to(this.xtag.indicator, .3, {
          className: "+=active",
          ease: "Power2.easeInOut"
        });
      },
      contract: function () {
        /*if (!this.expanded)
         return;*/
        this.expanded = false;
        TweenLite.to(this, .4, {
          className: this.xtag.originClassName,
          ease: "Power2.easeInOut"
        });

        TweenLite.to(this.xtag.indicator, .4, {
          className: this.xtag.originClassName + "-indicator",
          ease: "Power2.easeInOut"
        });
      },
      on: function (flag) {
        if (this.xtag.indicator.parentNode) {
          //this.xtag.indicator.className = this.xtag.originClassName + "-indicator";
          TweenLite.to(this.xtag.indicator, .4, {
            className: "-=destroy",
            onComplete: function () {
            }
          });

          TweenLite.to(this.xtag.indicator, .4, {
            className: "-=destroy",
            ease: "Power2.easeInOut"
          });
        }
      },
      off: function (flag) {
        var _this = this;
        if (_this.xtag.indicator.parentNode) {
          this.xtag.indicator.className = "ew-float-menu-indicator";
          this.expanded = false;
          TweenLite.to(this.xtag.indicator, .3, {
            className: "+=destroy",
            onComplete: function () {
              if (flag)
                _this.xtag.indicator.parentNode.removeChild(_this.xtag.indicator);
            }
          });

          TweenLite.to(_this, .4, {
            className: "-=expand",
            ease: "Power2.easeInOut"
          });
        }
      },
      clean: function () {
        this.innerHTML = "";
        //this.appendChild(this.xtag.indicator);
      }
    },
    events: {
      "mouseleave": function () {
        //this.contract();
      }
    }
  };

  xtag.register("system-float-menu", ewFloatMenu);

  var SystemUITemplate = {
    lifecycle: {
      created: function () {
        this.xtag.validate = false;
        this.xtag.show = true;

        if (!this.name) {
          throw "system-ui-view missing the `name` attribute";
        }

        this.xtag.placeholder = document.createComment(' ' + this.module + '/' + this.name + ' ');

        if (!System.UI.templates["system/" + this.module]) {
          System.UI.templates["system/" + this.module] = {};
        }

        System.UI.templates["system/" + this.module][this.name] = this;

      },
      inserted: function () {
        if (this.xtag.validate) {
          return;
        }


        this.xtag.originalParent = this.parentNode;
        System.UI.templates["system/" + this.module][this.name] = this;
        if (this.xtag.showWhenAdded) {
          this.xtag.showWhenAdded = null;
          this.show();
          return;
        }
        this.hide();

      },
      removed: function () {
        this.xtag.validate = false;
      }
    },
    methods: {
      show: function () {
        this.xtag.validate = true;
        if (!this.xtag.originalParent) {
          this.xtag.showAsSoonAsAdded = true;
          return;
        }
        this.xtag.originalParent.replaceChild(this, this.xtag.placeholder);
      },
      hide: function () {
        this.xtag.originalParent.replaceChild(this.xtag.placeholder, this);
      }
    },
    accessors: {
      name: {
        attribute: {}
      },
      module: {
        attribute: {}
      },
      validate: {
        attribute: {},
        set: function (value) {
          this.xtag.validate = value;
        },
        get: function (value) {
          return this.xtag.validate;
        }
      }
    }
  };

  xtag.register("system-ui-view", SystemUITemplate);

  var sortableList = {
    lifecycle: {
      created: function () {
        this.xtag.placeHolder = document.createElement("li");
        this.xtag.placeHolder.className += "placeholder";

        this.xtag.glass = document.createElement("div");
        this.xtag.glass.style.position = "absolute";
        this.xtag.glass.style.width = "100%";
        this.xtag.glass.style.height = "100%";

        this.style.overflow = "hidden";
        this.isValidParent = function () {
          return true;
        };
        this.onDrop = function () {
        };
      },
      inserted: function () {

      },
      removed: function () {

      }
    },
    events: {
      mousedown: function (event) {
        //console.log("down");
      },
      "mousedown:delegate(.handle)": function (e) {
        var dim = this.getBoundingClientRect();
        e.currentTarget.xtag.initDragPosition = {
          x: e.pageX - dim.left,
          y: e.pageY - dim.top
        };

        var draggedItem = this;
        while (draggedItem.tagName.toLowerCase() !== "li") {
          draggedItem = draggedItem.parentNode;
        }

        var diDimension = draggedItem.getBoundingClientRect();
        e.currentTarget.xtag.draggedItem = draggedItem;
        draggedItem.style.position = "fixed";
        draggedItem.style.width = diDimension.width + "px";
        draggedItem.style.height = diDimension.height + "px";
        e.currentTarget.xtag.glass.width = diDimension.width + "px";
        e.currentTarget.xtag.glass.height = diDimension.height + "px";
        draggedItem.appendChild(e.currentTarget.xtag.glass);
        UIUtilty.addClass(draggedItem, "dragged");

        //console.log(e, draggedItem);
        e.stopPropagation();
        e.preventDefault();
      },
      "mouseup:delegate(.handle)": function (e) {
        e.stopPropagation();
        e.preventDefault();
      },
      mousemove: function (event) {
        if (!this.xtag.draggedItem)
          return;

        var groups = this.querySelectorAll("ul");
        var groupDim = [
        ];
        for (var i = 0, len = groups.length; i < len; i++) {
          groupDim.push(groups[i].getBoundingClientRect());
        }

        var parent = null;
        var index = 0;
        var indexElement = null;

        for (var i = groupDim.length - 1; i >= 0; i--) {
          var parentDim = groupDim[i];
          if (event.pageX > parentDim.left && event.pageX < parentDim.right && event.pageY > parentDim.top && event.pageY < parentDim.bottom) {
            parent = groups[i];
            //indexElement = parent.lastChild;
            var children = parent.childNodes || [
            ];
            var childElements = [
            ];
            //index = childElements.length;
            for (var n = 0; n < children.length; n++) {
              if (children[n].tagName.toLowerCase() !== "li" || children[n] === this.xtag.draggedItem /*|| children[n].className === "placeholder"*/)
                continue;
              childElements.push(children[n]);
            }
            //console.log(childElements)
            var extra = {
              height: 0,
              left: 0
            };
            for (n = childElements.length - 1; n >= 0; n--) {
              if (childElements[n].className === "placeholder") {
                //extra = childElements[n].getBoundingClientRect();
                //console.log(extra.height)
                continue;
              }

              var childDim = childElements[n].getBoundingClientRect();

              if (event.pageY > childDim.top && event.pageY < childDim.top + (childDim.height / 2) /*&& event.pageY + extra.height < childDim.bottom - (childDim.height / 2)*/) {
                index = n;
                indexElement = childElements[index] /*|| parent.firstChild*/;
                //console.log("above", index);
                //console.log(childDim, event.pageY, n)
                break;
              } else if (event.pageY >= childDim.top + (childDim.height / 2) /*&& event.pageY < childDim.bottom*/) {
                index = n + 1;
                indexElement = childElements[index];
                //console.log("lower", index);
                //console.log(childDim, event.pageY, n)
                break;
              } else {
                indexElement = this.xtag.tempIndexElement;
                //console.log(extra, event.pageY)
              }
              //console.log(extra)
              //extra.height = 0;
              //extra.top = 0;
            }
            break;
          }
        }

        this.xtag.draggedItem.style.left = event.pageX - this.xtag.initDragPosition.x + "px";
        this.xtag.draggedItem.style.top = event.pageY - this.xtag.initDragPosition.y + "px";

        if (parent && (this.xtag.tempParent !== parent || this.xtag.tempIndexElement !== indexElement)) {
          this.xtag.tempParent = parent;
          this.xtag.tempIndex = index;
          this.xtag.tempIndexElement = indexElement;
          if (this.isValidParent(this.xtag.draggedItem, parent, this.xtag.tempIndex)) {
            //console.log(indexElement)
            if (indexElement && indexElement.parentNode === parent)
              parent.insertBefore(this.xtag.placeHolder, indexElement);
            else if (!indexElement)
              parent.insertBefore(this.xtag.placeHolder, indexElement);
          }
        }
      },
      mouseup: function (event) {
        //console.log("up");
        if (this.xtag.draggedItem) {
          this.xtag.draggedItem.style.position = "";
          this.xtag.draggedItem.style.width = "";
          this.xtag.draggedItem.style.height = "";
          this.xtag.draggedItem.style.left = "";
          this.xtag.draggedItem.style.top = "";
          this.xtag.draggedItem.removeChild(this.xtag.glass);
          UIUtilty.removeClass(this.xtag.draggedItem, "dragged");

          if (this.xtag.placeHolder.parentNode) {
            this.onDrop(this.xtag.draggedItem, this.xtag.tempParent, this.xtag.tempIndex);
            this.xtag.placeHolder.parentNode.replaceChild(this.xtag.draggedItem, this.xtag.placeHolder);
          }

          this.xtag.draggedItem = null;
          this.xtag.tempParent = null;
          this.xtag.tempIndex = null;
        }
        event.preventDefault();
        event.stopPropagation();
      }

    }
  };

  xtag.register("system-sortable-list", sortableList);


  var inputNumber = {
    lifecycle: {
      created: function () {
        this.xtag.input = document.createElement("input");
        this.xtag.input.value = this.getAttribute("value");
        this.tabIndex = 1;
      },
      inserted: function () {
        this.appendChild(this.xtag.input);
      },
      removed: function () {

      }
    },
    accessors: {
      value: {
        attribute: {},
        set: function (value) {
          this.xtag.value = value;
        },
        get: function () {
          return this.xtag.value;
        }
      }
    },
    methods: {
      increase: function () {

      }
    },
    events: {
      "focus:delegate(input)": function (event) {
        event.currentTarget.focus();
      }
    }
  };

  xtag.register("system-input-number", inputNumber);


  var SwitchButton = {
    lifecycle: {
      created: function () {
      },
      inserted: function () {

      },
      removed: function () {

      }
    },
    accessors: {
      name: {
        attribute: {}
      },
      module: {
        attribute: {}
      },
      active: {
        attribute: {},
        set: function (value) {
          this.xtag.active = Boolean(value);
          var event = new CustomEvent('switched', {
            detail: {
              active: this.xtag.active
            }
          });

          this.dispatchEvent(event);
        },
        get: function (value) {
          return this.xtag.active || false;
        }
      }
    },
    events: {
      click: function (event) {
        event.currentTarget.setAttribute('active', !event.currentTarget.xtag.active);
      }
    }
  };

  xtag.register("system-button-switch", SwitchButton);

})(xtag, System, UIUtility);