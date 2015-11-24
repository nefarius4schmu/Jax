JAX
-------

[1]: <https://github.com/nefarius4schmu/Jax/>

_Shortcut framework for jQuery's ajax function_

### Getting Started

Include all necessary .js-files inside the head-tag of the page.

```html
<head>
	<!-- jQuery Library -->
    <script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
    <!-- Jax Plugin -->
    <script src="jquery.jax.js"></script>
</head>
```

### Usage

Perform shortcut ajax calls using `data-jax` attribute or  use the jQuery plugin `$(element).jax()` to initialize an ajax call on the element.

Directly on HTML-Element:

```html
<div data-jax="load" data-url="model/example.htm"></div>
```

Or using JavaScript:

```html
<div id="target"></div>
<script>
$('#target').jax({
    url: 'model/example.htm'
});
</script>
```

### Callback

Make use of loaded content using a callback function.

HTML:
```html
<div 
	data-jax="call" 
	data-url="model/example.htm" 
	data-callback="onContentLoad"
></div>
```
JavaScript:
```javascript
$('#target').jax({
    url: 'model/example.htm',
    callback: onContentLoad
});
```
Callback function:
```javascript
window.onContentLoad = function(response){
	if(response.success && response.content.valid){
		$(this).html(response.content.value);
	}else{
		$(this).html('Error');
	}
};
```

The callback function is fired **always** after an ajax call has been finished or failed.  Therefore it's useful to give users some more feedback about errors or to manipulate the loaded content.

#### Response

The parameter `response` sent by the callback function contains information about the loaded content and success or failure of the performed ajax call. `this` is set to the target DOM element.

Property | Type | Description
-------- |:---- |:-----------
success | boolean | Indicates whether ajax-call successed or failed
content | object | Content-Object
content.valid | boolean | Indicates whether loaded content could be successfully parsed or not
content.value | * | Parsed content
content.raw | string | Raw message from ajax call
data | object | Sended data from ajax call
message | string | Contains thrown error message if ajax call failed

### Modes

Modes are used to change the behavior of an ajax call.

Example #1 - Append
```html
<!-- directly append loaded content -->
<ul data-jax="append" data-url="model/item.htm">
    <li>first</li>
</ul>
```
Example #2 - Lazy Load
```javascript
// load content only if element is in viewport
$('#target').jax({
	jax: 'lazy',
    url: 'model/example.htm',
	set: true
});
```

Change mode using data-jax attribute or using jax- or mode-properity.

Mode | Description
---- |:----------
call | Perform basic ajax call.
load | Set loaded content directly to target element using jQuery's `.html()` function. **default**
append | Append loaded content using jQuery's `.append()` function
prepend | Prepend loaded content using jQuery's `.prepend()` function
replace | Append loaded content using jQuery's `.replaceWith()` function
lazy | Perform ajax call when matching element is in viewport
event | Perform ajax call after custom event has been fired on target element. _Requires event name using `data-event` attribute or `event` property._
click | Predefined event. Perform ajax call after 'click' event has been fired on target element
bs.tab | Predefined event. Based on Bootstrap tabs. Perform ajax call after 'shown.bs.tab' event has been fired on matching tab or parent element is active.
bs.tab.lazy | Predefined event. Combination of 'lazy' and 'bs.tab' modes.

### Parser

Use `data-parse` attribute or `parse` property to enable use of specialized parser for different types of contents.

Parser | Value | Valid | Description
------ | ----- | ------- |:-----------
bool | boolean | `0,1,true,false` | Parse boolean keywords. Modify `parseBoolValid` and `parseBoolTrue` property to change its behavior
int | number (integer) | 0-9 | Parse integers using build in `parseInt()` function
float | number (float) | 123.456789 | Parse floats using build in `parseFloat()` function
html | string | * | Pass-through parser. **default**
json | object | {"foo":"bar"} | Parse JSON object using jQuery's `$.parseJSON()` function

#### Custom Parser

Use `parse` property to customize parser.

JavaScript only:
```javascript
$('#target').jax({
    url: 'model/hello.htm',
	parse: function(msg){
		return msg+' world';
	}
});
```

_Note: Validates to `false` if return value is `undefined`_

#### Dependencies

jQuery 1.7

#### License

Copyright (c) 2015 Steffen Lange

Licensed under the MIT license.


> Written with [StackEdit](https://stackedit.io/).