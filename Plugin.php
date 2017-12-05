<?php namespace OctoberFa\Persian;

use Event;
use Config;
use Backend;
use Request;
use System\Classes\PluginBase;
use System\Classes\CombineAssets;
use OctoberFa\Persian\Classes\Rtl\Rtler;
use OctoberFa\Persian\Classes\Persian\Persian;
/**
 * Persian Plugin Information File
 */
class Plugin extends PluginBase
{

    public $elevated = true;

    /**
     * Returns information about this plugin.
     *
     * @return array
     */
    public function pluginDetails()
    {
        return [
            'name' => 'octoberfa.persian::lang.plugin.name',
            'description' => 'octoberfa.persian::lang.plugin.description',
            'author' => 'Sajjad Servatjoo & Saman Sorushniya',
            'icon' => 'icon-support'
        ];
    }

    /**
     * Register method, called when the plugin is first registered.
     *
     * @return void
     */
    public function register()
    {
        $this->registerEvents();
        $this->registerAssetBundles();
        Rtler::instance()->register();
        Persian::instance()->register();
    }

    public function registerEvents(){
        Event::listen('backend.page.beforeDisplay', function ($controller, $action, $params) {
            if (!Request::ajax()) {
                $controller->addJs(Config::get('cms.pluginsPath') . ('/octoberfa/persian/assets/js/persian-min.js'));
                $controller->addCss(Config::get('cms.pluginsPath') . ('/octoberfa/persian/assets/css/persian-min.css'));
            }
        });
    }

    /**
     * Register asset bundles
     */
    protected function registerAssetBundles()
    {
        CombineAssets::registerCallback(function ($combiner) {
            $combiner->registerBundle( '$/octoberfa/persian/assets/js/persian.js');
        });
    }

}
