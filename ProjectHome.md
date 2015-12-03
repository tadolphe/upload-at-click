# Description #
Javascript for upload file at one click.

## Features: ##
  * Select file and upload at one click
  * Without external dependents (such as jQuery...)
  * No Flash
  * Small size
  * Cross-browser
<br>
If you use jQuery try <a href='http://code.google.com/p/ocupload'>ocupload</a>.<br>
<br>
<br></li></ul>

<h1>Demo</h1>
May be you want to look <a href='http://upload-at-click.narod.ru/demo.html'>the demo</a>

<br>
<br>


<h1>How to use</h1>
<h2>Developer. 4 steps:</h2>

1. Add link to script:<br>
<pre><code>   &lt;script type="text/javascript" src="/path_to/upclick-min.js"&gt;&lt;/script&gt;<br>
</code></pre>

2. Create element:<br>
<pre><code>   &lt;input type="button" id="uploader" value="Upload"&gt;<br>
</code></pre>

3. Call <b>upclick()</b> function:<br>
<pre><code>   &lt;script type="text/javascript"&gt;<br>
<br>
   var uploader = document.getElementById('uploader');<br>
<br>
   upclick(<br>
     {<br>
      element: uploader,<br>
      action: '/path_to/you_server_script.php', <br>
      onstart:<br>
        function(filename)<br>
        {<br>
          alert('Start upload: '+filename);<br>
        },<br>
      oncomplete:<br>
        function(response_data) <br>
        {<br>
          alert(response_data);<br>
        }<br>
     });<br>
<br>
   &lt;/script&gt;<br>
</code></pre>

<br>

4. Write server-side script.<br>
<i>Uploaded data have name <b>Filedata</b>.</i><br>
<h3>Server-side script example 1</h3>
<pre><code>&lt;?php<br>
$tmp_file_name = $_FILES['Filedata']['tmp_name'];<br>
move_uploaded_file($tmp_file_name, '/path_to/new_filename');<br>
</code></pre>
<h3>Server-side script example 2</h3>
<pre><code>&lt;?php<br>
$tmp_file_name = $_FILES['Filedata']['tmp_name'];<br>
$ok = move_uploaded_file($tmp_file_name, '/path_to/new_filename');<br>
<br>
// This message will be passed to 'oncomplete' function<br>
echo $ok ? "OK" : "FAIL";<br>
</code></pre>

<br>

<h1>Parameters</h1>
All parameters stored in one object.<br>
<br>
Possible keys:<br>
<br>
<table><thead><th> <b>Name</b> </th><th> <b>Type</b> </th><th> <b>Description</b> </th><th> <b>Default</b> </th></thead><tbody>
<tr><td> element     </td><td> object|string </td><td> DOM element or element id </td><td>                </td></tr>
<tr><td> action      </td><td> string      </td><td> Server script who receive file </td><td>                </td></tr>
<tr><td> action_params </td><td> object      </td><td> Server script parameters.<br>Example:<br>{name: 'Amadeus', family: 'Mozart'}</td><td> {}             </td></tr>
<tr><td> dataname    </td><td> string      </td><td> File data name     </td><td> 'Filedata'     </td></tr>
<tr><td> maxsize     </td><td> integer     </td><td> Maximum file size. In Bytes. 0 - unlimited (work in IE only) </td><td> 0              </td></tr>
<tr><td> target      </td><td> string      </td><td> Target window name for response. Like a <code>_blank</code>, <code>_self</code>, <code>_top</code> or some frame name </td><td>                </td></tr>
<tr><td> zindex      </td><td> integer|'auto' </td><td> z-index style property of listener </td><td> 'auto'         </td></tr>
<tr><td> onstart     </td><td> function    </td><td> Callback function<br>Emited on start upload.<br>onstart(filename)</td><td> null           </td></tr>
<tr><td> oncomplete  </td><td> function    </td><td> Callback function<br>Emited when file successfully uploaded<br>oncomplete(server_response_data)</td><td> null           </td></tr></tbody></table>


<br>


<h1>Tested with browsers:</h1>
<ul><li>IE 6.0<br>
</li><li>FireFox 3.6<br>
</li><li>Chrome 6.0<br>
</li><li>Opera 10.63<br>
<br></li></ul>


<a href='http://kopilka.flypay.ru/?sid=12075"'><img src='http://kopilka.flypay.ru/i/coinbox/12075/img.jpg' /></a>