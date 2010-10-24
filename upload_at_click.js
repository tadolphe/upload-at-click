upload_at_click_listen_frames = new Array();

function upload_at_click(element, action, params, oncomplete, doc)
{
    if (typeof doc === 'undefined')
    {
       doc = document;
    }

    var ie = upload_at_click_ie_version();

    // div
    var container = doc.createElement("div");
    element.parentNode.insertBefore(container, element);

    // element -> div
    var element2 = element.cloneNode(true);
    container.appendChild(element2);
    element.parentNode.removeChild(element);
    element = element2;

    // frame -> div
    var frame;
    var frame_name = 'frame' + new Date().getTime().toString().substr(8);
    frame_cont = doc.createElement('span');
    container.appendChild(frame_cont);
    frame_cont.style.display = 'none';
    frame_cont.width = 0;
    frame_cont.height = 0;
    // IE require such create method
    frame_cont.innerHTML =
        '<iframe name="'+frame_name+'" id="'+frame_name+'" src="about:blank"></iframe>';
    frame = doc.getElementById(frame_name);
    frame.style.display = 'none';
    frame.width = 0;
    frame.height = 0;
    frame.marginHeight = 0;
    frame.marginWidth = 0;

    // Callback for 'onload' event. Fired when form submited and data retrived
    frame_onload_callback =
        function()
        {
            var ifwin = upload_at_click_get_window_handle(frame);
            var data = ifwin.document.body.innerHTML;
            oncomplete(data);
        };

    // add frame to listen
    upload_at_click_listen_frames = upload_at_click_listen_frames.concat(new Array(frame));

    // 'onload' event on window frame
    var ifwin = upload_at_click_get_window_handle(frame);

    // prevent faulstart (document.body rewrite)
    ifwin.document.write('UPLOAD-AT-CLICK');

    // bind 'onload' event callback
    // DOM2: FF, Opera, Chrome
    if (typeof frame.addEventListener !== 'undefined')
    {
        frame.addEventListener ('load', frame_onload_callback, false);
    }
    // IE 5+
    else if (ie >= 5.5 &&
             typeof frame.attachEvent !== 'undefined')
    {
        frame.attachEvent('onload', frame_onload_callback);
    }
    // IE 5.0
    else if (ie >= 5.0)
    {
        frame.setAttribute('upload_at_click_callback', frame_onload_callback);
        setTimeout('upload_at_click_timer("'+frame_name+'")', 500);
    }
    // IE 4
    else
    {
        frame.onload = frame_onload_callback;
    }

    // form -> div
    // IE
    if (ie != -1)
    {
        form = doc.createElement(
            '<form method="post" enctype="multipart/form-data">');
    }
    // Opera, FF, Chrome
    else
    {
        form = doc.createElement('form');
        form.method = 'post';
        form.enctype = 'multipart/form-data';
    }
    form.target = frame_name;
    form.action = action;
    container.appendChild(form);

    // form style
    form.style.margin = 0;
    form.style.padding = 0;

    // append params in form
    for(var key in params)
    {
        var hidden = doc.createElement("input");
        hidden.type = "hidden";
        hidden.name = key;
        hidden.value = params[key];
        form.appendChild(hidden);
    }

    // input -> form
    var input;
    // IE
    if (ie != -1)
    {
        input = doc.createElement('<input type="file" name="Filedata">');
    }
    // Opera, FF, Chrome
    else
    {
        input = doc.createElement("input");
        input.name='Filedata';
        input.type='file';
    }
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

    // container style
    container.className = element.className;
    element.className = '';
    container.style.position = 'relative';
    container.style.height = element.offsetHeight+'px';
    container.style.width = element.offsetWidth+'px';
    container.style.overflow = 'hidden';
    // IE
    if (typeof element.currentStyle !== 'undefined')
    {
        var style = element.currentStyle;
        container.style.marginTop = style.marginTop;
        container.style.marginRight = style.marginRight;
        container.style.marginBottom = style.marginBottom;
        container.style.marginLeft = style.marginLeft;
    }
    // Opera, FF, Chrome
    else
    {
        var style = doc.defaultView.getComputedStyle(element, '');
        container.style.marginTop = style.getPropertyValue('margin-top');
        container.style.marginRight = style.getPropertyValue('margin-right');
        container.style.marginBottom = style.getPropertyValue('margin-bottom');
        container.style.marginLeft = style.getPropertyValue('margin-left');
    }
    container.style.padding = 0;
    container.style.visiblity = 'hidden';

    // Move the input with the mouse to make sure it get clicked!
    var onmousemove_callback =
        function(e)
        {
            var coords = upload_at_click_find_pos(container);
            var x = coords[0];
            var y = coords[1];

            // Get event details for IE
            if (!e)
                e = window.event;

            input.style.left = e.clientX - x - 60 + 'px';
            input.style.top = e.clientY - y - 40 + 'px';
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

    // 'change' event handler. Submit form
    var change_callback =
        function(e)
        {
            // empty filename check
            if (!input.value)
            {
                return;
            }

            // Get event details for IE
            if (typeof e === 'undefined')
                e = window.event;

            // IE
            if (typeof document.addEventListener === 'undefined')
            {
                if (e.propertyName == 'value')
                {
                    form.submit();
                }
            }
            // Opera, FF, Chrome
            else
                form.submit();
        };

    // bind 'change' callback
    // DOM2: FF, Opera, Chrome
    if (input.addEventListener)
        input.addEventListener ('change', change_callback, false);
    // IE 5+
    else if (input.attachEvent)
        input.attachEvent('onpropertychange', change_callback);
    // IE 4
    else
        input.onpropertychange = change_callback;
}


function upload_at_click_find_pos(obj)
{
    var curleft = 0;
    var curtop = 0;

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
    return [curleft,curtop];
}


function upload_at_click_get_window_handle(iframe)
{
    var win = null;

    // IE5.5+, Mozilla, NN7
    if (typeof iframe.contentWindow !== 'undefined')
    {
        win = iframe.contentWindow;
    }

    // NN6, Konqueror
    else if (typeof iframe.contentDocument !== 'undefined')
    {
        win = iframe.contentDocument.defaultView;
    }

    // IE5
    else if (typeof iframe.document !== 'undefined')
    {
        var iframe2 = window.frames[iframe.name];
        win = iframe2.document.parentWindow;
    }

    return win;
}


function upload_at_click_timer()
{
    for(var i=0; i<upload_at_click_listen_frames.length; i++)
    {
        var frame = upload_at_click_listen_frames[i];
        var frame_name = frame.name;
        var ifwin = upload_at_click_get_window_handle(frame);

        if (ifwin.document.readyState == 'complete')
        {
            if (typeof ifwin.document.body !== 'undefined')
            {
                // Emulate onLoad. Prevent second fire
                var fired = ifwin.document.body.getAttribute('upload_at_click_onload_fired');

                if (fired != '1')
                {
                    // disable second call
                    ifwin.document.body.setAttribute('upload_at_click_onload_fired', '1');

                    // run callback
                    var callback = frame.upload_at_click_callback;
                    callback();
                }
            }
        }
    }

    setTimeout('upload_at_click_timer()', 500);
}


/*
 * Returns the version of Internet Explorer or a -1
 * (indicating the use of another browser).
 * http://msdn.microsoft.com/en-us/library/ms537509(VS.85).aspx
 */
function upload_at_click_ie_version()
{
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
        var ua = navigator.userAgent;
        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat( RegExp.$1 );
    }
    return rv;
}
