<?php namespace OctoberFa\Persian\Classes;

use File;
use Cms\Classes\Theme;

/**
 * CssFlipper - PHP CSS Flipper for supporting RTL designs
 * 
 * --
 * Copyright (c) 2017 Ahmed S. El-Afifi <ahmed.s.elafifi@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * --
 * 
 * @package     CssFlipper
 * @link        https://github.com/ahmedsalah94/CssFlipper
 * @author      Ahmed S. El-Afifi <ahmed.s.elafifi@gmail.com>
 * @copyright   2017 Ahmed S. El-Afifi <ahmed.s.elafifi@gmail.com>
 * @license     http://opensource.org/licenses/mit-license.php MIT License
 * @version     1.0.0
 */
class CssFlipper
{
    private $css;
    public function __construct($css) {
        $this->css = $css;
    }
    public function flipBackgroundPosition($value) {
        $reLeft = "/\bleft\b/";
        $reRight = "/\bright\b/";
        if (preg_match($reLeft, $value)) {
            $value = preg_replace($reLeft, 'right', $value);
        } elseif (preg_match($reRight, $value)) {
            $value = preg_replace($reRight, 'left', $value);
        }
        $elements = preg_split("/\s+/", $value);
        if (!$elements) {
            return $value;
        }
        $flipPercentage = function($value) {
            $rePct = "/^[+-]?\d*(?:\.\d+)?(?:[Ee][+-]?\d+)?%/";
            if (preg_match($rePct, $value)) {
                return (100 - floatval($value)) . '%';
            }
            return $value;
        };
        if (count($elements) == 1) {
            $value = $flipPercentage($elements[0]);
        } elseif (count($elements) == 2) {
            $value = $flipPercentage($elements[0]) . ' ' . $elements[1];
        }
        return $value;
    }
    public function flipBorderRadius($value) {
        $elements = preg_split("/\s*\/\s*/", $value);
        if (!$elements) {
            return $value;
        }
        $flipCorners = function($value) {
            $elements = preg_split("/\s+/", $value);
            if (!$elements) {
                return $value;
            }
            switch (count($elements)) {
                // 5px 10px 15px 20px => 10px 5px 20px 15px
                case 4:
                    return implode(' ', [$elements[1], $elements[0], $elements[3], $elements[2]]);
                // 5px 10px 20px => 10px 5px 10px 20px
                case 3:
                    return implode(' ', [$elements[1], $elements[0], $elements[1], $elements[2]]);
                // 5px 10px => 10px 5px
                case 2:
                    return implode(' ', [$elements[1], $elements[0]]);
            }
            return $value;
        };
        switch (count($elements)) {
            // 1px 2px 3px 4px => 2px 1px 4px 3px
            case 1:
                return $flipCorners($elements[0]);
            // 1px / 2px 3px => 1px / 3px 2px
            // 1px 2px / 3px 4px => 2px 1px / 4px 3px
            // etc...
            case 2:
                return $flipCorners($elements[0]) . ' / ' . $flipCorners($elements[1]);
        }
        return $value;
    }
    public function flipBoxShadow($value) {
        $value = preg_replace_callback("/\([^)]*\)/", function($match) {
            return preg_replace("/,/", "_C_", $match[0]);
        }, $value);
        $value = preg_split("/\s*,\s*/", $value);
        $value = array_map(function($item) {
            $elements = preg_split("/\s+/", $item);
            if (!$elements) {
                return $item;
            }
            $inset = ($elements[0] == 'inset') ? array_shift($elements) . ' ' : '';
            preg_match("/^([-+]?\d+)(\w*)$/", $elements[0], $property);
            if (!$property) {
                return $item;
            }
            return $inset . implode(' ', array_merge(
                [(-1 * $property[1]) . $property[2]],
                array_splice($elements, 1)
            ));
        }, $value);
        $value = implode(", ", $value);
        $value = preg_replace("/_C_/", ',', $value);
        return $value;
    }
    public function flipDirection($value) {
        return preg_match("/ltr/", $value) ? 'rtl' : (
            preg_match("/rtl/", $value) ? 'ltr' : $value
        );
    }
    public function flipProperty($prop) {
        if (preg_match("/(?<=^|-|\s)left(?=$|-|\s)/", $prop)) {
            return preg_replace("/(?<=^|-|\s)left(?=$|-|\s)/", 'right', $prop);
        }
        if (preg_match("/(?<=^|-|\s)right(?=$|-|\s)/", $prop)) {
            return preg_replace("/(?<=^|-|\s)right(?=$|-|\s)/", 'left', $prop);
        }
        return $prop;
    }
    public function flipTransform($value) {
        return preg_replace_callback("/(\w+)\(([^\(\)]*)\)/", function($matches) {
            $flipSome = function($data, $items=[]) {
                foreach ($data[3] as $i => $item) {
                    $data[3][$i] = in_array($i, $items) ?
                        (-1 * $item[1]) . $item[2] :
                        $data[3][$i] = $item[0];
                }
                return $data[1] . "(" . implode(", ", $data[3]) . ")";
            };
            $values = preg_split("/\s*,\s*/", trim($matches[2]));
            foreach ($values as $val) {
                preg_match("/^([-+]?\d*\.?\d+)([\w%]*)$/", $val, $match);
                $matches[3][] = $match;
            }
            switch ($matches[1]) {
                case 'translate':   return $flipSome($matches, [0]);
                case 'translateX':  return $flipSome($matches, [0]);
                case 'translate3d': return $flipSome($matches, [0]);
                case 'skew':        return $flipSome($matches, [0, 1]);
                case 'skewX':       return $flipSome($matches, [0]);
                case 'skewY':       return $flipSome($matches, [0]);
                case 'rotate':      return $flipSome($matches, [0]);
                case 'rotateX':     return $flipSome($matches, [0]);
                case 'rotateY':     return $flipSome($matches, [0]);
                case 'rotateZ':     return $flipSome($matches, [0]);
                case 'rotate3d':    return $flipSome($matches, [3]);
            }
            return $matches[0];
        }, $value);
    }
    public function flipLeftRight($value) {
        return preg_match("/left/", $value) ? 'right' : (
            preg_match("/right/", $value) ? 'left' : $value
        );
    }
    public function flipQuad($value) {
        // Tokenize any rgb[a]/hsl[a] colors before flipping.
        $colors = [];
        preg_match("/(?:rgb|hsl)a?\([^\)]*\)/", $value, $matches);
        if ($matches) {
            foreach ($matches as $i => $color) {
                $colors[$i] = $color;
                $value = str_replace($color, '_C' . $i . '_', $value);
            }
        }
        $elements = preg_split("/\s+/", $value);
        if ($elements && count($elements) == 4) {
            // 1px 2px 3px 4px => 1px 4px 3px 2px
            $value = implode(' ', [$elements[0], $elements[3], $elements[2], $elements[1]]);
        }
        if ($colors) {
            // Replace any tokenized colors.
            return preg_replace_callback("/_C(\d+)_/", function($match) use($colors) {
                return $colors[$match[1]];
            }, $value);
        }
        return $value;
    }
    public function flipTransition($value) {
        $parts = preg_split("/\s*,\s*/", $value);
        $parts_map = array_map(function($part) {
            $RE_PROP = "/^\s*([a-zA-z\-]+)/";
            if (preg_match($RE_PROP, $part, $matches)) {
                $prop = $matches[1];
                $newProp = $this->flipProperty($prop);
                $part = implode($newProp, explode($prop, $part, 2));
            }
            return $part;
        }, $parts);
        return implode(", ", $parts_map);
    }
    public function flipValueOf($prop, $value) {
        $VALUES = [
          'background-position' => 'flipBackgroundPosition',
          'background-position-x' => 'flipBackgroundPosition',
          'border-radius' => 'flipBorderRadius',
          'border-color' => 'flipQuad',
          'border-style' => 'flipQuad',
          'border-width' => 'flipQuad',
          'box-shadow' => 'flipBoxShadow',
          'clear' => 'flipLeftRight',
          'direction' => 'flipDirection',
          'float' => 'flipLeftRight',
          'margin' => 'flipQuad',
          'padding' => 'flipQuad',
          'text-align' => 'flipLeftRight',
          'transition' => 'flipTransition',
          'transition-property' => 'flipTransition',
          'transform' => 'flipTransform',
          'transform-origin' => 'flipBackgroundPosition',
          'perspective-origin' => 'flipBackgroundPosition',
        ];
        $RE_IMPORTANT = "/\s*!important/";
        $RE_PREFIX    = "/^-[a-zA-Z]+-/";
        // find normalized property name (removing any vendor prefixes)
        $normalizedProperty = trim(strtolower($prop));
        if (preg_match($RE_PREFIX, $normalizedProperty)) {
            $normalizedPropertyArray = preg_split($RE_PREFIX, $normalizedProperty);
            $normalizedProperty = $normalizedPropertyArray[1];
        }
        $flipFn = isset($VALUES[$normalizedProperty]) ? $VALUES[$normalizedProperty] : false;
        if (!$flipFn) {
            return $value;
        }
        preg_match($RE_IMPORTANT, $value, $important);
        $newValue = call_user_func([$this, $flipFn], trim(preg_replace($RE_IMPORTANT, '', $value)), $prop);
        if ($important && !preg_match($RE_IMPORTANT, $newValue)) {
            $newValue .= $important[0];
        }
        return $newValue;
    }
    public function flip() {
        return preg_replace_callback("/(\{)([^{}]*?)(\})/s", function($matches) {
            return  $matches[1] .
                    $this->flipBlock($matches[2]) .
                    $matches[3];
        }, $this->css);
    }
    public function flipBlock($block) {
        return preg_replace_callback("/(?<=^|;)(\s*)(.+?)(\s*:\s*)(.+?)(?=\s*$|\s*;)/s", function($matches) {
            return  $matches[1] .
                    $this->flipProperty($matches[2]) .
                    $matches[3] .
                    $this->flipValueOf($matches[2], $matches[4]);
        }, $block);
    }
    public static function flipCss($path, $useTheme = false)
    {
        $path = str_replace('\\','/',$path);
        if($path == '/modules/backend/formwidgets/richeditor/assets/css/richeditor.css'){
            return $path;
        }

        $theme_name = Theme::getActiveTheme()->getDirName();
        $customPath = $useTheme ? themes_path($theme_name . '/' . dirname($path) . '/' . File::name($path) . '.rtl.' . File::extension($path)) : static::getCustomPath($path);
        $orginalFile = $useTheme ? themes_path($theme_name . '/' . $path) : base_path($path);

        $replacePath = $useTheme ? themes_path($theme_name) : base_path();

        if (File::exists($orginalFile)) {
            if (File::exists($customPath) && File::lastModified($orginalFile) < File::lastModified($customPath)) {
                return str_replace($replacePath, '', $customPath);
            }
            File::makeDirectory(dirname($customPath), 0777, true, true);
            $flipped_css = new CssFlipper(File::get($orginalFile));
            $flipped_css = $flipped_css->flip();
            //change url
            if ($useTheme === false) {
                $flipped_css = preg_replace_callback('/url\s*\(\s*[\'|\"]?([A-Za-z0-9\.\/\-\?=#_&]+)[\'|\"]?\)/i', function ($url) use ($path) {
                    $u = str_replace('\'', '', $url[1]);
                    $u = str_replace('"', '', $u);
                    $p = dirname($path) . '/' . $u;
                    if (substr($p, 0, 1) != '/') {
                        $p = '/' . $p;
                    }
                    return 'url(\'' . $p . '\')';
                }, $flipped_css);
            }
            preg_replace_callback('/@import\s*"([A-Za-z0-9\.\/\-\?=#_&]+)"\s*;/i', function ($import) use ($path, $useTheme) {
                $importPath = $import[1];
                if (substr($importPath, 0, 1) != '/') {
                    $importPath = dirname($path) . '/' . $importPath;
                }
                return static::flipCss($importPath, $useTheme);
            }, $flipped_css);
            File::put($customPath, $flipped_css);
            return str_replace($replacePath, '', $customPath);
        }
        return $path;
    }

    /**
     * @return mixed
     */
    public static function getCustomPath($path)
    {
        return storage_path('/temp/public/oc-persian/rtler/'). $path;
    }
}