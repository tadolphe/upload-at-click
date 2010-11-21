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
                    else if (frame.contentDocument)
                        ifwin = frame.contentDocument.defaultView;

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
                    var obj = element.parentNode;

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

    // frame style
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
    //container.style.float = element.style.float ? element.style.float : 'none';

    // margin
    // IE
    if (element.currentStyle && !doc.defaultView)
    {
        var style = element.currentStyle;
        container.style.marginTop = style.marginTop;
        container.style.marginRight = style.marginRight;
        container.style.marginBottom = style.marginBottom;
        container.style.marginLeft = style.marginLeft;

        // Detect element size
        var w, h;
        w = (style.width != 'auto') ? style.width : element.offsetWidth;
        h = (style.height != 'auto') ? style.height : element.offsetHeight;
        w = (w) ? w : 'auto';
        h = (h) ? h : 'auto';
        container.style.width = w;
        container.style.height = h;
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
    element.parentNode.removeChild(element);
    container.appendChild(element);

    // Move the input with the mouse to make sure it get clicked!
    var onmousemove_callback =
        function(e)
        {
            var coords = input.findPos();
            var x = coords[0];
            var y = coords[1];

            // Get event details for IE
            if (!e)
                e = window.event;

            if (e.pageX)
            {
                input.style.left = e.pageX - x - 60 + 'px';
                input.style.top = e.pageY - y - 40 + 'px';
            }
            else
            {
                input.style.left = e.x - 60 + 'px';
                input.style.top = e.y - 40 + 'px';
            }
        };

    // bind mousemove callback (for place button under cursor)
    // DOM2: FF, Chrome, Opera
    if (container.addEventListener)
        container.addEventListener('mousemove', onmousemove_callback, false);
     // IE 5+
    else if (container.attachEvent)
        container.attachEvent("onmousemove", onmousemove_callback);
}
