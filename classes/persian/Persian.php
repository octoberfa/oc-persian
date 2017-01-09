<?php namespace OctoberFa\Persian\Classes\Persian;

use October\Rain\Argon\Argon;
use Cms\Classes\Page as CmsPage;
use System\Classes\MarkupManager;
use System\Classes\PluginManager;
use Illuminate\Foundation\AliasLoader;
use October\Rain\Support\Traits\Singleton;
use \Backend\Classes\Controller as BackendController;

class Persian
{
    use Singleton;

    public function init()
    {

    }
    public function register()
    {
        $this->fixValidations();
        $this->replaceClasses();
        $this->registerMarkupTags();
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

    public function replaceClasses()
    {
        AliasLoader::getInstance()->alias('October\Rain\Database\Traits\Sluggable', 'OctoberFa\Persian\Classes\Persian\Sluggable');
    }

    public function registerMarkupTags()
    {
        MarkupManager::instance()->registerCallback(function ($manager) {
            $manager->registerFilters([
                'pDate' => [$this, 'pDate'],
            ]);
        });
    }

    /**
     * Twig Markup Filter 'pDate'
     * @param $date
     * @param $format
     * @return array|string
     */
    public function pDate($date=null,$format="Y/m/d")
    {
        return JDate::forge($date)->format($format);
    }
}
