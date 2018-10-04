<?php namespace OctoberFa\Persian;

use Cms\Classes\Page as CmsPage;
use Illuminate\Foundation\AliasLoader;
use OctoberFa\Persian\Classes\CssFlipper;
use OctoberFa\Persian\Classes\UrlGenerator;
use OctoberFa\Persian\Classes\Verta;
use October\Rain\Argon\Argon;
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
     * Returns information about this plugin.
     *
     * @return array
     */
    public function pluginDetails()
    {
        return [
            'name' => 'Persian',
            'description' => 'No description provided yet...',
            'author' => 'OctoberFa',
            'icon' => 'icon-leaf',
        ];
    }

    /**
     * Register method, called when the plugin is first registered.
     *
     * @return void
     */
    public function register()
    {
        Argon::setLocale('fa');

        AliasLoader::getInstance()->alias(
            'Model',
            '\OctoberFa\Persian\Classes\Model'
        );
        AliasLoader::getInstance()->alias('October\Rain\Database\Traits\Sluggable', 'OctoberFa\Persian\Classes\Sluggable');

        $this->registerUrlGenerator();
        $this->fixValidations();
        $this->registerMarkupTags();

    }

    /**
     * Boot method, called right before the request route.
     *
     * @return array
     */
    public function boot()
    {
        // Check if we are currently in backend module.
        if (!\App::runningInBackend()) {
            return;
        }

        // Listen for `backend.page.beforeDisplay` event and inject js to current controller instance.
        \Event::listen('backend.page.beforeDisplay', function ($controller, $action, $params) {
            if (!\Request::ajax()) {
                $controller->addJs(\Config::get('cms.pluginsPath') . ('/octoberfa/persian/assets/dist/all.js'));
                $controller->addCss(\Config::get('cms.pluginsPath') . ('/octoberfa/persian/assets/dist/all.css'));
            }
        });
    }

    protected function registerUrlGenerator()
    {
        $this->app->singleton('url', function ($app) {
            $routes = $app['router']->getRoutes();
            $url = new UrlGenerator(
                $routes, $app->rebinding(
                    'request', $this->requestRebinder()
                ));
            $url->setSessionResolver(function () {
                return $this->app['session'];
            });
            // If the route collection is "rebound", for example, when the routes stay
            // cached for the application, we will need to rebind the routes on the
            // URL generator instance so it has the latest version of the routes.
            $app->rebinding('routes', function ($app, $routes) {
                $app['url']->setRoutes($routes);
            });
            return $url;
        });
    }
    protected function requestRebinder()
    {
        return function ($app, $request) {
            $app['url']->setRequest($request);
        };
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

    public function registerMarkupTags()
    {
        MarkupManager::instance()->registerCallback(function ($manager) {
            $manager->registerFilters([
                'pDate' => [$this, 'pDate'],
            ]);
        });

        MarkupManager::instance()->registerCallback(function ($manager) {
            $manager->registerFilters([
                'flipCss' => [$this, 'flipCss'],
            ]);
        });
    }

    /**
     * Twig Markup Filter 'pDate'
     * @param $date
     * @param $format
     * @return string
     */
    public function pDate($date = null, $format = "Y/m/d")
    {
        return Verta::instance($date)->format($format);
    }

    /**
     * Twig Markup Filter 'flipCss'
     * @param $paths
     * @param bool $force
     * @return array|string
     */
    public function flipCss($paths)
    {
        if (!is_array($paths)) {
            $paths = [$paths];
        }
        $rPaths = [];
        foreach ($paths as $path) {
            $assetPath = $path;
            if (File::exists(dirname($assetPath) . '/' . File::name($assetPath) . '.rtl.' . File::extension($assetPath))) {
                $newPath = dirname($assetPath) . '.rtl.' . File::extension($assetPath);
            } else {
                $newPath = CssFlipper::flipCss($assetPath, true);
            }
            $rPaths[] = $newPath;
        }
        return $rPaths;
    }
}
