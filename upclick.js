/*
 * upclick(params)
 *
 *  parameters:
 *      element:        DOM object
 *      action:         Server script who receive file
 *      action_params:  Server script parameters. Array: key=value
 *      maxsize:        Maximum file size (in Bytes). 0 - unlimited
 *      onstart:        Callback function
 *                        onstart(filename).
 *                        Emited when file started upload
 *      oncomplete:      Callback function
 *                        oncomplete(server_response_data).
 *                        Emited when file successfully onloaded
 */
function upclick(params)
{
    // Parse params
    var defaults =
        {
            element: null,
            action: 'about:blank',
            action_params: {},
            maxsize: 0,
            onstart: null,
            oncomplete: null
        };

    for(var key in defaults)
    {
        params[key] = params[key] ? params[key] : defaults[key];
    }


    var element = params['element'];
    var doc = element.ownerDocument;
    var input;

    // div
    var container = doc.createElement("div");

    // frame -> div
    var frame_name = 'frame' + new Date().getTime().toString().substr(8);

    // IE require such create method
    container.innerHTML =
        '<iframe name="'+frame_name+'" src="about:blank" onload="this.onload_callback()"></iframe>';
    var frame = container.childNodes[0];

    // Callback for 'onload' event. Fired when form submited and data retrived
    frame.onload_callback =
        function()
        {
            // Phase 1. First 'onload' when element created
            // form -> div
            var form = doc.createElement('form');
            container.appendChild(form);
            form.method = 'post';
            form.enctype = 'multipart/form-data';
            form.encoding = 'multipart/form-data';
            form.target = frame_name;
            form.setAttribute('target', frame_name);
            form.action = params['action'];
            form.setAttribute('action', params['action']);
            form.style.margin = 0;
            form.style.padding = 0;

            // append params in form
            var action_params = params['action_params'];
            for(var key in action_params)
            {
                var hidden = doc.createElement("input");
                hidden.type = "hidden";
                hidden.name = key;
                hidden.value = String(action_params[key]);
                form.appendChild(hidden);
            }

            // MAX_FILESIZE. Maximum file size
            if (params['maxsize'])
            {
                var input_ms = doc.createElement('input');
                input_ms.type = 'hidden';
                input_ms.name = 'MAX_FILE_SIZE';
                input_ms.value = String(params['maxsize']);
                form.appendChild(input_ms);
            }

            // input -> form
            input = doc.createElement("input");
            input.name='Filedata';
            input.type='file';
            input.size='1';
            form.appendChild(input);

            // input style
            input.style.position = 'absolute';
            input.style.display = 'block';
            input.style.top = 0;
            input.style.left = 0;
            input.style.height = '80px';
            input.style.width = '80px';
            input.style.opacity = 0;
            input.style.filter = 'alpha(opacity=0)';
            input.style.fontSize = 8;
            input.style.zIndex = 1;
            input.style.visiblity = 'hidden';

            // 'change' event handler. Submit form
            var onchange_callback =
                function(e)
                {
                    // empty filename check
                    if (!input.value)
                        return;

                    // Run onstart callback. When upload started
                    var onstart = params['onstart'];
                    if (onstart)
                        onstart(input.value);

                    form.submit();
                };

            // bind 'change' callback
            // DOM2: FF, Opera, Chrome
            if (input.addEventListener)
                input.addEventListener ('change', onchange_callback, false);
            // IE 5+
            else if (input.attachEvent)
            {
                input.attachEvent(
                    'onpropertychange',
                    function(e)
                    {
                        // Get event details for IE
                        if (!e)
                            e = window.event;

                        if (e.propertyName == 'value')
                            onchange_callback();
                    }
                    );
            }
            // IE 4
            else
                input.onpropertychange = onchange_callback;

            // Phase 2. Next 'onload' when data received from server
            frame.onload_callback =
                function()
                {
                    var ifwin = null;

                    // Get frame window
                    // IE5.5+, Mozilla, NN7
                    if (frame.contentWindow)
                        ifwin = frame.contentWindow;
                    // NN6, Konqueror
                    else if (iframe.contentDocument)
                        ifwin = frame.contentDocument.defaultView;
                    // IE5
                    else if (frame.document)
                    {
                        var frame2 = window.frames[iframe.name];
                        win = frame2.document.parentWindow;
                    }

                    // Run 'oncomplete' callback
                    var data = ifwin.document.body.innerHTML;
                    var oncomplete = params['oncomplete'];
                    if (oncomplete)
                        oncomplete(data);

                    // Clear filename
                    form.reset();
                }

            // Get input container position helper
            input.findPos =
                function()
                {
                    var curleft = 0;
                    var curtop = 0;
                    var obj = this.parentNode;

                    if (obj.offsetParent)
                    {
                        curleft = obj.offsetLeft;
                        curtop = obj.offsetTop;

                        while (obj = obj.offsetParent)
                        {
                            curleft += obj.offsetLeft;
                            curtop += obj.offsetTop;
                        }
                    }
                    return [curleft, curtop];
                }
        };

    frame.style.display = 'none';
    frame.width = 0;
    frame.height = 0;
    frame.marginHeight = 0;
    frame.marginWidth = 0;

    // container -> DOM
    element.parentNode.insertBefore(container, element);

    // container style
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.padding = 0;
    container.style.visiblity = 'hidden';

    // margin
    // IE
    if (element.currentStyle && !doc.defaultView)
    {
        // Put in event queue. Wait for element to have width and height
        window.setTimeout(
            function()
            {
                var style = element.currentStyle;
                container.style.marginTop = style.marginTop;
                container.style.marginRight = style.marginRight;
                container.style.marginBottom = style.marginBottom;
                container.style.marginLeft = style.marginLeft;
                container.style.width = element.offsetWidth;
                container.style.height = element.offsetHeight;
                /*
                container.style.height =
                    element.offsetHeight +
                    parseInt(style.borderTopWidth) +
                    parseInt(style.borderBottomWidth) +
                    'px';
                container.style.width =
                    element.offsetWidth +
                    parseInt(style.borderLeftWidth) +
                    parseInt(style.borderRightWidth) +
                    'px';
                */
            }, 0);
    }
    // Opera, FF, Chrome
    else
    {
        var style = doc.defaultView.getComputedStyle(element, '');
        container.style.marginTop = style.getPropertyValue('margin-top');
        container.style.marginRight = style.getPropertyValue('margin-right');
        container.style.marginBottom = style.getPropertyValue('margin-bottom');
        container.style.marginLeft = style.getPropertyValue('margin-left');
        container.style.height =
            element.offsetHeight +
            parseInt(style.getPropertyValue('border-top-width')) +
            parseInt(style.getPropertyValue('border-bottom-width')) +
            'px';
        container.style.width =
            element.offsetWidth +
            parseInt(style.getPropertyValue('border-left-width')) +
            parseInt(style.getPropertyValue('border-right-width')) +
            'px';
    }
    element.style.margin = 0;

    // element -> div
    // clone element and remove original
    var element2 = element.cloneNode(true);
    container.appendChild(element2);
    element.parentNode.removeChild(element);
    element = element2;

    // Move the input with the mouse to make sure it get clicked!
    var onmousemove_callback =
        function(e)
        {
            var coords = input.findPos();
            var x = coords[0];
            var y = coords[1];

            // Get event details for IE
            var scrOfX = 0, scrOfY = 0;
            if (!e)
                e = window.event;

            // Get scroll position
            if( typeof( window.pageYOffset ) == 'number' )
            {
                //Netscape compliant
                scrOfY = window.pageYOffset;
                scrOfX = window.pageXOffset;
            }
            else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) )
            {
                //DOM compliant
                scrOfY = document.body.scrollTop;
                scrOfX = document.body.scrollLeft;
            }
            else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) )
            {
                //IE6 standards compliant mode
                scrOfY = document.documentElement.scrollTop;
                scrOfX = document.documentElement.scrollLeft;
            }

            input.style.left = scrOfX + e.clientX - x - 60 + 'px';
            input.style.top = scrOfY + e.clientY - y - 40 + 'px';
        };

    // bind mousemove callback (for place button under cursor)
    // DOM2: FF, Chrome, Opera
    if (container.addEventListener)
        container.addEventListener('mousemove', onmousemove_callback, false);
     // IE 5+
    else if (container.attachEvent)
        container.attachEvent("onmousemove", onmousemove_callback);
    // IE 4
    else
        container.onmousemove = onmousemove_callback;
}
