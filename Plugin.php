<?php

namespace OctoberFa\Persian;

use App;
use Event;
use Cms\Classes\Page as CmsPage;
use Illuminate\Foundation\AliasLoader;
use OctoberFa\Persian\Classes\CssFlipper;
use OctoberFa\Persian\Classes\UrlGenerator;
use OctoberFa\Persian\Classes\Verta;
use System\Classes\MarkupManager;
use System\Classes\PluginBase;
use System\Classes\PluginManager;

/**
 * Persian Plugin Information File
 */
class Plugin extends PluginBase
{
    /**
     * @var bool Plugin requires elevated permissions.
     */
    public $elevated = true;

    /**
     * @var array Plugin dependencies
     */
    public $require = ['OctoberFa.Rtler', 'OctoberFa.Calendars'];

    /**
     * Returns information about this plugin.
     *
     * @return array
     */
    public function pluginDetails()
    {
        return [
            'name' => 'Persian',
            'description' => 'Persian support for October cms',
            'author' => 'OctoberFa',
            'icon' => 'icon-headphones',
        ];
    }
    /**
     * Register method, called when the plugin is first registered.
     *
     * @return void
     */
    public function register()
    {
        Event::listen('octoberfa.calendars.getBackendCalendarLanguage', function () {
            return "fa";
        });
        Event::listen('octoberfa.calendars.getBackendCalendarType', function () {
            return "persian";
        });
        AliasLoader::getInstance()->alias('October\Rain\Database\Traits\Sluggable', 'OctoberFa\Persian\Classes\Sluggable');

        $this->fixValidations();
        \Event::listen('backend.page.beforeDisplay', function ($controller, $action, $params) {
            App::setLocale('fa');
            if (!\Request::ajax()) {
                $controller->addJs(\Config::get('cms.pluginsPath') . ('/octoberfa/persian/assets/dist/fix.input.preset.js'));
            }
        });
    }
    /**
     * Boot method, called right before the request route.
     *
     * @return array
     */
    public function boot()
    {
        // Check if we are currently in backend module.
        // if (!\App::runningInBackend()) {
        //     return;
        // }
        // Listen for `backend.page.beforeDisplay` event and inject js to current controller instance.
        // \Event::listen('backend.page.beforeDisplay', function ($controller, $action, $params) {
        //     if (!\Request::ajax()) {
        //         $controller->addJs(\Config::get('cms.pluginsPath') . ('/octoberfa/persian/assets/dist/vendor.js'));
        //         $controller->addJs(\Config::get('cms.pluginsPath') . ('/octoberfa/persian/assets/dist/all.js'));
        //         $controller->addCss(\Config::get('cms.pluginsPath') . ('/octoberfa/persian/assets/dist/all.css'));
        //     }
        // });
    }

    public function fixValidations()
    {
        CmsPage::extend(function ($page) {
            $page->rules['url'] = ['required', 'regex:/^\/[۰-۹آا-یa-z0-9\/\:_\-\*\[\]\+\?\|\.\^\\\$]*$/iu'];
        });
        //edit blog url validation rule
        if (PluginManager::instance()->exists('rainlab.blog')) {
            \RainLab\Blog\Models\Post::extend(function ($post) {
                $post->rules['slug'] = ['required', 'regex:/^[۰-۹آا-یa-z0-9\/\:_\-\*\[\]\+\?\|]*$/iu', 'unique:rainlab_blog_posts'];
            });
        }
        //extending rainlab.pages
        if (PluginManager::instance()->exists('rainlab.pages')) {
            //edit rainlab page url validation rule
            \RainLab\Pages\Classes\Page::extend(function ($page) {
                $page->rules['url'] = ['required', 'regex:/^\/[۰-۹آا-یa-z0-9\/_\-]*$/iu', 'uniqueUrl'];
            });
            //edit rainlab page filename in crating
            \RainLab\Pages\Classes\Page::creating(function ($page) {
                $page->fileName = \Str::ascii($page->fileName);
            }, -1);
        }
    }
}
