Persian Support For OctoberCms
=============
This plugin add Persian support to OctoberCMS
## How to use this plugin
just install it, and it and change backend language to persian.

use ```flipCss``` filter in theme to flipping css in the frontend, for example:
```html
<link href="{{['assets/css/bootstrap.min.css','assets/css/style.css']|flipCss|theme}}" rel="stylesheet">
<link rel="stylesheet" type="text/css" id="color" href="{{'assets/css/colors/default.css'|flipCss}}"/>
```
```flipCss``` must be used before the ```theme``` filter.

use ```pDate``` filter in theme for convert date to Jalali :
```html
{{'2016/12/31'|pDate}}
or
{{'2016/12/31'|pDate('y M D')}}
```


by Sajjad Servatjoo & Saman Sorushniya
