<?php namespace OctoberFa\Persian\Classes\Rtl;

use File;
use CSSJanus;
use Cms\Classes\Theme;

class CssFlipper
{
    /**
     * @param $path
     * @return string
     */
    public static function flipCss($path, $useTheme = false)
    {
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
            $flipped_css = CSSJanus::transform(File::get($orginalFile), true, true);

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
