<?php namespace OctoberFa\Persian\Classes\Rtl;

use File;
use Lang;
use Config;
use Request;
use Illuminate\Routing\UrlGenerator as baseGenerator;

class UrlGenerator extends baseGenerator
{
    /**
     * Generate a URL to an application asset.
     *
     * @param  string $path
     * @param  bool|null $secure
     * @return string
     */
    public function asset($path, $secure = null)
    {
        if ($this->isValidUrl($path)) return $path;
        if(!strpos($path,'/octoberfa/persian/assets/css/persian-min.css')) {
            $backendUri = Config::get('cms.backendUri', 'backend');
            $requestUrl = Request::url();
            if (File::exists(
                base_path(dirname($path)) . '.rtl.' . File::extension($path)
            )
            ) {
                $path = dirname($path) . '.rtl.' . File::extension($path);
            } else if (File::extension($path) == 'css' && (strpos($requestUrl, $backendUri) || strpos($path, 'plugins/') || strpos($path, 'modules/'))) {
                $path = CssFlipper::flipCss($path);
            }
        }
        return parent::asset($path,$secure);
    }

        /**
     * Generate an absolute URL to the given path.
     *
     * @param  string  $path
     * @param  mixed  $extra
     * @param  bool|null  $secure
     * @return string
     */
    public function to($path, $extra = [], $secure = null)
    {
        if ($this->isValidUrl($path)) {
            return $path;
        }
        if(!strpos($path,'/rtlweb/rtler/assets/css/rtl.css')) {
            $backendUri = Config::get('cms.backendUri', 'backend');
            $requestUrl = Request::url();
            if (File::exists(
                base_path(dirname($path)) . '.rtl.' . File::extension($path)
            )
            ) {
                $path = dirname($path) . '.rtl.' . File::extension($path);
            } else if (File::extension($path) == 'css' && (strpos($requestUrl, $backendUri) || strpos($path, 'plugins/') || strpos($path, 'modules/'))) {
                $path = CssFlipper::flipCss($path);
            }
        }

        return parent::to($path,$extra,$secure);
    }

}
