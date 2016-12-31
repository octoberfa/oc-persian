<?php namespace OctoberFa\Persian\Classes;


use Session;

class LanguageDetector
{
    private static $language;
    protected static $rtlLanguages = ['fa'];

    public static function isRtl()
    {
        return array_search(self::$language, self::$rtlLanguages) !== false;
    }

    public static function detect()
    {
        self::$language = app()->getLocale();
        if (Session::has('locale')) {
            self::$language = Session::get('locale');
        }
        if (!app()->runningInBackend()) {
            if (Session::has('rainlab')) {
                $rainlab = Session::get('rainlab');
                if (array_key_exists('translate', $rainlab)) {
                    $translate = $rainlab['translate'];
                    if (array_key_exists('locale', $translate)) {
                        self::$language = $translate['locale'];
                    }
                }
            }
        }
        \Event::listen('locale.changed', function ($locale) {
            self::$language = $locale;
        });
    }
}
