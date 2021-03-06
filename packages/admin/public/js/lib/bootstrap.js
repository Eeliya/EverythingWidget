/*!
 * Bootstrap v3.0.2
 *
 * Copyright 2013 Twitter, Inc
 * Licensed under the Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Designed and built with all the love in the world @twitter by @mdo and @fat.
 */

+function (a) {
   "use strict";
   var b = '[data-dismiss="alert"]', c = function (c) {
      a(c).on("click", b, this.close)
   };
   c.prototype.close = function (b) {
      function f() {
         e.trigger("closed.bs.alert").remove()
      }
      var c = a(this), d = c.attr("data-target");
      d || (d = c.attr("href"), d = d && d.replace(/.*(?=#[^\s]*$)/, ""));
      var e = a(d);
      b && b.preventDefault(), e.length || (e = c.hasClass("alert") ? c : c.parent()), e.trigger(b = a.Event("close.bs.alert"));
      if (b.isDefaultPrevented())
         return;
      e.removeClass("in"), a.support.transition && e.hasClass("fade") ? e.one(a.support.transition.end, f).emulateTransitionEnd(150) : f()
   };
   var d = a.fn.alert;
   a.fn.alert = function (b) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.alert");
         e || d.data("bs.alert", e = new c(this)), typeof b == "string" && e[b].call(d)
      })
   }, a.fn.alert.Constructor = c, a.fn.alert.noConflict = function () {
      return a.fn.alert = d, this
   }, a(document).on("click.bs.alert.data-api", b, c.prototype.close)
}(jQuery), +function (a) {
   "use strict";
   var b = function (c, d) {
      this.$element = a(c), this.options = a.extend({
      }, b.DEFAULTS, d)
   };
   b.DEFAULTS = {
      loadingText: "loading..."
   },
   b.prototype.setState = function (a) {
      var b = "disabled", c = this.$element, d = c.is("input") ? "val" : "html", e = c.data();
      a += "Text", e.resetText || c.data("resetText", c[d]()), c[d](e[a] || this.options[a]), setTimeout(function () {
         a == "loadingText" ? c.addClass(b).attr(b, b) : c.removeClass(b).removeAttr(b)
      }, 0)
   }, b.prototype.toggle = function () {
      var a = this.$element.closest('[data-toggle="buttons"]');
      if (a.length) {
         var b = this.$element.find("input").prop("checked", !this.$element.hasClass("active")).trigger("change");
         b.prop("type") === "radio" && a.find(".active").removeClass("active")
      }
      this.$element.toggleClass("active")
   };
   var c = a.fn.button;
   a.fn.button = function (c) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.button"), f = typeof c == "object" && c;
         e || d.data("bs.button", e = new b(this, f)), c == "toggle" ? e.toggle() : c && e.setState(c)
      })
   }, a.fn.button.Constructor = b, a.fn.button.noConflict = function () {
      return a.fn.button = c, this
   }, a(document).on("click.bs.button.data-api", "[data-toggle^=button]", function (b) {
      var c = a(b.target);
      c.hasClass("btn") || (c = c.closest(".btn")), c.button("toggle"), b.preventDefault()
   })
}(jQuery), +function (a) {
   "use strict";
   var b = function (b, c) {
      this.$element = a(b), this.$indicators = this.$element.find(".carousel-indicators"), this.options = c, this.paused = this.sliding = this.interval = this.$active = this.$items = null, this.options.pause == "hover" && this.$element.on("mouseenter", a.proxy(this.pause, this)).on("mouseleave", a.proxy(this.cycle, this))
   };
   b.DEFAULTS = {
      interval: 5e3,
      pause: "hover",
      wrap: !0
   },
   b.prototype.cycle = function (b) {
      return b || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval(a.proxy(this.next, this), this.options.interval)), this
   }, b.prototype.getActiveIndex = function () {
      return this.$active = this.$element.find(".item.active"), this.$items = this.$active.parent().children(), this.$items.index(this.$active)
   }, b.prototype.to = function (b) {
      var c = this, d = this.getActiveIndex();
      if (b > this.$items.length - 1 || b < 0)
         return;
      return this.sliding ? this.$element.one("slid", function () {
         c.to(b)
      }) : d == b ? this.pause().cycle() : this.slide(b > d ? "next" : "prev", a(this.$items[b]))
   }, b.prototype.pause = function (b) {
      return b || (this.paused = !0), this.$element.find(".next, .prev").length && a.support.transition.end && (this.$element.trigger(a.support.transition.end), this.cycle(!0)), this.interval = clearInterval(this.interval), this
   }, b.prototype.next = function () {
      if (this.sliding)
         return;
      return this.slide("next")
   }, b.prototype.prev = function () {
      if (this.sliding)
         return;
      return this.slide("prev")
   }, b.prototype.slide = function (b, c) {
      var d = this.$element.find(".item.active"), e = c || d[b](), f = this.interval, g = b == "next" ? "left" : "right", h = b == "next" ? "first" : "last", i = this;
      if (!e.length) {
         if (!this.options.wrap)
            return;
         e = this.$element.find(".item")[h]()
      }
      this.sliding = !0, f && this.pause();
      var j = a.Event("slide.bs.carousel", {
         relatedTarget: e[0],
         direction: g
      });
      if (e.hasClass("active"))
         return;
      this.$indicators.length && (this.$indicators.find(".active").removeClass("active"), this.$element.one("slid", function () {
         var b = a(i.$indicators.children()[i.getActiveIndex()]);
         b && b.addClass("active")
      }));
      if (a.support.transition && this.$element.hasClass("slide")) {
         this.$element.trigger(j);
         if (j.isDefaultPrevented())
            return;
         e.addClass(b), e[0].offsetWidth, d.addClass(g), e.addClass(g), d.one(a.support.transition.end, function () {
            e.removeClass([b, g].join(" ")).addClass("active"), d.removeClass(["active", g].join(" ")), i.sliding = !1, setTimeout(function () {
               i.$element.trigger("slid")
            }, 0)
         }).emulateTransitionEnd(600)
      } else {
         this.$element.trigger(j);
         if (j.isDefaultPrevented())
            return;
         d.removeClass("active"), e.addClass("active"), this.sliding = !1, this.$element.trigger("slid")
      }
      return f && this.cycle(), this
   };
   var c = a.fn.carousel;
   a.fn.carousel = function (c) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.carousel"), f = a.extend({
         }, b.DEFAULTS, d.data(), typeof c == "object" && c), g = typeof c == "string" ? c : f.slide;
         e || d.data("bs.carousel", e = new b(this, f)), typeof c == "number" ? e.to(c) : g ? e[g]() : f.interval && e.pause().cycle()
      })
   }, a.fn.carousel.Constructor = b, a.fn.carousel.noConflict = function () {
      return a.fn.carousel = c, this
   }, a(document).on("click.bs.carousel.data-api", "[data-slide], [data-slide-to]", function (b) {
      var c = a(this), d, e = a(c.attr("data-target") || (d = c.attr("href")) && d.replace(/.*(?=#[^\s]+$)/, "")), f = a.extend({
      }, e.data(), c.data()), g = c.attr("data-slide-to");
      g && (f.interval = !1), e.carousel(f), (g = c.attr("data-slide-to")) && e.data("bs.carousel").to(g), b.preventDefault()
   }), a(window).on("load", function () {
      a('[data-ride="carousel"]').each(function () {
         var b = a(this);
         b.carousel(b.data())
      })
   })
}(jQuery), +function (a) {
   function e() {
      a(b).remove(), a(c).each(function (b) {
         var c = f(a(this));
         if (!c.hasClass("open"))
            return;
         c.trigger(b = a.Event("hide.bs.dropdown"));
         if (b.isDefaultPrevented())
            return;
         c.removeClass("open").trigger("hidden.bs.dropdown")
      })
   }
   function f(b) {
      var c = b.attr("data-target");
      c || (c = b.attr("href"), c = c && /#/.test(c) && c.replace(/.*(?=#[^\s]*$)/, ""));
      var d = c && a(c);
      return d && d.length ? d : b.parent()
   }
   "use strict";
   var b = ".dropdown-backdrop", c = "[data-toggle=dropdown]", d = function (b) {
      var c = a(b).on("click.bs.dropdown", this.toggle)
   };
   d.prototype.toggle = function (b) {
      var c = a(this);
      if (c.is(".disabled, :disabled"))
         return;
      var d = f(c), g = d.hasClass("open");
      e();
      if (!g) {
         "ontouchstart"in document.documentElement && !d.closest(".navbar-nav").length && a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click", e), d.trigger(b = a.Event("show.bs.dropdown"));
         if (b.isDefaultPrevented())
            return;
         d.toggleClass("open").trigger("shown.bs.dropdown"), c.focus()
      }
      return!1
   }, d.prototype.keydown = function (b) {
      if (!/(38|40|27)/.test(b.keyCode))
         return;
      var d = a(this);
      b.preventDefault(), b.stopPropagation();
      if (d.is(".disabled, :disabled"))
         return;
      var e = f(d), g = e.hasClass("open");
      if (!g || g && b.keyCode == 27)
         return b.which == 27 && e.find(c).focus(), d.click();
      var h = a("[role=menu] li:not(.divider):visible a", e);
      if (!h.length)
         return;
      var i = h.index(h.filter(":focus"));
      b.keyCode == 38 && i > 0 && i--, b.keyCode == 40 && i < h.length - 1 && i++, ~i || (i = 0), h.eq(i).focus()
   };
   var g = a.fn.dropdown;
   a.fn.dropdown = function (b) {
      return this.each(function () {
         var c = a(this), e = c.data("dropdown");
         e || c.data("dropdown", e = new d(this)), typeof b == "string" && e[b].call(c)
      })
   }, a.fn.dropdown.Constructor = d, a.fn.dropdown.noConflict = function () {
      return a.fn.dropdown = g, this
   }, a(document).on("click.bs.dropdown.data-api", e).on("click.bs.dropdown.data-api", ".dropdown form", function (a) {
      a.stopPropagation()
   }).on("click.bs.dropdown.data-api", c, d.prototype.toggle).on("keydown.bs.dropdown.data-api", c + ", [role=menu]", d.prototype.keydown)
}(jQuery), +function (a) {
   "use strict";
   var b = function (b, c) {
      this.options = c, this.$element = a(b), this.$backdrop = this.isShown = null, this.options.remote && this.$element.load(this.options.remote)
   };
   b.DEFAULTS = {
      backdrop: !0,
      keyboard: !0,
      show: !0
   },
   b.prototype.toggle = function (a) {
      return this[this.isShown ? "hide" : "show"](a)
   }, b.prototype.show = function (b) {
      var c = this, d = a.Event("show.bs.modal", {
         relatedTarget: b
      });
      this.$element.trigger(d);
      if (this.isShown || d.isDefaultPrevented())
         return;
      this.isShown = !0, this.escape(), this.$element.on("click.dismiss.modal", '[data-dismiss="modal"]', a.proxy(this.hide, this)), this.backdrop(function () {
         var d = a.support.transition && c.$element.hasClass("fade");
         c.$element.parent().length || c.$element.appendTo(document.body), c.$element.show(), d && c.$element[0].offsetWidth, c.$element.addClass("in").attr("aria-hidden", !1), c.enforceFocus();
         var e = a.Event("shown.bs.modal", {
            relatedTarget: b
         });
         d ? c.$element.find(".modal-dialog").one(a.support.transition.end, function () {
            c.$element.focus().trigger(e)
         }).emulateTransitionEnd(300) : c.$element.focus().trigger(e)
      })
   }, b.prototype.hide = function (b) {
      b && b.preventDefault(), b = a.Event("hide.bs.modal"), this.$element.trigger(b);
      if (!this.isShown || b.isDefaultPrevented())
         return;
      this.isShown = !1, this.escape(), a(document).off("focusin.bs.modal"), this.$element.removeClass("in").attr("aria-hidden", !0).off("click.dismiss.modal"), a.support.transition && this.$element.hasClass("fade") ? this.$element.one(a.support.transition.end, a.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal()
   }, b.prototype.enforceFocus = function () {
      a(document).off("focusin.bs.modal").on("focusin.bs.modal", a.proxy(function (a) {
         this.$element[0] !== a.target && !this.$element.has(a.target).length && this.$element.focus()
      }, this))
   }, b.prototype.escape = function () {
      this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.bs.modal", a.proxy(function (a) {
         a.which == 27 && this.hide()
      }, this)) : this.isShown || this.$element.off("keyup.dismiss.bs.modal")
   }, b.prototype.hideModal = function () {
      var a = this;
      this.$element.hide(), this.backdrop(function () {
         a.removeBackdrop(), a.$element.trigger("hidden.bs.modal")
      })
   }, b.prototype.removeBackdrop = function () {
      this.$backdrop && this.$backdrop.remove(), this.$backdrop = null
   }, b.prototype.backdrop = function (b) {
      var c = this, d = this.$element.hasClass("fade") ? "fade" : "";
      if (this.isShown && this.options.backdrop) {
         var e = a.support.transition && d;
         this.$backdrop = a('<div class="modal-backdrop ' + d + '" />').appendTo(document.body), this.$element.on("click.dismiss.modal", a.proxy(function (a) {
            if (a.target !== a.currentTarget)
               return;
            this.options.backdrop == "static" ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this)
         }, this)), e && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in");
         if (!b)
            return;
         e ? this.$backdrop.one(a.support.transition.end, b).emulateTransitionEnd(150) : b()
      } else
         !this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), a.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one(a.support.transition.end, b).emulateTransitionEnd(150) : b()) : b && b()
   };
   var c = a.fn.modal;
   a.fn.modal = function (c, d) {
      return this.each(function () {
         var e = a(this), f = e.data("bs.modal"), g = a.extend({
         }, b.DEFAULTS, e.data(), typeof c == "object" && c);
         f || e.data("bs.modal", f = new b(this, g)), typeof c == "string" ? f[c](d) : g.show && f.show(d)
      })
   }, a.fn.modal.Constructor = b, a.fn.modal.noConflict = function () {
      return a.fn.modal = c, this
   }, a(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function (b) {
      var c = a(this), d = c.attr("href"), e = a(c.attr("data-target") || d && d.replace(/.*(?=#[^\s]+$)/, "")), f = e.data("modal") ? "toggle" : a.extend({
         remote: !/#/.test(d) && d
      },
      e.data(), c.data());
      b.preventDefault(), e.modal(f, this).one("hide", function () {
         c.is(":visible") && c.focus()
      })
   }), a(document).on("show.bs.modal", ".modal", function () {
      a(document.body).addClass("modal-open")
   }).on("hidden.bs.modal", ".modal", function () {
      a(document.body).removeClass("modal-open")
   })
}(jQuery), +function (a) {
   "use strict";
   var b = function (a, b) {
      this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null, this.init("tooltip", a, b)
   };
   b.DEFAULTS = {
      animation: !0,
      placement: "top",
      selector: !1,
      template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
      trigger: "hover focus",
      title: "",
      // Changed by Eeliya
      //delay: 0,
      delay: {"show": 500, hide: 0},
      html: !1,
      //container: !1
      //// Changed by Eeliya
      container: "body"
   },
   b.prototype.init = function (b, c, d) {
      this.enabled = !0, this.type = b, this.$element = a(c), this.options = this.getOptions(d);
      var e = this.options.trigger.split(" ");
      for (var f = e.length;
              f--; ) {
         var g = e[f];
         if (g == "click")
            this.$element.on("click." + this.type, this.options.selector, a.proxy(this.toggle, this));
         else if (g != "manual") {
            var h = g == "hover" ? "mouseenter" : "focus", i = g == "hover" ? "mouseleave" : "blur";
            this.$element.on(h + "." + this.type, this.options.selector, a.proxy(this.enter, this)), this.$element.on(i + "." + this.type, this.options.selector, a.proxy(this.leave, this))
         }
      }
      this.options.selector ? this._options = a.extend({
      }, this.options, {
         trigger: "manual",
         selector: ""
      }) : this.fixTitle()
   }, b.prototype.getDefaults = function () {
      return b.DEFAULTS
   }, b.prototype.getOptions = function (b) {
      return b = a.extend({
      }, this.getDefaults(), this.$element.data(), b), b.delay && typeof b.delay == "number" && (b.delay = {
         show: b.delay,
         hide: b.delay
      }),
              b
   }, b.prototype.getDelegateOptions = function () {
      var b = {
      }, c = this.getDefaults();
      return this._options && a.each(this._options, function (a, d) {
         c[a] != d && (b[a] = d)
      }), b
   }, b.prototype.enter = function (b) {
      var c = b instanceof this.constructor ? b : a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
      clearTimeout(c.timeout), c.hoverState = "in";
      if (!c.options.delay || !c.options.delay.show)
         return c.show();
      c.timeout = setTimeout(function () {
         c.hoverState == "in" && c.show()
      }, c.options.delay.show)
   }, b.prototype.leave = function (b) {
      var c = b instanceof this.constructor ? b : a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
      clearTimeout(c.timeout), c.hoverState = "out";
      if (!c.options.delay || !c.options.delay.hide)
         return c.hide();
      c.timeout = setTimeout(function () {
         c.hoverState == "out" && c.hide()
      }, c.options.delay.hide)
   }, b.prototype.show = function () {
      var b = a.Event("show.bs." + this.type);
      if (this.hasContent() && this.enabled) {
         this.$element.trigger(b);
         if (b.isDefaultPrevented())
            return;
         var c = this.tip();
         this.setContent(), this.options.animation && c.addClass("fade");
         var d = typeof this.options.placement == "function" ? this.options.placement.call(this, c[0], this.$element[0]) : this.options.placement, e = /\s?auto?\s?/i, f = e.test(d);
         f && (d = d.replace(e, "") || "top"), c.detach().css({
            top: 0,
            left: 0,
            display: "block"
         }).addClass(d), this.options.container ? c.appendTo(this.options.container) : c.insertAfter(this.$element);
         var g = this.getPosition(), h = c[0].offsetWidth, i = c[0].offsetHeight;
         if (f) {
            var j = this.$element.parent(), k = d, l = document.documentElement.scrollTop || document.body.scrollTop, m = this.options.container == "body" ? window.innerWidth : j.outerWidth(), n = this.options.container == "body" ? window.innerHeight : j.outerHeight(), o = this.options.container == "body" ? 0 : j.offset().left;
            d = d == "bottom" && g.top + g.height + i - l > n ? "top" : d == "top" && g.top - l - i < 0 ? "bottom" : d == "right" && g.right + h > m ? "left" : d == "left" && g.left - h < o ? "right" : d, c.removeClass(k).addClass(d)
         }
         var p = this.getCalculatedOffset(d, g, h, i);
         this.applyPlacement(p, d), this.$element.trigger("shown.bs." + this.type)
      }
   }, b.prototype.applyPlacement = function (a, b) {
      var c, d = this.tip(), e = d[0].offsetWidth, f = d[0].offsetHeight, g = parseInt(d.css("margin-top"), 10), h = parseInt(d.css("margin-left"), 10);
      isNaN(g) && (g = 0), isNaN(h) && (h = 0), a.top = a.top + g, a.left = a.left + h, d.offset(a).addClass("in");
      var i = d[0].offsetWidth, j = d[0].offsetHeight;
      b == "top" && j != f && (c = !0, a.top = a.top + f - j);
      if (/bottom|top/.test(b)) {
         var k = 0;
         a.left < 0 && (k = a.left * -2, a.left = 0, d.offset(a), i = d[0].offsetWidth, j = d[0].offsetHeight), this.replaceArrow(k - e + i, i, "left")
      } else
         this.replaceArrow(j - f, j, "top");
      c && d.offset(a)
   }, b.prototype.replaceArrow = function (a, b, c) {
      this.arrow().css(c, a ? 50 * (1 - a / b) + "%" : "")
   }, b.prototype.setContent = function () {
      var a = this.tip(), b = this.getTitle();
      a.find(".tooltip-inner")[this.options.html ? "html" : "text"](b), a.removeClass("fade in top bottom left right")
   }, b.prototype.hide = function () {
      function e() {
         b.hoverState != "in" && c.detach()
      }
      var b = this, c = this.tip(), d = a.Event("hide.bs." + this.type);
      this.$element.trigger(d);
      if (d.isDefaultPrevented())
         return;
      return c.removeClass("in"), a.support.transition && this.$tip.hasClass("fade") ? c.one(a.support.transition.end, e).emulateTransitionEnd(150) : e(), this.$element.trigger("hidden.bs." + this.type), this
   }, b.prototype.fixTitle = function () {
      var a = this.$element;
      (a.attr("title") || typeof a.attr("data-original-title") != "string") && a.attr("data-original-title", a.attr("title") || "").attr("title", "")
   }, b.prototype.hasContent = function () {
      return this.getTitle()
   }, b.prototype.getPosition = function () {
      var b = this.$element[0];
      return a.extend({
      }, typeof b.getBoundingClientRect == "function" ? b.getBoundingClientRect() : {
         width: b.offsetWidth,
         height: b.offsetHeight
      },
      this.$element.offset())
   }, b.prototype.getCalculatedOffset = function (a, b, c, d) {
      return a == "bottom" ? {
         top: b.top + b.height,
         left: b.left + b.width / 2 - c / 2
      } : a == "top" ? {
         top: b.top - d,
         left: b.left + b.width / 2 - c / 2
      } : a == "left" ? {
         top: b.top + b.height / 2 - d / 2,
         left: b.left - c
      } : {
         top: b.top + b.height / 2 - d / 2,
         left: b.left + b.width
      }
   }, b.prototype.getTitle = function () {
      var a, b = this.$element, c = this.options;
      // Change by Eeliya
      // b.attr("data-tooltip") 
      return a = b.attr("data-tooltip") || b.attr("data-original-title") || (typeof c.title == "function" ? c.title.call(b[0]) : c.title), a
   }, b.prototype.tip = function () {
      return this.$tip = this.$tip || a(this.options.template)
   }, b.prototype.arrow = function () {
      return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
   }, b.prototype.validate = function () {
      this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null)
   }, b.prototype.enable = function () {
      this.enabled = !0
   }, b.prototype.disable = function () {
      this.enabled = !1
   }, b.prototype.toggleEnabled = function () {
      this.enabled = !this.enabled
   }, b.prototype.toggle = function (b) {
      var c = b ? a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type) : this;
      c.tip().hasClass("in") ? c.leave(c) : c.enter(c)
   }, b.prototype.destroy = function () {
      this.hide().$element.off("." + this.type).removeData("bs." + this.type)
   };
   var c = a.fn.tooltip;
   a.fn.tooltip = function (c) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.tooltip"), f = typeof c == "object" && c;
         e || d.data("bs.tooltip", e = new b(this, f)), typeof c == "string" && e[c]()
      })
   }, a.fn.tooltip.Constructor = b, a.fn.tooltip.noConflict = function () {
      return a.fn.tooltip = c, this
   }
}(jQuery), +function (a) {
   "use strict";
   var b = function (a, b) {
      this.init("popover", a, b)
   };
   if (!a.fn.tooltip)
      throw new Error("Popover requires tooltip.js");
   b.DEFAULTS = a.extend({
   }, a.fn.tooltip.Constructor.DEFAULTS, {
      placement: "right",
      trigger: "click",
      content: "",
      template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
   }),
           b.prototype = a.extend({
           }, a.fn.tooltip.Constructor.prototype), b.prototype.constructor = b, b.prototype.getDefaults = function () {
      return b.DEFAULTS
   }, b.prototype.setContent = function () {
      var a = this.tip(), b = this.getTitle(), c = this.getContent();
      a.find(".popover-title")[this.options.html ? "html" : "text"](b), a.find(".popover-content")[this.options.html ? "html" : "text"](c), a.removeClass("fade top bottom left right in"), a.find(".popover-title").html() || a.find(".popover-title").hide()
   }, b.prototype.hasContent = function () {
      return this.getTitle() || this.getContent()
   }, b.prototype.getContent = function () {
      var a = this.$element, b = this.options;
      return a.attr("data-content") || (typeof b.content == "function" ? b.content.call(a[0]) : b.content)
   }, b.prototype.arrow = function () {
      return this.$arrow = this.$arrow || this.tip().find(".arrow")
   }, b.prototype.tip = function () {
      return this.$tip || (this.$tip = a(this.options.template)), this.$tip
   };
   var c = a.fn.popover;
   a.fn.popover = function (c) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.popover"), f = typeof c == "object" && c;
         e || d.data("bs.popover", e = new b(this, f)), typeof c == "string" && e[c]()
      })
   }, a.fn.popover.Constructor = b, a.fn.popover.noConflict = function () {
      return a.fn.popover = c, this
   }
}(jQuery), +function (a) {
   "use strict";
   var b = function (b) {
      this.element = a(b)
   };
   b.prototype.show = function () {
      var b = this.element, c = b.closest("ul:not(.dropdown-menu)"), d = b.data("target");
      d || (d = b.attr("href"), d = d && d.replace(/.*(?=#[^\s]*$)/, ""));
      if (b.parent("li").hasClass("active"))
         return;
      var e = c.find(".active:last a")[0], f = a.Event("show.bs.tab", {
         relatedTarget: e
      });
      b.trigger(f);
      if (f.isDefaultPrevented())
         return;
      var g = a(d);
      this.activate(b.parent("li"), c), this.activate(g, g.parent(), function () {
         b.trigger({
            type: "shown.bs.tab",
            relatedTarget: e
         })
      })
   }, b.prototype.activate = function (b, c, d) {
      function g() {
         e.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"), b.addClass("active"), f ? (b[0].offsetWidth, b.addClass("in")) : b.removeClass("fade"), b.parent(".dropdown-menu") && b.closest("li.dropdown").addClass("active"), d && d()
      }
      var e = c.find("> .active"), f = d && a.support.transition && e.hasClass("fade");
      f ? e.one(a.support.transition.end, g).emulateTransitionEnd(150) : g(), e.removeClass("in")
   };
   var c = a.fn.tab;
   a.fn.tab = function (c) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.tab");
         e || d.data("bs.tab", e = new b(this)), typeof c == "string" && e[c]()
      })
   }, a.fn.tab.Constructor = b, a.fn.tab.noConflict = function () {
      return a.fn.tab = c, this
   }, a(document).on("click.bs.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function (b) {
      b.preventDefault(), a(this).tab("show")
   })
}(jQuery), +function (a) {
   "use strict";
   var b = function (c, d) {
      this.options = a.extend({
      }, b.DEFAULTS, d), this.$window = a(window).on("scroll.bs.affix.data-api", a.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", a.proxy(this.checkPositionWithEventLoop, this)), this.$element = a(c), this.affixed = this.unpin = null, this.checkPosition()
   };
   b.RESET = "affix affix-top affix-bottom", b.DEFAULTS = {
      offset: 0
   },
   b.prototype.checkPositionWithEventLoop = function () {
      setTimeout(a.proxy(this.checkPosition, this), 1)
   }, b.prototype.checkPosition = function () {
      if (!this.$element.is(":visible"))
         return;
      var c = a(document).height(), d = this.$window.scrollTop(), e = this.$element.offset(), f = this.options.offset, g = f.top, h = f.bottom;
      typeof f != "object" && (h = g = f), typeof g == "function" && (g = f.top()), typeof h == "function" && (h = f.bottom());
      var i = this.unpin != null && d + this.unpin <= e.top ? !1 : h != null && e.top + this.$element.height() >= c - h ? "bottom" : g != null && d <= g ? "top" : !1;
      if (this.affixed === i)
         return;
      this.unpin && this.$element.css("top", ""), this.affixed = i, this.unpin = i == "bottom" ? e.top - d : null, this.$element.removeClass(b.RESET).addClass("affix" + (i ? "-" + i : "")), i == "bottom" && this.$element.offset({
         top: document.body.offsetHeight - h - this.$element.height()
      })
   };
   var c = a.fn.affix;
   a.fn.affix = function (c) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.affix"), f = typeof c == "object" && c;
         e || d.data("bs.affix", e = new b(this, f)), typeof c == "string" && e[c]()
      })
   }, a.fn.affix.Constructor = b, a.fn.affix.noConflict = function () {
      return a.fn.affix = c, this
   }, a(window).on("load", function () {
      a('[data-spy="affix"]').each(function () {
         var b = a(this), c = b.data();
         c.offset = c.offset || {
         }, c.offsetBottom && (c.offset.bottom = c.offsetBottom), c.offsetTop && (c.offset.top = c.offsetTop), b.affix(c)
      })
   })
}(jQuery), +function (a) {
   "use strict";
   var b = function (c, d) {
      this.$element = a(c), this.options = a.extend({
      }, b.DEFAULTS, d), this.transitioning = null, this.options.parent && (this.$parent = a(this.options.parent)), this.options.toggle && this.toggle()
   };
   b.DEFAULTS = {
      toggle: !0
   },
   b.prototype.dimension = function () {
      var a = this.$element.hasClass("width");
      return a ? "width" : "height"
   }, b.prototype.show = function () {
      if (this.transitioning || this.$element.hasClass("in"))
         return;
      var b = a.Event("show.bs.collapse");
      this.$element.trigger(b);
      if (b.isDefaultPrevented())
         return;
      var c = this.$parent && this.$parent.find("> .panel > .in");
      if (c && c.length) {
         var d = c.data("bs.collapse");
         if (d && d.transitioning)
            return;
         c.collapse("hide"), d || c.data("bs.collapse", null)
      }
      var e = this.dimension();
      this.$element.removeClass("collapse").addClass("collapsing")[e](0), this.transitioning = 1;
      var f = function () {
         this.$element.removeClass("collapsing").addClass("in")[e]("auto"), this.transitioning = 0, this.$element.trigger("shown.bs.collapse")
      };
      if (!a.support.transition)
         return f.call(this);
      var g = a.camelCase(["scroll", e].join("-"));
      this.$element.one(a.support.transition.end, a.proxy(f, this)).emulateTransitionEnd(350)[e](this.$element[0][g])
   }, b.prototype.hide = function () {
      if (this.transitioning || !this.$element.hasClass("in"))
         return;
      var b = a.Event("hide.bs.collapse");
      this.$element.trigger(b);
      if (b.isDefaultPrevented())
         return;
      var c = this.dimension();
      this.$element[c](this.$element[c]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"), this.transitioning = 1;
      var d = function () {
         this.transitioning = 0, this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")
      };
      if (!a.support.transition)
         return d.call(this);
      this.$element[c](0).one(a.support.transition.end, a.proxy(d, this)).emulateTransitionEnd(350)
   }, b.prototype.toggle = function () {
      this[this.$element.hasClass("in") ? "hide" : "show"]()
   };
   var c = a.fn.collapse;
   a.fn.collapse = function (c) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.collapse"), f = a.extend({
         }, b.DEFAULTS, d.data(), typeof c == "object" && c);
         e || d.data("bs.collapse", e = new b(this, f)), typeof c == "string" && e[c]()
      })
   }, a.fn.collapse.Constructor = b, a.fn.collapse.noConflict = function () {
      return a.fn.collapse = c, this
   }, a(document).on("click.bs.collapse.data-api", "[data-toggle=collapse]", function (b) {
      var c = a(this), d, e = c.attr("data-target") || b.preventDefault() || (d = c.attr("href")) && d.replace(/.*(?=#[^\s]+$)/, ""), f = a(e), g = f.data("bs.collapse"), h = g ? "toggle" : c.data(), i = c.attr("data-parent"), j = i && a(i);
      if (!g || !g.transitioning)
         j && j.find('[data-toggle=collapse][data-parent="' + i + '"]').not(c).addClass("collapsed"), c[f.hasClass("in") ? "addClass" : "removeClass"]("collapsed");
      f.collapse(h)
   })
}(jQuery), +function (a) {
   function b(c, d) {
      var e, f = a.proxy(this.process, this);
      this.$element = a(c).is("body") ? a(window) : a(c), this.$body = a("body"), this.$scrollElement = this.$element.on("scroll.bs.scroll-spy.data-api", f), this.options = a.extend({
      }, b.DEFAULTS, d), this.selector = (this.options.target || (e = a(c).attr("href")) && e.replace(/.*(?=#[^\s]+$)/, "") || "") + " .nav li > a", this.offsets = a([
      ]), this.targets = a([
      ]), this.activeTarget = null, this.refresh(), this.process()
   }
   "use strict", b.DEFAULTS = {
      offset: 10
   },
   b.prototype.refresh = function () {
      var b = this.$element[0] == window ? "offset" : "position";
      this.offsets = a([]), this.targets = a([]);
      var c = this, d = this.$body.find(this.selector).map(function () {
         var d = a(this), e = d.data("target") || d.attr("href"), f = /^#\w/.test(e) && a(e);
         return f && f.length && [[f[b]().top + (!a.isWindow(c.$scrollElement.get(0)) && c.$scrollElement.scrollTop()), e]] || null
      }).sort(function (a, b) {
         return a[0] - b[0]
      }).each(function () {
         c.offsets.push(this[0]), c.targets.push(this[1])
      })
   }, b.prototype.process = function () {
      var a = this.$scrollElement.scrollTop() + this.options.offset, b = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight, c = b - this.$scrollElement.height(), d = this.offsets, e = this.targets, f = this.activeTarget, g;
      if (a >= c)
         return f != (g = e.last()[0]) && this.activate(g);
      for (g = d.length;
              g--; )
         f != e[g] && a >= d[g] && (!d[g + 1] || a <= d[g + 1]) && this.activate(e[g])
   }, b.prototype.activate = function (b) {
      this.activeTarget = b, a(this.selector).parents(".active").removeClass("active");
      var c = this.selector + '[data-target="' + b + '"],' + this.selector + '[href="' + b + '"]', d = a(c).parents("li").addClass("active");
      d.parent(".dropdown-menu").length && (d = d.closest("li.dropdown").addClass("active")), d.trigger("activate")
   };
   var c = a.fn.scrollspy;
   a.fn.scrollspy = function (c) {
      return this.each(function () {
         var d = a(this), e = d.data("bs.scrollspy"), f = typeof c == "object" && c;
         e || d.data("bs.scrollspy", e = new b(this, f)), typeof c == "string" && e[c]()
      })
   }, a.fn.scrollspy.Constructor = b, a.fn.scrollspy.noConflict = function () {
      return a.fn.scrollspy = c, this
   }, a(window).on("load", function () {
      a('[data-spy="scroll"]').each(function () {
         var b = a(this);
         b.scrollspy(b.data())
      })
   })
}(jQuery), +function (a) {
   function b() {
      var a = document.createElement("bootstrap"), b = {
         WebkitTransition: "webkitTransitionEnd",
         MozTransition: "transitionend",
         OTransition: "oTransitionEnd otransitionend",
         transition: "transitionend"
      };
      for (var c in b)
         if (a.style[c] !== undefined)
            return{
               end: b[c]
            }
   }
   "use strict", a.fn.emulateTransitionEnd = function (b) {
      var c = !1, d = this;
      a(this).one(a.support.transition.end, function () {
         c = !0
      });
      var e = function () {
         c || a(d).trigger(a.support.transition.end)
      };
      return setTimeout(e, b), this
   }, a(function () {
      a.support.transition = b()
   })
}(jQuery)

// Select JS
        /*!
         * bootstrap-select v1.4.3
         * http://silviomoreto.github.io/bootstrap-select/
         *
         * Copyright 2013 bootstrap-select
         * Licensed under the MIT license
         */
        ;
!function (b) {
   b.expr[":"].icontains = function (e, c, d) {
      return b(e).text().toUpperCase().indexOf(d[3].toUpperCase()) >= 0
   };
   var a = function (d, c, f) {
      if (f) {
         f.stopPropagation();
         f.preventDefault()
      }
      this.$element = b(d);
      this.$newElement = null;
      this.$button = null;
      this.$menu = null;
      this.$lis = null;
      this.options = b.extend({
      }, b.fn.selectpicker.defaults, this.$element.data(), typeof c == "object" && c);
      if (this.options.title === null) {
         this.options.title = this.$element.attr("title")
      }
      this.val = a.prototype.val;
      this.render = a.prototype.render;
      this.refresh = a.prototype.refresh;
      this.setStyle = a.prototype.setStyle;
      this.selectAll = a.prototype.selectAll;
      this.deselectAll = a.prototype.deselectAll;
      this.init()
   };
   a.prototype = {
      constructor: a,
      init: function () {
         var c = this, d = this.$element.attr("id");
         this.$element.hide();
         this.multiple = this.$element.prop("multiple");
         this.autofocus = this.$element.prop("autofocus");
         this.$newElement = this.createView();
         this.$element.after(this.$newElement);
         this.$menu = this.$newElement.find("> .dropdown-menu");
         this.$button = this.$newElement.find("> button");
         this.$searchbox = this.$newElement.find("input");
         if (d !== undefined) {
            this.$button.attr("data-id", d);
            b('label[for="' + d + '"]').click(function (f) {
               f.preventDefault();
               c.$button.focus()
            })
         }
         this.checkDisabled();
         this.clickListener();
         if (this.options.liveSearch) {
            this.liveSearchListener()
         }
         this.render();
         this.liHeight();
         this.setStyle();
         this.setWidth();
         if (this.options.container) {
            this.selectPosition()
         }
         this.$menu.data("this", this);
         this.$newElement.data("this", this)
      },
      createDropdown: function () {
         var c = this.multiple ? " show-tick" : "";
         var g = this.autofocus ? " autofocus" : "";
         var f = this.options.header ? '<div class="popover-title"><button type="button" class="close" aria-hidden="true">&times;</button>' + this.options.header + "</div>" : "";
         var e = this.options.liveSearch ? '<div class="bootstrap-select-searchbox"><input type="text" class="input-block-level form-control" /></div>' : "";
         var d = '<div class="btn-group bootstrap-select' + c + '"><button type="button" class="btn dropdown-toggle selectpicker" data-toggle="dropdown"' + g + '><span class="filter-option pull-left"></span>&nbsp;<span class="caret"></span></button><div class="dropdown-menu open">' + f + e + '<ul class="dropdown-menu inner selectpicker" role="menu"></ul></div></div>';
         return b(d);
      },
      createView: function () {
         var c = this.createDropdown();
         var d = this.createLi();
         c.find("ul").append(d);
         return c
      },
      reloadLi: function () {
         this.destroyLi();
         var c = this.createLi();
         this.$menu.find("ul").append(c)
      },
      destroyLi: function () {
         this.$menu.find("li").remove()
      },
      createLi: function () {
         var d = this, e = [], c = "";
         this.$element.find("option").each(function () {
            var i = b(this);
            var g = i.attr("class") || "";
            var h = i.attr("style") || "";
            var m = i.data("content") ? i.data("content") : i.html();
            var k = i.data("subtext") !== undefined ? '<small class="muted text-muted">' + i.data("subtext") + "</small>" : "";
            var j = i.data("icon") !== undefined ? '<i class="' + d.options.iconBase + " " + i.data("icon") + '"></i> ' : "";
            if (j !== "" && (i.is(":disabled") || i.parent().is(":disabled"))) {
               j = "<span>" + j + "</span>"
            }
            if (!i.data("content")) {
               m = j + '<span class="text">' + m + k + "</span>"
            }
            if (d.options.hideDisabled && (i.is(":disabled") || i.parent().is(":disabled"))) {
               e.push('<a style="min-height: 0; padding: 0"></a>')
            } else {
               if (i.parent().is("optgroup") && i.data("divider") !== true) {
                  if (i.index() === 0) {
                     var l = i.parent().attr("label");
                     var n = i.parent().data("subtext") !== undefined ? '<small class="muted text-muted">' + i.parent().data("subtext") + "</small>" : "";
                     var f = i.parent().data("icon") ? '<i class="' + i.parent().data("icon") + '"></i> ' : "";
                     l = f + '<span class="text">' + l + n + "</span>";
                     if (i[0].index !== 0) {
                        e.push('<div class="div-contain"><div class="divider"></div></div><dt>' + l + "</dt>" + d.createA(m, "opt " + g, h))
                     } else {
                        e.push("<dt>" + l + "</dt>" + d.createA(m, "opt " + g, h))
                     }
                  } else {
                     e.push(d.createA(m, "opt " + g, h))
                  }
               } else {
                  if (i.data("divider") === true) {
                     e.push('<div class="div-contain"><div class="divider"></div></div>')
                  } else {
                     if (b(this).data("hidden") === true) {
                        e.push("")
                     } else {
                        e.push(d.createA(m, g, h))
                     }
                  }
               }
            }
         });
         b.each(e, function (f, g) {
            c += "<li rel=" + f + ">" + g + "</li>"
         });
         if (!this.multiple && this.$element.find("option:selected").length === 0 && !this.options.title) {
            this.$element.find("option").eq(0).prop("selected", true).attr("selected", "selected")
         }
         return b(c)
      },
      createA: function (e, c, d) {
         return'<a tabindex="0" class="' + c + '" style="' + d + '">' + e + '<i class="' + this.options.iconBase + " " + this.options.tickIcon + ' icon-ok check-mark"></i></a>'
      },
      render: function (e) {
         var d = this;
         if (e !== false) {
            this.$element.find("option").each(function (i) {
               d.setDisabled(i, b(this).is(":disabled") || b(this).parent().is(":disabled"));
               d.setSelected(i, b(this).is(":selected"))
            })
         }
         this.tabIndex();
         var h = this.$element.find("option:selected").map(function () {
            var k = b(this);
            var j = k.data("icon") && d.options.showIcon ? '<i class="' + d.options.iconBase + " " + k.data("icon") + '"></i> ' : "";
            var i;
            if (d.options.showSubtext && k.attr("data-subtext") && !d.multiple) {
               i = ' <small class="muted text-muted">' + k.data("subtext") + "</small>"
            } else {
               i = ""
            }
            if (k.data("content") && d.options.showContent) {
               return k.data("content")
            } else {
               if (k.attr("title") !== undefined) {
                  return k.attr("title")
               } else {
                  return j + k.html() + i
               }
            }
         }).toArray();
         var g = !this.multiple ? h[0] : h.join(this.options.multipleSeparator);
         if (this.multiple && this.options.selectedTextFormat.indexOf("count") > -1) {
            var c = this.options.selectedTextFormat.split(">");
            var f = this.options.hideDisabled ? ":not([disabled])" : "";
            if ((c.length > 1 && h.length > c[1]) || (c.length == 1 && h.length >= 2)) {
               g = this.options.countSelectedText.replace("{0}", h.length).replace("{1}", this.$element.find('option:not([data-divider="true"]):not([data-hidden="true"])' + f).length)
            }
         }
         if (!g) {
            g = this.options.title !== undefined ? this.options.title : this.options.noneSelectedText
         }
         this.$button.attr("title", b.trim(g));
         this.$newElement.find(".filter-option").html(g)
      },
      setStyle: function (e, d) {
         if (this.$element.attr("class")) {
            this.$newElement.addClass(this.$element.attr("class").replace(/selectpicker|mobile-device/gi, ""))
         }
         var c = e ? e : this.options.style;
         if (d == "add") {
            this.$button.addClass(c)
         } else {
            if (d == "remove") {
               this.$button.removeClass(c)
            } else {
               this.$button.removeClass(this.options.style);
               this.$button.addClass(c)
            }
         }
      },
      liHeight: function () {
         var e = this.$menu.parent().clone().find("> .dropdown-toggle").prop("autofocus", false).end().appendTo("body"), f = e.addClass("open").find("> .dropdown-menu"), d = f.find("li > a").outerHeight(), c = this.options.header ? f.find(".popover-title").outerHeight() : 0, g = this.options.liveSearch ? f.find(".bootstrap-select-searchbox").outerHeight() : 0;
         e.remove();
         this.$newElement.data("liHeight", d).data("headerHeight", c).data("searchHeight", g)
      },
      setSize: function () {
         var h = this, d = this.$menu, i = d.find(".inner"), t = this.$newElement.outerHeight(), f = this.$newElement.data("liHeight"), r = this.$newElement.data("headerHeight"), l = this.$newElement.data("searchHeight"), k = d.find("li .divider").outerHeight(true), q = parseInt(d.css("padding-top")) + parseInt(d.css("padding-bottom")) + parseInt(d.css("border-top-width")) + parseInt(d.css("border-bottom-width")), o = this.options.hideDisabled ? ":not(.disabled)" : "", n = b(window), g = q + parseInt(d.css("margin-top")) + parseInt(d.css("margin-bottom")) + 2, p, u, s, j = function () {
            u = h.$newElement.offset().top - n.scrollTop();
            s = n.height() - u - t
         };
         j();
         if (this.options.header) {
            d.css("padding-top", 0)
         }
         if (this.options.size == "auto") {
            var e = function () {
               var v;
               j();
               p = s - g;
               if (h.options.dropupAuto) {
                  h.$newElement.toggleClass("dropup", (u > s) && ((p - g) < d.height()))
               }
               if (h.$newElement.hasClass("dropup")) {
                  p = u - g
               }
               if ((d.find("li").length + d.find("dt").length) > 3) {
                  v = f * 3 + g - 2
               } else {
                  v = 0
               }
               d.css({
                  "max-height": p + "px",
                  overflow: "hidden",
                  "min-height": v + "px"
               });
               i.css({
                  "max-height": p - r - l - q + "px",
                  "overflow-y": "auto",
                  "min-height": v - q + "px"
               })
            };
            e();
            b(window).resize(e);
            b(window).scroll(e)
         } else {
            if (this.options.size && this.options.size != "auto" && d.find("li" + o).length > this.options.size) {
               var m = d.find("li" + o + " > *").filter(":not(.div-contain)").slice(0, this.options.size).last().parent().index();
               var c = d.find("li").slice(0, m + 1).find(".div-contain").length;
               p = f * this.options.size + c * k + q;
               if (h.options.dropupAuto) {
                  this.$newElement.toggleClass("dropup", (u > s) && (p < d.height()))
               }
               d.css({
                  "max-height": p + r + l + "px",
                  overflow: "hidden"
               });
               i.css({
                  "max-height": p - q + "px",
                  "overflow-y": "auto"
               })
            }
         }
      },
      setWidth: function () {
         if (this.options.width == "auto") {
            this.$menu.css("min-width", "0");
            var d = this.$newElement.clone().appendTo("body");
            var c = d.find("> .dropdown-menu").css("width");
            d.remove();
            this.$newElement.css("width", c)
         } else {
            if (this.options.width == "fit") {
               this.$menu.css("min-width", "");
               this.$newElement.css("width", "").addClass("fit-width")
            } else {
               if (this.options.width) {
                  this.$menu.css("min-width", "");
                  this.$newElement.css("width", this.options.width)
               } else {
                  this.$menu.css("min-width", "");
                  this.$newElement.css("width", "")
               }
            }
         }
         if (this.$newElement.hasClass("fit-width") && this.options.width !== "fit") {
            this.$newElement.removeClass("fit-width")
         }
      },
      selectPosition: function () {
         var e = this, d = "<div />", f = b(d), h, g, c = function (i) {
            f.addClass(i.attr("class")).toggleClass("dropup", i.hasClass("dropup"));
            h = i.offset();
            g = i.hasClass("dropup") ? 0 : i[0].offsetHeight;
            f.css({
               top: h.top + g,
               left: h.left,
               width: i[0].offsetWidth,
               position: "absolute"
            })
         };
         this.$newElement.on("click", function () {
            c(b(this));
            f.appendTo(e.options.container);
            f.toggleClass("open", !b(this).hasClass("open"));
            f.append(e.$menu)
         });
         b(window).resize(function () {
            c(e.$newElement)
         });
         b(window).on("scroll", function () {
            c(e.$newElement)
         });
         b("html").on("click", function (i) {
            if (b(i.target).closest(e.$newElement).length < 1) {
               f.removeClass("open")
            }
         })
      },
      mobile: function () {
         this.$element.addClass("mobile-device").appendTo(this.$newElement);
         if (this.options.container) {
            this.$menu.hide()
         }
      },
      refresh: function () {
         this.$lis = null;
         this.reloadLi();
         this.render();
         this.setWidth();
         this.setStyle();
         this.checkDisabled();
         this.liHeight()
      },
      update: function () {
         this.reloadLi();
         this.setWidth();
         this.setStyle();
         this.checkDisabled();
         this.liHeight()
      },
      setSelected: function (c, d) {
         if (this.$lis == null) {
            this.$lis = this.$menu.find("li")
         }
         b(this.$lis[c]).toggleClass("selected", d)
      },
      setDisabled: function (c, d) {
         if (this.$lis == null) {
            this.$lis = this.$menu.find("li")
         }
         if (d) {
            b(this.$lis[c]).addClass("disabled").find("a").attr("href", "#").attr("tabindex", -1)
         } else {
            b(this.$lis[c]).removeClass("disabled").find("a").removeAttr("href").attr("tabindex", 0)
         }
      },
      isDisabled: function () {
         return this.$element.is(":disabled")
      },
      checkDisabled: function () {
         var c = this;
         if (this.isDisabled()) {
            this.$button.addClass("disabled").attr("tabindex", -1)
         } else {
            if (this.$button.hasClass("disabled")) {
               this.$button.removeClass("disabled")
            }
            if (this.$button.attr("tabindex") == -1) {
               if (!this.$element.data("tabindex")) {
                  this.$button.removeAttr("tabindex")
               }
            }
         }
         this.$button.click(function () {
            return !c.isDisabled()
         })
      },
      tabIndex: function () {
         if (this.$element.is("[tabindex]")) {
            this.$element.data("tabindex", this.$element.attr("tabindex"));
            this.$button.attr("tabindex", this.$element.data("tabindex"))
         }
      },
      clickListener: function () {
         var c = this;
         b("body").on("touchstart.dropdown", ".dropdown-menu", function (d) {
            d.stopPropagation()
         });
         this.$newElement.on("click", function () {
            c.setSize();
            if (!c.options.liveSearch && !c.multiple) {
               setTimeout(function () {
                  c.$menu.find(".selected a").focus()
               }, 10)
            }
         });
         this.$menu.on("click", "li a", function (k) {
            var g = b(this).parent().index(), j = c.$element.val(), f = c.$element.prop("selectedIndex");
            if (c.multiple) {
               k.stopPropagation()
            }
            k.preventDefault();
            if (!c.isDisabled() && !b(this).parent().hasClass("disabled")) {
               var d = c.$element.find("option"), i = d.eq(g), h = i.prop("selected");
               if (!c.multiple) {
                  d.prop("selected", false);
                  i.prop("selected", true);
                  c.$menu.find(".selected").removeClass("selected");
                  c.setSelected(g, true)
               } else {
                  i.prop("selected", !h);
                  c.setSelected(g, !h)
               }
               if (!c.multiple) {
                  c.$button.focus()
               } else {
                  if (c.options.liveSearch) {
                     c.$searchbox.focus()
                  }
               }
               if ((j != c.$element.val() && c.multiple) || (f != c.$element.prop("selectedIndex") && !c.multiple)) {
                  c.$element.change()
               }
            }
         });
         this.$menu.on("click", "li.disabled a, li dt, li .div-contain, .popover-title, .popover-title :not(.close)", function (d) {
            if (d.target == this) {
               d.preventDefault();
               d.stopPropagation();
               if (!c.options.liveSearch) {
                  c.$button.focus()
               } else {
                  c.$searchbox.focus()
               }
            }
         });
         this.$menu.on("click", ".popover-title .close", function () {
            c.$button.focus()
         });
         this.$searchbox.on("click", function (d) {
            d.stopPropagation()
         });
         this.$element.change(function () {
            c.render(false)
         })
      },
      liveSearchListener: function () {
         var d = this, c = b('<li class="no-results"></li>');
         this.$newElement.on("click.dropdown.data-api", function () {
            d.$menu.find(".active").removeClass("active");
            if (!!d.$searchbox.val()) {
               d.$searchbox.val("");
               d.$menu.find("li").show();
               if (!!c.parent().length) {
                  c.remove()
               }
            }
            if (!d.multiple) {
               d.$menu.find(".selected").addClass("active")
            }
            setTimeout(function () {
               d.$searchbox.focus()
            }, 10)
         });
         this.$searchbox.on("input propertychange", function () {
            if (d.$searchbox.val()) {
               d.$menu.find("li").show().not(":icontains(" + d.$searchbox.val() + ")").hide();
               if (!d.$menu.find("li").filter(":visible:not(.no-results)").length) {
                  if (!!c.parent().length) {
                     c.remove()
                  }
                  c.html(d.options.noneResultsText + ' "' + d.$searchbox.val() + '"').show();
                  d.$menu.find("li").last().after(c)
               } else {
                  if (!!c.parent().length) {
                     c.remove()
                  }
               }
            } else {
               d.$menu.find("li").show();
               if (!!c.parent().length) {
                  c.remove()
               }
            }
            d.$menu.find("li.active").removeClass("active");
            d.$menu.find("li").filter(":visible:not(.divider)").eq(0).addClass("active").find("a").focus();
            b(this).focus()
         });
         this.$menu.on("mouseenter", "a", function (f) {
            d.$menu.find(".active").removeClass("active");
            b(f.currentTarget).parent().not(".disabled").addClass("active")
         });
         this.$menu.on("mouseleave", "a", function () {
            d.$menu.find(".active").removeClass("active")
         })
      },
      val: function (c) {
         if (c !== undefined) {
            this.$element.val(c);
            this.$element.change();
            return this.$element
         } else {
            return this.$element.val()
         }
      },
      selectAll: function () {
         this.$element.find("option").prop("selected", true).attr("selected", "selected");
         this.render()
      },
      deselectAll: function () {
         this.$element.find("option").prop("selected", false).removeAttr("selected");
         this.render()
      },
      keydown: function (p) {
         var q, o, i, n, k, j, r, f, h, m, d, s, g = {
            32: " ",
            48: "0",
            49: "1",
            50: "2",
            51: "3",
            52: "4",
            53: "5",
            54: "6",
            55: "7",
            56: "8",
            57: "9",
            59: ";",
            65: "a",
            66: "b",
            67: "c",
            68: "d",
            69: "e",
            70: "f",
            71: "g",
            72: "h",
            73: "i",
            74: "j",
            75: "k",
            76: "l",
            77: "m",
            78: "n",
            79: "o",
            80: "p",
            81: "q",
            82: "r",
            83: "s",
            84: "t",
            85: "u",
            86: "v",
            87: "w",
            88: "x",
            89: "y",
            90: "z",
            96: "0",
            97: "1",
            98: "2",
            99: "3",
            100: "4",
            101: "5",
            102: "6",
            103: "7",
            104: "8",
            105: "9"
         };
         q = b(this);
         i = q.parent();
         if (q.is("input")) {
            i = q.parent().parent()
         }
         m = i.data("this");
         if (m.options.liveSearch) {
            i = q.parent().parent()
         }
         if (m.options.container) {
            i = m.$menu
         }
         o = b("[role=menu] li:not(.divider) a", i);
         s = m.$menu.parent().hasClass("open");
         if (m.options.liveSearch) {
            if (/(^9$|27)/.test(p.keyCode) && s && m.$menu.find(".active").length === 0) {
               p.preventDefault();
               m.$menu.parent().removeClass("open");
               m.$button.focus()
            }
            o = b("[role=menu] li:not(.divider):visible", i);
            if (!q.val() && !/(38|40)/.test(p.keyCode)) {
               if (o.filter(".active").length === 0) {
                  o = m.$newElement.find("li").filter(":icontains(" + g[p.keyCode] + ")")
               }
            }
         }
         if (!o.length) {
            return
         }
         if (/(38|40)/.test(p.keyCode)) {
            if (!s) {
               m.$menu.parent().addClass("open")
            }
            n = o.index(o.filter(":focus"));
            j = o.parent(":not(.disabled):visible").first().index();
            r = o.parent(":not(.disabled):visible").last().index();
            k = o.eq(n).parent().nextAll(":not(.disabled):visible").eq(0).index();
            f = o.eq(n).parent().prevAll(":not(.disabled):visible").eq(0).index();
            h = o.eq(k).parent().prevAll(":not(.disabled):visible").eq(0).index();
            if (m.options.liveSearch) {
               o.each(function (e) {
                  if (b(this).is(":not(.disabled)")) {
                     b(this).data("index", e)
                  }
               });
               n = o.index(o.filter(".active"));
               j = o.filter(":not(.disabled):visible").first().data("index");
               r = o.filter(":not(.disabled):visible").last().data("index");
               k = o.eq(n).nextAll(":not(.disabled):visible").eq(0).data("index");
               f = o.eq(n).prevAll(":not(.disabled):visible").eq(0).data("index");
               h = o.eq(k).prevAll(":not(.disabled):visible").eq(0).data("index")
            }
            d = q.data("prevIndex");
            if (p.keyCode == 38) {
               if (m.options.liveSearch) {
                  n -= 1
               }
               if (n != h && n > f) {
                  n = f
               }
               if (n < j) {
                  n = j
               }
               if (n == d) {
                  n = r
               }
            }
            if (p.keyCode == 40) {
               if (m.options.liveSearch) {
                  n += 1
               }
               if (n == -1) {
                  n = 0
               }
               if (n != h && n < k) {
                  n = k
               }
               if (n > r) {
                  n = r
               }
               if (n == d) {
                  n = j
               }
            }
            q.data("prevIndex", n);
            if (!m.options.liveSearch) {
               o.eq(n).focus()
            } else {
               p.preventDefault();
               if (!q.is(".dropdown-toggle")) {
                  o.removeClass("active");
                  o.eq(n).addClass("active").find("a").focus();
                  q.focus()
               }
            }
         } else {
            if (!q.is("input")) {
               var c = [], l, t;
               o.each(function () {
                  if (b(this).parent().is(":not(.disabled)")) {
                     if (b.trim(b(this).text().toLowerCase()).substring(0, 1) == g[p.keyCode]) {
                        c.push(b(this).parent().index())
                     }
                  }
               });
               l = b(document).data("keycount");
               l++;
               b(document).data("keycount", l);
               t = b.trim(b(":focus").text().toLowerCase()).substring(0, 1);
               if (t != g[p.keyCode]) {
                  l = 1;
                  b(document).data("keycount", l)
               } else {
                  if (l >= c.length) {
                     b(document).data("keycount", 0);
                     if (l > c.length) {
                        l = 1
                     }
                  }
               }
               o.eq(c[l - 1]).focus()
            }
         }
         if (/(13|32|^9$)/.test(p.keyCode) && s) {
            if (!/(32)/.test(p.keyCode)) {
               p.preventDefault()
            }
            if (!m.options.liveSearch) {
               b(":focus").click()
            } else {
               if (!/(32)/.test(p.keyCode)) {
                  m.$menu.find(".active a").click();
                  q.focus()
               }
            }
            b(document).data("keycount", 0)
         }
         if ((/(^9$|27)/.test(p.keyCode) && s && (m.multiple || m.options.liveSearch)) || (/(27)/.test(p.keyCode) && !s)) {
            m.$menu.parent().removeClass("open");
            m.$button.focus()
         }
      },
      hide: function () {
         this.$newElement.hide()
      },
      show: function () {
         this.$newElement.show()
      },
      destroy: function () {
         this.$newElement.remove();
         this.$element.remove()
      }
   };
   b.fn.selectpicker = function (e, f) {
      var c = arguments;
      var g;
      var d = this.each(function () {
         if (b(this).is("select")) {
            var m = b(this), l = m.data("selectpicker"), h = typeof e == "object" && e;
            if (!l) {
               m.data("selectpicker", (l = new a(this, h, f)))
            } else {
               if (h) {
                  for (var j in h) {
                     l.options[j] = h[j]
                  }
               }
            }
            if (typeof e == "string") {
               var k = e;
               if (l[k] instanceof Function) {
                  [].shift.apply(c);
                  g = l[k].apply(l, c)
               } else {
                  g = l.options[k]
               }
            }
         }
      });
      if (g !== undefined) {
         return g
      } else {
         return d
      }
   };
   b.fn.selectpicker.defaults = {
      style: "btn-default",
      size: "auto",
      title: null,
      selectedTextFormat: "values",
      noneSelectedText: "Nothing selected",
      noneResultsText: "No results match",
      countSelectedText: "{0} of {1} selected",
      width: false,
      container: false,
      hideDisabled: false,
      showSubtext: false,
      showIcon: true,
      showContent: true,
      dropupAuto: true,
      header: false,
      liveSearch: false,
      multipleSeparator: ", ",
      iconBase: "glyphicon",
      tickIcon: "glyphicon-ok"
   };
   b(document).data("keycount", 0).on("keydown", ".bootstrap-select [data-toggle=dropdown], .bootstrap-select [role=menu], .bootstrap-select-searchbox input", a.prototype.keydown).on("focusin.modal", ".bootstrap-select [data-toggle=dropdown], .bootstrap-select [role=menu], .bootstrap-select-searchbox input", function (c) {
      c.stopPropagation()
   })
}(window.jQuery);



// Tag Input JS
(function ($) {
   "use strict";

   var defaultOptions = {
      tagClass: function (item) {
         return 'label label-info';
      },
      itemValue: function (item) {
         return item ? item.toString() : item;
      },
      itemText: function (item) {
         return this.itemValue(item);
      },
      freeInput: true,
      maxTags: undefined,
      confirmKeys: [13],
      onTagExists: function (item, $tag) {
         $tag.hide().fadeIn();
      },
      //source: [],
      onSelect: function () {
      }
   };

   /**
    * Constructor function
    */
   function TagsInput(element, options) {
      this.itemsArray = [];

      this.$element = $(element);
      this.$element.hide();


      this.isSelect = (element.tagName === 'SELECT');
      this.multiple = (this.isSelect && element.hasAttribute('multiple'));
      this.objectItems = options && options.itemValue;
      this.placeholderText = element.hasAttribute('placeholder') ? this.$element.attr('placeholder') : '';
      this.inputSize = Math.max(1, this.placeholderText.length);

      this.$container = $('<div class="tagsinput"></div>');
      this.$input = $('<input size="' + this.inputSize + '" type="text" placeholder="' + this.placeholderText + '"/>').appendTo(this.$container);

      this.$element.after(this.$container);
      this.$container.attr("class", this.$element.attr('class') + " tagsinput");

      this.build(options);

   }

   TagsInput.prototype = {
      constructor: TagsInput,
      /**
       * Adds the given item as a new tag. Pass true to dontPushVal to prevent
       * updating the elements val()
       */
      add: function (item, dontPushVal)
      {
         var self = this;

         if (self.options.maxTags && self.itemsArray.length >= self.options.maxTags)
            return;

         // Ignore falsey values, except false
         if (item !== false && !item)
            return;

         // Throw an error when trying to add an object while the itemValue option was not set
         if (typeof item === "object" && !self.objectItems)
            throw("Can't add objects when itemValue option is not set");

         // Ignore strings only containg whitespace
         if (item.toString().match(/^\s*$/))
            return;

         // If SELECT but not multiple, remove current tag
         if (self.isSelect && !self.multiple && self.itemsArray.length > 0)
            self.remove(self.itemsArray[0]);

         if (typeof item === "string" && this.$element[0].tagName === 'INPUT') {
            var items = item.split(',');
            if (items.length > 1) {
               for (var i = 0;
                       i < items.length;
                       i++) {
                  this.add(items[i], true);
               }

               if (!dontPushVal)
                  self.pushVal();
               return;
            }
         }

         var itemValue = self.options.itemValue(item),
                 itemText = self.options.itemText(item),
                 tagClass = self.options.tagClass(item);

         // Ignore items allready added
         var existing = $.grep(self.itemsArray, function (item) {
            return self.options.itemValue(item) === itemValue;
         })[0];
         if (existing) {
            // Invoke onTagExists
            if (self.options.onTagExists) {
               var $existingTag = $(".tag", self.$container).filter(function () {
                  return $(this).data("item") === existing;
               });
               self.options.onTagExists(item, $existingTag);
            }
            return;
         }

         // register item in internal array and map
         self.itemsArray.push(item);

         // add a tag element
         var $tag = $('<span class="tag ' + htmlEncode(tagClass) + '"><p>' + htmlEncode(itemText) + '</p><span class="close-icon" data-role="remove"></span></span>');
         $tag.data('item', item);
         self.findInputWrapper().before($tag);
         $tag.after(' ');

         // add <option /> if item represents a value not present in one of the <select />'s options
         if (self.isSelect && !$('option[value="' + escape(itemValue) + '"]', self.$element)[0]) {
            var $option = $('<option selected>' + htmlEncode(itemText) + '</option>');
            $option.data('item', item);
            $option.attr('value', itemValue);
            self.$element.append($option);
         }

         if (!dontPushVal)
            self.pushVal();

         // Add class when reached maxTags
         if (self.options.maxTags === self.itemsArray.length)
            self.$container.addClass('bootstrap-tagsinput-max');

         self.$element.trigger($.Event('itemAdded', {
            item: item
         }));
         //self.$container.attr("class",self.$element.attr('class')+" bootstrap-tagsinput");
      },
      /**
       * Removes the given item. Pass true to dontPushVal to prevent updating the
       * elements val()
       */
      remove: function (item, dontPushVal) {
         var self = this;

         if (self.objectItems) {
            if (typeof item === "object")
               item = $.grep(self.itemsArray, function (other) {
                  return self.options.itemValue(other) == self.options.itemValue(item);
               })[0];
            else
               item = $.grep(self.itemsArray, function (other) {
                  return self.options.itemValue(other) == item;
               })[0];
         }

         if (item) {
            $('.tag', self.$container).filter(function () {
               return $(this).data('item') === item;
            }).remove();
            $('option', self.$element).filter(function () {
               return $(this).data('item') === item;
            }).remove();
            self.itemsArray.splice($.inArray(item, self.itemsArray), 1);
         }

         if (!dontPushVal)
            self.pushVal();

         // Remove class when reached maxTags
         if (self.options.maxTags > self.itemsArray.length)
            self.$container.removeClass('bootstrap-tagsinput-max');

         self.$element.trigger($.Event('itemRemoved', {
            item: item
         }));
         //self.$container.attr("class",self.$element.attr('class')+" bootstrap-tagsinput");
      },
      /**
       * Removes all items
       */
      removeAll: function () {
         var self = this;

         $('.tag', self.$container).remove();
         $('option', self.$element).remove();

         while (self.itemsArray.length > 0)
            self.itemsArray.pop();

         self.pushVal();

         if (self.options.maxTags && !this.isEnabled())
            this.enable();
      },
      /**
       * Refreshes the tags so they match the text/value of their corresponding
       * item.
       */
      refresh: function () {
         var self = this;
         $('.tag', self.$container).each(function () {
            var $tag = $(this),
                    item = $tag.data('item'),
                    itemValue = self.options.itemValue(item),
                    itemText = self.options.itemText(item),
                    tagClass = self.options.tagClass(item);

            // Update tag's class and inner text
            $tag.attr('class', null);
            $tag.addClass('tag ' + htmlEncode(tagClass));
            $tag.contents().filter(function () {
               return this.nodeType == 3;
            })[0].nodeValue = htmlEncode(itemText);

            if (self.isSelect) {
               var option = $('option', self.$element).filter(function () {
                  return $(this).data('item') === item;
               });
               option.attr('value', itemValue);
            }
         });
      },
      /**
       * Returns the items added as tags
       */
      items: function () {
         return this.itemsArray;
      },
      /**
       * Assembly value by retrieving the value of each item, and set it on the
       * element. 
       */
      pushVal: function () {
         var self = this,
                 val = $.map(self.items(), function (item) {
                    return self.options.itemValue(item);
                 });

         self.$element.val(val, true).trigger('change');
         self.$container.addClass(self.$element.attr('class'));
      },
      /**
       * Initializes the tags input behaviour on the element
       */
      build: function (options)
      {
         var self = this;

         self.options = $.extend({
         }, defaultOptions, options);
         var typeahead = self.options.typeahead || {
         };

         // When itemValue is set, freeInput should always be false
         if (self.objectItems)
            self.options.freeInput = false;

         /*this.$input.autocomplete({
          source: self.options.source,
          focus: function(event, ui) {
          self.$input.val(self.options.itemText(ui.item));
          event.preventDefault();
          return false;
          },
          select: function(event, ui)
          {
          self.options.onSelect.apply(self, [event, ui]);
          self.add(ui.item);
          self.$input.val('');
          event.preventDefault();
          }
          });*/

         makeOptionItemFunction(self.options, 'itemValue');
         makeOptionItemFunction(self.options, 'itemText');
         makeOptionItemFunction(self.options, 'tagClass');

         // for backwards compatibility, self.options.source is deprecated
         if (self.options.source)
            typeahead.source = self.options.source;

         if (typeahead.source && $.fn.typeahead) {
            makeOptionFunction(typeahead, 'source');

            self.$input.typeahead({
               source: function (query, process)
               {
                  function processItems(items)
                  {
                     var texts = [];

                     for (var i = 0;
                             i < items.length;
                             i++)
                     {
                        var text = self.options.itemText(items[i]);
                        map[text] = items[i];
                        texts.push(text);
                     }
                     process(texts);
                  }

                  this.map = {
                  };
                  var map = this.map, data = typeahead.source(query, processItems);

                  /*if ($.isFunction(data.success)) {
                   // support for Angular promises
                   data.success(processItems);
                   } else { */
                  // support for functions and jquery promises
                  //alert(JSON.stringify(data));
                  //$.when(data).then(processItems);
                  //}
               },
               /*source:typeahead.source,*/
               updater: function (text)
               {
                  self.add(this.map[text]);
               },
               matcher: function (text)
               {
                  //alert(text.name);
                  return (text.toLowerCase().indexOf(this.query.trim().toLowerCase()) !== -1);
               },
               sorter: function (texts)
               {
                  return texts.sort();
               },
               highlighter: function (text)
               {
                  var regex = new RegExp('(' + this.query + ')', 'gi');
                  return text.replace(regex, "<strong>$1</strong>");
               }
            });
         }
         self.$input.focus(function ()
         {
            self.$container.addClass("valued active");
            self.$element.addClass("active").change();
         });
         self.$input.blur(function ()
         {
            if (!self.$element.val())
               self.$container.removeClass("valued");

            self.$element.removeClass("active").change();
            self.$container.removeClass("active");

         });
         self.$container.on('click', $.proxy(function (event) {
            self.$input.focus();
         }, self));

         self.$container.on('keydown', 'input', $.proxy(function (event) {
            var $input = $(event.target),
                    $inputWrapper = self.findInputWrapper();

            switch (event.which) {
               // BACKSPACE
               case 8:
                  if (doGetCaretPosition($input[0]) === 0) {
                     var prev = $inputWrapper.prev();
                     if (prev) {
                        self.remove(prev.data('item'));

                     }
                  }
                  break;

                  // DELETE
               case 46:
                  if (doGetCaretPosition($input[0]) === 0) {
                     var next = $inputWrapper.next();
                     if (next) {
                        self.remove(next.data('item'));
                     }
                  }
                  break;

                  // LEFT ARROW
               case 37:
                  // Try to move the input before the previous tag
                  var $prevTag = $inputWrapper.prev();
                  if ($input.val().length === 0 && $prevTag[0]) {
                     $prevTag.before($inputWrapper);
                     $input.focus();
                  }
                  break;
                  // RIGHT ARROW
               case 39:
                  // Try to move the input after the next tag
                  var $nextTag = $inputWrapper.next();
                  if ($input.val().length === 0 && $nextTag[0]) {
                     $nextTag.after($inputWrapper);
                     $input.focus();
                  }
                  break;
               default:
                  // When key corresponds one of the confirmKeys, add current input
                  // as a new tag
                  if (self.options.freeInput && $.inArray(event.which, self.options.confirmKeys) >= 0) {
                     self.add($input.val());
                     $input.val('');
                     event.preventDefault();
                  }
            }

            // Reset internal input's size
            $input.attr('size', Math.max(this.inputSize, $input.val().length));
         }, self));

         // Remove icon clicked
         self.$container.on('click', '[data-role=remove]', $.proxy(function (event) {
            self.remove($(event.target).closest('.tag').data('item'));
         }, self));

         // Only add existing value as tags when using strings as tags
         if (self.options.itemValue === defaultOptions.itemValue) {
            if (self.$element[0].tagName === 'INPUT') {
               self.add(self.$element.val());
            } else {
               $('option', self.$element).each(function () {
                  self.add($(this).attr('value'), true);
               });
            }
         }
      },
      /**
       * Removes all tagsinput behaviour and unregsiter all event handlers
       */
      destroy: function () {
         var self = this;

         // Unbind events
         self.$container.off('keypress', 'input');
         self.$container.off('click', '[role=remove]');

         self.$container.remove();
         self.$element.removeData('tagsinput');
         self.$element.show();
      },
      /**
       * Sets focus on the tagsinput 
       */
      focus: function () {
         this.$input.focus();

      },
      /**
       * Returns the internal input element
       */
      input: function () {
         return this.$input;
      },
      /**
       * Returns the element which is wrapped around the internal input. This
       * is normally the $container, but typeahead.js moves the $input element.
       */
      findInputWrapper: function () {
         var elt = this.$input[0],
                 container = this.$container[0];
         while (elt && elt.parentNode !== container)
            elt = elt.parentNode;

         return $(elt);
      }
   };

   /**
    * Register JQuery plugin
    */
   $.fn.tagsinput = function (arg1, arg2) {
      var results = [];

      this.each(function () {
         var tagsinput = $(this).data('tagsinput');

         // Initialize a new tags input
         if (!tagsinput) {
            tagsinput = new TagsInput(this, arg1);
            $(this).data('tagsinput', tagsinput);
            results.push(tagsinput);

            if (this.tagName === 'SELECT') {
               $('option', $(this)).attr('selected', 'selected');
            }

            // Init tags from $(this).val()
            $(this).val($(this).val());
         } else {
            // Invoke function on existing tags input
            var retVal = tagsinput[arg1](arg2);
            if (retVal !== undefined)
               results.push(retVal);
         }
      });

      if (typeof arg1 == 'string') {
         // Return the results from the invoked function calls
         return results.length > 1 ? results : results[0];
      } else {
         return results;
      }
   };

   $.fn.tagsinput.Constructor = TagsInput;

   /**
    * Most options support both a string or number as well as a function as 
    * option value. This function makes sure that the option with the given
    * key in the given options is wrapped in a function
    */
   function makeOptionItemFunction(options, key) {
      if (typeof options[key] !== 'function') {
         var propertyName = options[key];
         options[key] = function (item) {
            return item[propertyName];
         };
      }
   }
   function makeOptionFunction(options, key) {
      if (typeof options[key] !== 'function') {
         var value = options[key];
         options[key] = function () {
            return value;
         };
      }
   }
   /**
    * HtmlEncodes the given value
    */
   var htmlEncodeContainer = $('<div />');
   function htmlEncode(value) {
      if (value) {
         return htmlEncodeContainer.text(value).html();
      } else {
         return '';
      }
   }

   /**
    * Returns the position of the caret in the given input field
    * http://flightschool.acylt.com/devnotes/caret-position-woes/
    */
   function doGetCaretPosition(oField) {
      var iCaretPos = 0;
      if (document.selection) {
         oField.focus();
         var oSel = document.selection.createRange();
         oSel.moveStart('character', -oField.value.length);
         iCaretPos = oSel.text.length;
      } else if (oField.selectionStart || oField.selectionStart == '0') {
         iCaretPos = oField.selectionStart;
      }
      return (iCaretPos);
   }

   /**
    * Initialize tagsinput behaviour on inputs and selects which have
    * data-role=tagsinput
    */
   $(function () {
      $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput();
   });
})(window.jQuery);

/* =============================================================
 * bootstrap3-typeahead.js v3.0.3
 * https://github.com/bassjobsen/Bootstrap-3-Typeahead
 * =============================================================
 * Original written by @mdo and @fat
 * =============================================================
 * Copyright 2014 Bass Jobsen @bassjobsen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

   "use strict";
   // jshint laxcomma: true


   /* TYPEAHEAD PUBLIC CLASS DEFINITION
    * ================================= */

   var Typeahead = function (element, options) {
      this.$element = $(element);
      this.options = $.extend({
      }, $.fn.typeahead.defaults, options);
      this.matcher = this.options.matcher || this.matcher;
      this.sorter = this.options.sorter || this.sorter;
      this.select = this.options.select || this.select;
      this.autoSelect = typeof this.options.autoSelect == 'boolean' ? this.options.autoSelect : true;
      this.highlighter = this.options.highlighter || this.highlighter;
      this.updater = this.options.updater || this.updater;
      this.source = this.options.source;
      this.$menu = $(this.options.menu);
      this.shown = false;
      this.listen();
      this.showHintOnFocus = typeof this.options.showHintOnFocus == 'boolean' ? this.options.showHintOnFocus : false;
   };

   Typeahead.prototype = {
      constructor: Typeahead

      ,
      select: function () {
         var val = this.$menu.find('.active').data('value');
         if (this.autoSelect || val) {
            this.$element
                    .val(this.updater(val))
                    .change();
         }
         return this.hide();
      }

      ,
      updater: function (item) {
         return item;
      }

      ,
      setSource: function (source) {
         this.source = source;
      }

      ,
      show: function () {
         /*var pos = $.extend({
          }, this.$element.position(), {
          height: this.$element[0].offsetHeight
          }), scrollHeight;*/
         var elmH = this.$element.outerHeight();
         var pos = this.$element.offset();
         var scrollHeight;

         scrollHeight = typeof this.options.scrollHeight == 'function' ?
                 this.options.scrollHeight.call() :
                 this.options.scrollHeight;

         this.$menu
                 .appendTo($("body"))
                 .css({
                    top: pos.top + elmH,
                    left: pos.left,
                    position: "absolute"
                 }).show();

         this.shown = true;
         return this;
      }

      ,
      hide: function () {
         this.$menu.hide();
         this.shown = false;
         return this;
      }

      ,
      lookup: function (query) {
         var items;
         if (typeof (query) != 'undefined' && query !== null) {
            this.query = query;
         } else {
            this.query = this.$element.val() || '';
         }

         if (this.query.length < this.options.minLength) {
            return this.shown ? this.hide() : this;
         }

         items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;

         return items ? this.process(items) : this;
      }

      ,
      process: function (items) {
         var that = this;

         items = $.grep(items, function (item) {
            return that.matcher(item);
         });

         items = this.sorter(items);

         if (!items.length) {
            return this.shown ? this.hide() : this;
         }

         if (this.options.items == 'all' || this.options.minLength === 0 && !this.$element.val()) {
            return this.render(items).show();
         } else {
            return this.render(items.slice(0, this.options.items)).show();
         }
      }

      ,
      matcher: function (item) {
         return ~item.toLowerCase().indexOf(this.query.toLowerCase());
      }

      ,
      sorter: function (items) {
         var beginswith = []
                 , caseSensitive = []
                 , caseInsensitive = []
                 , item;

         while ((item = items.shift())) {
            if (!item.toLowerCase().indexOf(this.query.toLowerCase()))
               beginswith.push(item);
            else if (~item.indexOf(this.query))
               caseSensitive.push(item);
            else
               caseInsensitive.push(item);
         }

         return beginswith.concat(caseSensitive, caseInsensitive);
      }

      ,
      highlighter: function (item) {
         var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
         return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
            return '<strong>' + match + '</strong>';
         });
      }

      ,
      render: function (items) {
         var that = this;

         items = $(items).map(function (i, item) {
            i = $(that.options.item).data('value', item);
            i.find('a').html(that.highlighter(item));
            return i[0];
         });

         if (this.autoSelect) {
            items.first().addClass('active');
         }
         this.$menu.html(items);
         return this;
      }

      ,
      next: function (event) {
         var active = this.$menu.find('.active').removeClass('active')
                 , next = active.next();

         if (!next.length) {
            next = $(this.$menu.find('li')[0]);
         }

         next.addClass('active');
      }

      ,
      prev: function (event) {
         var active = this.$menu.find('.active').removeClass('active')
                 , prev = active.prev();

         if (!prev.length) {
            prev = this.$menu.find('li').last();
         }

         prev.addClass('active');
      }

      ,
      listen: function () {
         this.$element
                 .on('focus', $.proxy(this.focus, this))
                 .on('blur', $.proxy(this.blur, this))
                 .on('keypress', $.proxy(this.keypress, this))
                 .on('keyup', $.proxy(this.keyup, this));

         if (this.eventSupported('keydown')) {
            this.$element.on('keydown', $.proxy(this.keydown, this));
         }

         this.$menu
                 .on('click', $.proxy(this.click, this))
                 .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
                 .on('mouseleave', 'li', $.proxy(this.mouseleave, this));
      }
      ,
      destroy: function () {
         this.$element.data('typeahead', null);
         this.$element
                 .off('focus')
                 .off('blur')
                 .off('keypress')
                 .off('keyup');

         if (this.eventSupported('keydown')) {
            this.$element.off('keydown');
         }

         this.$menu.remove();
      }
      ,
      eventSupported: function (eventName) {
         var isSupported = eventName in this.$element;
         if (!isSupported) {
            this.$element.setAttribute(eventName, 'return;');
            isSupported = typeof this.$element[eventName] === 'function';
         }
         return isSupported;
      }

      ,
      move: function (e) {
         if (!this.shown)
            return;

         switch (e.keyCode) {
            case 9: // tab
            case 13: // enter
            case 27: // escape
               e.preventDefault();
               break;

            case 38: // up arrow
               e.preventDefault();
               this.prev();
               break;

            case 40: // down arrow
               e.preventDefault();
               this.next();
               break;
         }

         e.stopPropagation();
      }

      ,
      keydown: function (e) {
         this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40, 38, 9, 13, 27]);
         if (!this.shown && e.keyCode == 40) {
            this.lookup("");
         } else {
            this.move(e);
         }
      }

      ,
      keypress: function (e) {
         if (this.suppressKeyPressRepeat)
            return;
         this.move(e);
      }

      ,
      keyup: function (e) {
         switch (e.keyCode) {
            case 40: // down arrow
            case 38: // up arrow
            case 16: // shift
            case 17: // ctrl
            case 18: // alt
               break;

            case 9: // tab
            case 13: // enter
               if (!this.shown)
                  return;
               this.select();
               break;

            case 27: // escape
               if (!this.shown)
                  return;
               this.hide();
               break;
            default:
               this.lookup();
         }

         e.stopPropagation();
         e.preventDefault();
      }

      ,
      focus: function (e) {
         if (!this.focused) {
            this.focused = true;
            if (this.options.minLength === 0 && !this.$element.val() || this.options.showHintOnFocus) {
               this.lookup();
            }
         }
      }

      ,
      blur: function (e) {
         this.focused = false;
         if (!this.mousedover && this.shown)
            this.hide();
      }

      ,
      click: function (e) {
         e.stopPropagation();
         e.preventDefault();
         this.select();
         this.$element.focus();
      }

      ,
      mouseenter: function (e) {
         this.mousedover = true;
         this.$menu.find('.active').removeClass('active');
         $(e.currentTarget).addClass('active');
      }

      ,
      mouseleave: function (e) {
         this.mousedover = false;
         if (!this.focused && this.shown)
            this.hide();
      }

   };


   /* TYPEAHEAD PLUGIN DEFINITION
    * =========================== */

   var old = $.fn.typeahead;

   $.fn.typeahead = function (option) {
      var arg = arguments;
      return this.each(function () {
         var $this = $(this)
                 , data = $this.data('typeahead')
                 , options = typeof option == 'object' && option;
         if (!data)
            $this.data('typeahead', (data = new Typeahead(this, options)));
         if (typeof option == 'string') {
            if (arg.length > 1) {
               data[option].apply(data, Array.prototype.slice.call(arg, 1));
            } else {
               data[option]();
            }
         }
      });
   };

   $.fn.typeahead.defaults = {
      source: [],
      items: 8,
      menu: '<ul class="typeahead dropdown-menu"></ul>',
      item: '<li><a href="#"></a></li>',
      minLength: 1,
      scrollHeight: 0,
      autoSelect: true
   };

   $.fn.typeahead.Constructor = Typeahead;


   /* TYPEAHEAD NO CONFLICT
    * =================== */

   $.fn.typeahead.noConflict = function () {
      $.fn.typeahead = old;
      return this;
   };


   /* TYPEAHEAD DATA-API
    * ================== */

   $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
      var $this = $(this);
      if ($this.data('typeahead'))
         return;
      $this.typeahead($this.data());
   });

}(window.jQuery);
