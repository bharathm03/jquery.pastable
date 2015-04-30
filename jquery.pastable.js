/*The MIT License (MIT)
Copyright (c) 2012-2013 Bharath M
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, 
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

(function ($) {
    $.fn.pastable = function (model) {
    // Function to trigger custom events of plug-in
        var triggerEvent = function (name, args) {
            model = model || {};
            if (model[name] != null) {
                var fn = model[name];
                fn.call(this, args);
            }
        };
        // Function attach current object to delegate
        var fnDelegate = function (fn, object) {
            return function () { return fn.call(object, null); }
        }

        // This parse the html to Json object with assemption that first row is header 
        function parseHtml(table) {
            var tr = table.find("tr"), headerTds = [], data = [];
            var hTd = tr.first().children("td, th");

            for (var i = 0; i < hTd.length; i++)
                headerTds.push(hTd.eq(i).text());

            for (var i = 1; i < tr.length; i++) {
                var json = {}, td = tr.eq(i).find("td, th");
                for (var j = 0; j < td.length; j++) {
                    json[headerTds[j]] = td.eq(j).text();
                }
                data.push(json);
            }
            return data;
        }

        this.processPaste = function () {
            if (this.html() == "") {
                setTimeout(fnDelegate(this.processPaste, this), 20);
                return;
            }
            var child = this.children(":first");
            var data = null;

            if (model.DontTryParse || child.length == 0 || child[0].tagName.toLowerCase() != "table")
                data = this.html();
            else
                data = parseHtml(child);

            if (!model.KeepDataOnPasteComplete)
                this.html("");

            triggerEvent.call(this, "OnPasteComplete", data);
        }
        // This will work only on Div element.
        if (!this.is("div"))
            throw "Div element is required";

        // Converting DIV to editable so that pasting is possible.
        this.attr("contenteditable", true);

        // Binding paste event to element to access the pasted data.
        this.bind("paste", fnDelegate(function () {
            var self = this.html("");
            triggerEvent.call(this, "OnPasting", null);
            setTimeout(fnDelegate(this.processPaste, this), 20);
        }, this));

        return this;
    };
})(jQuery);