/**
 * Copyright Yehuda Katz
 * with assistance by Jay Freeman
 * 
 * You may distribute this code under the same license as jQuery (BSD or GPL
 **/

/*
 
 <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
 "http://www.w3.org/TR/html4/loose.dtd">
 <html>
 <head>
 <meta http-equiv="Content-type" content="text/html; charset=utf-8">
 <title>Templating</title>
 <script src="../../jquery/dist/jquery.min.js"></script>
 <script src="jquery.templating.js"></script>
 <script>
 jQuery(function ($) {
 $("a.updateTemplate").click(function() {
 $(this.rel).loadTemplate(this.href);
 return false;
 });
 $("._template").templatize();
 });
 </script>
 </head>
 <body>
 <div class="_template" id="myTemplate">
 <![CDATA[
 <{{tag}} href={{href}}>{{first}} {{last}}</{{tag}}>
 <p>Bar</p>
 <div>First Name: {{first}}</div>
 <div>Last Name: {{last}}</div>
 ]]>
 </div>
 <a href="foo" rel="#myTemplate" class="updateTemplate">Click</a>
 </body>
 </html>
 
 */

(function ($) {
   $.makeTemplate = function (template, begin, end) {
      var rebegin = begin.replace(/([\]{}[\\])/g, '\\$1');
      var reend = end.replace(/([\]{}[\\])/g, '\\$1');

      var code = "try { with (_context) {" +
              "var _result = '';" +
              template
              .replace(/[\t\r\n]/g, ' ')
              .replace(/^(.*)$/, end + '$1' + begin)
              .replace(new RegExp(reend + "(.*?)" + rebegin, "g"), function (text) {
                 return text
                         .replace(new RegExp("^" + reend + "(.*)" + rebegin + "$"), "$1")
                         .replace(/\\/g, "\\\\")
                         .replace(/'/g, "\\'")
                         .replace(/^(.*)$/, end + "_result += '$1';" + begin);
              })
              .replace(new RegExp(rebegin + "=(.*?)" + reend, "g"), "_result += ($1);")
              .replace(new RegExp(rebegin + "(.*?)" + reend, "g"), ' $1 ')
              .replace(new RegExp("^" + reend + "(.*)" + rebegin + "$"), '$1') +
              "return _result;" +
              "} } catch(e) { return '' } ";

      return new Function("_context", code);
   };
})(jQuery);

/**
 * @fileoverview jQuery Autocomplete
 * Version 1.2 (13/03/2010)
 * Written by Yehuda Katz (wycats@gmail.com) and Rein Henrichs (reinh@reinh.com)
 * Additional contributions from Emmanuel Gomez, Austin King, 
 * Nikos Dimitrakopoulos, Javier Gonel
 * @requires jQuery v1.2, jQuery dimensions plugin
 *
 * Copyright 2007-2010 Yehuda Katz, Rein Henrichs
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * @description Form autocomplete plugin using preloaded or Ajax JSON data source
 *
 * Simple autocomplete with basic JSON data source
 * <code>$('input#user-name').autocomplete({list: ["quentin", "adam", "admin"]});</code>
 *
 * Simple autocomplete with Ajax loaded JSON data source
 * <code>$('input#user-name').autocomplete({ajax: "/usernames.js"});</code>
 *
 */
(function ($) {
   /** @namespace */
   $.ui = $.ui || {};

   /** @namespace */
   $.ui.autocomplete = $.ui.autocomplete || {};

   /** @namespace */
   $.ui.autocomplete.ext = $.ui.autocomplete.ext || {};

   var active = {};

   var KEY = {
      ESC: 27,
      RETURN: 13,
      TAB: 9,
      BS: 8,
      DEL: 46,
      UP: 38,
      DOWN: 40
   };

   $.fn.autocomplete = function (opt) {

      /* Default options */
      opt = $.extend({}, {
         container: null,
         /**
          * Milliseconds after the last keystroke to (re-)filter the list
          */
         timeout: 300,
         /**
          * How many options are too many?
          * if there are more matches than threshold, the list will not be displayed
          */
         threshold: 100,
         /**
          * By default the with of the input box is used for the autocomplete
          * suggestions. If you want to change that, specify here a width in pixels.
          */
         adjustWidth: true,
         /**
          * Maximum number of items to show. By default show all.
          */
         maxResults: undefined,
         /**
          * Minumum number of characters needed before starting the autocomplete
          * If set to 'undefined', the empty string will be passed to the
          * 'filterList' function. This can be used to display
          * a full list when no characters are introduced.
          */
         minCharacters: 0,
         /**
          * Get the complete list of items
          * override this to control how to get the list of potential matches
          * default is to use the 'list' option passed during initialization
          *  and trigger "updateList" event with list as data
          *
          * @param input the text input being autocompleted
          */
         getList: function (input) {
            input.triggerHandler("updateList", [opt.list]);
         },
         /**
          * Called to determine if a given data item matches the user's input
          *
          * @param {string} item data item being tested for match
          * @param {RegExp} matcher regex to test the item with
          * @return {boolean} true if this data item matches user input
          */
         match: function (item, matcher) {
            // Do not use !==
            return (item.match(matcher) != undefined);
         },
         /**
          * Called to build the matcher
          *
          * @param typed the text entered by user in the text input
          * @return regex used to filter the complete list
          */
         matcher: function (typed) {
            return new RegExp(typed);
         },
         /**
          * Update the list of matching items
          * override this to control how the filtered list is generated from the complete list
          *
          * @param list complete list to be filtered
          * @param val text entered in the text input
          * @return filtered list with items that match _val_ (however matching is defined)
          */
         filterList: function (list, val) {
            var matcher = opt.matcher(val),
                    grepCallback = function (text, i) {
                       return opt.match(text, matcher);
                    },
                    index = 0;

            if (this.maxResults) {
               grepCallback = function (text, i) {
                  if (index > this.maxResults) {
                     return false;
                  }
                  index++;
                  return opt.match(text, matcher);
               };
            }

            return $.grep(list, grepCallback);
         },
         /**
          * Update the list of matching items
          * override this to control how markup is built from the list of matches
          *
          * @param unfilteredList unfiltered list of potential matches
          * @param val the text in the input field
          *
          * @return container (which should be positioned and visible)
          */
         updateList: function (unfilteredList, val) {
            if (!unfilteredList || unfilteredList.length == 0)
               return false;
            if (opt.minCharacters && val.length <= opt.minCharacters)
            {
               return false;
            }

            /*var list = opt.filterList(unfilteredList, val);
             if (list.length === 0 || list.length > opt.threshold) {
             return false;
             }*/
            return opt.buildList(unfilteredList);
         },
         /**
          * Build the list of matches
          * override this to control how markup is built from the list of matches
          * make sure the elements in the list have the matching object
          * in their $.fn.data as "originalObject"
          *
          * @param list list of items matching user input
          * @return container
          */
         buildList: function (list) {
            var listItems = $(list).map(function () {
               var node = $(opt.template(this))[0];
               $.data(node, "originalObject", this);
               return node;
            });
            // IE seems to wrap the wrapper in a random div wrapper so
            // drill down to the node in opt.wrapper.
            var container = $(opt.wrapper).append(listItems);// .parents(":last").children();
            // TODO: need to verify that parents(":last").children really does the below
            var wrapTag = $(opt.wrapper)[0].tagName;
            while (container[0].tagName !== wrapTag) {
               container = container.children(':first');
            }
            //console.log(container);
            return container;
         },
         wrapper: "<ul class='autocomplete dropdown-menu'></ul>",
         /**
          * Display the list of matches
          * override this to control the container position or size
          * or to skip appending the list to the html body
          *
          * @param input the text input being autocompleted
          * @param container the container of the list of matches (typically an ol/ul)
          *
          * @return container (which should be positioned and visible)
          */
         displayList: function (input, container) {
            var offset = input.offset();
            var height = $(document).height() - (offset.top + input.outerHeight());
            container
                    .css({
                       top: offset.top + input.outerHeight(),
                       left: offset.left,
                       width: this.adjustWidth ? input.outerWidth() : undefined

                    })
                    .appendTo("body").show();
            if (offset.top + input.outerHeight() + container.outerHeight() > $(document).height())
            {
               container.css({height: height + "px"});
            }
            else
            {
               container.css({height: ""});
            }
            opt.input = input;
            opt.container = container;
            return container;
         },
         /**
          * Dismiss the list of matches
          * override this to control how the list container is dismissed
          * default is to remove the element
          *
          * @param container the container of the list of matches (typically an ol/ul)
          */
         dismissList: function (container) {
            container.remove();
         },
         template: function (str) {
            return "<li>" + opt.insertText(str) + "</li>";
         },
         /**
          * Provide a value for the text input from the active object,
          * also used to fill the li element in the default _template_ implementation
          *
          * @param item active item in the list
          */
         insertText: function (item) {
            return item;
         },
         /*
          * @description Overrides the default 'getList' option with remote call replacement.
          *
          * @param {Object} opt Should contain a .ajax property with the url of the remote service to call.
          * @returns A function which calls the remote service, fetches the result and triggers an "updateList" event on the input element.
          */
         source: function (input) {
            var source = opt.source;
            //function (input) {
            if (input.val().match(/^\s*$/))
               return false;
            var data = {filter: input.val()};
            //if (opt.data)
            //data = opt.data();
            console.log(data);
            $.getJSON(source, data, function (json) {
               input.trigger("updateList", [json]);
            });
            //};
         },
         templateText: null
      }, opt);



      /*
       * @description Overrides the default 'template' option.
       *
       * @param {Object} opt Should contain a .templateText string with the template to parse and return.
       *    if .templateBegin or .templateEnd are present,
       *    they will determine begin/end tags in template compilation
       * @returns A function that executes the given template with the obj passed to it.
       */
      function templateText() {
         var begin = opt.templateBegin || "<%", end = opt.templateEnd || "%>";
         var template = $.makeTemplate(opt.templateText, begin, end);
         opt.template = function (obj) {
            return template(obj);
         };
      }

      if (opt.source)
      {
         if (typeof opt.source === "string")
         {
            opt.getList = opt.source();
         }
         else if (typeof opt.source === "function")
         {
            opt.getList = opt.source;
         }
      }


      if (opt.templateText)
      {
         templateText(opt);
      }

      /* 
       * Additional options from autocomplete.ext (for example 'ajax', and 'templateText') 
       * if these options where passed in the opt object and the $.ui.autocomplete.ext is present.
       */
      /*if($.ui.autocomplete.ext) {
       for(var ext in $.ui.autocomplete.ext) {
       if(opt[ext]) {
       opt = $.extend(opt, $.ui.autocomplete.ext[ext](opt));
       delete opt[ext];
       }
       } 
       }*/

      function preventTabInAutocompleteMode(e) {
         var k = e.which || e.keycode;
         if ($.data(document.body, "autocompleteMode") && k == KEY.TAB)
         {
            e.preventDefault();
         }
      }

      function startTypingTimeout(e, element)
      {
         if (!$.data(element, "typingTimeout"))
         {
            $.data(element, "typingTimeout", true);
            window.setTimeout(function ()
            {
               if ($.data(element, "typingTimeout"))
               {
                  $.data(element, "typingTimeout", false);
                  $(e.target || e.srcElement).triggerHandler("autocomplete");
               }
            }, opt.timeout);
         }
      }

      function  handleKeyDownUp(e)
      {
         var k = e.which || e.keycode;

         if ((k == KEY.UP || k == KEY.DOWN) && !$.data(this, "typingTimeout"))
         {
            //startTypingTimeout(e, this);
         }
         else if (k == KEY.BS || k == KEY.DEL)
         {
            /*var typingTimeout = $.data(this, "typingTimeout");
             if (typingTimeout)
             {
             window.clearInterval(typingTimeout);
             }*/
            startTypingTimeout(e, this);
         }
         else
         {

            preventTabInAutocompleteMode(e);
         }
      }

      return this.each(function () {
         var self = $(this);
         opt.input = self;
         var oldOffset = opt.input.offset();
         setInterval(function ()
         {
            var offset = opt.input.offset().top;
            if (offset !== oldOffset && opt.container && opt.input)
            {
               oldOffset = offset;
               opt.container.css({
                  top: offset.top + opt.input.outerHeight(),
               })
            }
         }, 100);
         self.attr("autocomplete", "off")
                 //.keydown(handleKeyDownUp)
                 //.keyup(handleKeyDownUp)
                 .keydown(function (e) {
                    var typingTimeout = $.data(this, "typingTimeout");
                    var k = e.keyCode || e.which; // keyCode == 0 in Gecko/FF on keypress
                    if ((k == KEY.UP || k == KEY.DOWN) && !$.data(this, "typingTimeout"))
                    {
                       return;
                    }
                    else if (k == KEY.BS || k == KEY.DEL || k != KEY.RETURN)
                    {
                       if (typingTimeout)
                       {
                          $.data(this, "typingTimeout", false);
                          //window.clearInterval(typingTimeout);
                       }
                       startTypingTimeout(e, this);
                    }
                    else
                    {
                       preventTabInAutocompleteMode(e);
                    }

                    if ($.data(document.body, "suppressKey"))
                    {
                       $.data(document.body, "suppressKey", false);
                    }

                 })
                 .bind("autocomplete", function ()
                 {
                    self.one("updateList", function (e, completeList, matchVal) {
                       var container = opt.updateList(completeList, matchVal || self.val());
                       // turn off autcomplete mode even if the list is empty (container === false)
                       $("body").triggerHandler("off.autocomplete");
                       if (container === false)
                       {
                          return false;
                       }

                       opt.container = opt.displayList(self, container);
                       $("body").autocompleteMode(opt.container, self, container.find("li").length, opt);
                    });

                    opt.getList(self);
                 });

         if (typeof opt.init == "function") {
            opt.init(self);
         }
      });
   };

   $.fn.autocompleteMode = function (container, input, size, opt) {
      var original = input.val(),
              selected = -1,
              mouseDown = false;

      $.data(document.body, "autocompleteMode", true);

      $("body").one("cancel.autocomplete", function () {
         input.triggerHandler("cancelled.autocomplete");
         $("body").triggerHandler("off.autocomplete");
         input.val(original);
      });

      $("body").bind("activate.autocomplete", function (e) {

         //console.log('activate');
         // Try hitting return to activate autocomplete and then hitting it again on blank input
         // to close it.  w/o checking the active object first this input.triggerHandler() will barf.
         if (active.length) {
            // if activate and selected -> clicked!
            input.triggerHandler("activated.autocomplete", [$.data(active[0], "originalObject"), active]);
         }
         // if nothing active when activate event and we had a mousedown event before
         // then the user is dragging something in the list. Ignore action.
         else if (mouseDown) {
            mouseDown = false;
            if (document.activeElement && document.activeElement != input)
               input.trigger("focus");
            return false;
         }
         $("body").triggerHandler("off.autocomplete");
      });

      $("body").one("off.autocomplete", function (e, reset) {
         //alert('f');
         $.data(input, "typingTimeout", false);
         opt.dismissList(container);

         $.data(document.body, "autocompleteMode", false);
         input.unbind("keydown.autocomplete");
         $("body").add(window)
                 .unbind("click.autocomplete")
                 .unbind("cancel.autocomplete")
                 .unbind("activate.autocomplete");
      });

      // If a click bubbles all the way up to the window, close the autocomplete
      $(window).bind("click.autocomplete", function () {
         $("body").triggerHandler("cancel.autocomplete");
      });

      var select = function () {
         active = container.find("li")
                 .removeClass("active")
                 .filter(":visible")
                 .slice(selected, selected + 1)
                 .addClass("active");

         if (active.length)
         {
            //console.log(active.position().top + " " + container.outerHeight());
            var containerHeight = container.outerHeight();
            var activeTop = active.position().top;
            var activePos = activeTop + active.outerHeight();
            if (activePos > containerHeight)
            {
               container.stop().animate({
                  scrollTop: "+=" + (activePos - containerHeight)
               }, 120);
            }
            else if (activeTop < 0)
            {
               container.stop().animate({
                  scrollTop: "-=" + Math.abs(activeTop)
               }, 120);
            }
            input.triggerHandler("itemSelected.autocomplete", [$.data(active[0], "originalObject"), active]);
            input.val(opt.insertText($.data(active[0], "originalObject"))).change();
         }
         else
         {
            input.triggerHandler("noneSelected.autocomplete");
            input.val(original);
         }
      };

      container.mouseover(function (e) {
         // If you hover over the container, but not its children, return
         /* if (e.target == container[0]) {
          return;
          }
          var selectedItem = $(e.target).is('li') ? $(e.target)[0] : $(e.target).parents('li')[0];
          // Set the selected item to the item hovered over and make it active
          selected = container.find("li").index(selectedItem);
          select();*/
      })
              // IE8 was triggering spurious activate events when clicking outside
              // the container when a list item was active. I couldn't figure out where
              // the activate events were coming from, so I'm deactivating the list
              .mouseout(function (e) {
                 // selected = -1;
                 //select();
              }).mousedown(function () {
         mouseDown = true;
         //console.log('mousedown');
      }).bind("click.autocomplete", function (e) {
         e.preventDefault();
         if (e.target == container[0]) {
            return;
         }
         var selectedItem = $(e.target).is('li') ? $(e.target)[0] : $(e.target).parents('li')[0];
         // Set the selected item to the item hovered over and make it active
         selected = container.find("li").index(selectedItem);
         select();
         $("body").triggerHandler("activate.autocomplete");
         $.data(document.body, "suppressKey", false);
      });

      input.bind("keydown.autocomplete", function (e) {
         var k = e.which || e.keyCode; // in IE e.which is undefined

         switch (k) {
            case KEY.ESC:
               $("body").triggerHandler("cancel.autocomplete");
               break;
               // TAB & Return behave in the same way.
            case KEY.TAB:
            case KEY.RETURN:
               if (selected == -1) {
                  // If nothing is selected, select the first
                  selected = selected >= size - 1 ? 0 : selected + 1;
                  select();
               }
               $("body").triggerHandler("activate.autocomplete");
               break;
            case KEY.DOWN:
               selected = selected >= size - 1 ? 0 : selected + 1;
               select();
               break;
            case KEY.UP:
               selected = selected <= 0 ? size - 1 : selected - 1;
               select();
               break;
            default:
               return true;
         }

         $.data(document.body, "suppressKey", true);
      });
   };

})(jQuery);
