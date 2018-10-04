<?php namespace OctoberFa\Persian\Classes;

use October\Rain\Argon\Argon as BaseArgon;

use Jenssegers\Date\Date as DateBase;

use Hekmatinasser\Verta\Verta;

/**
 * Umbrella class.
 */
class Argon extends BaseArgon
{

    /**
     * @inheritdoc
     */
    public function format($format)
    {
        $verta = new Verta($this);
        $replace = [];
        // Loop all format characters and check if we can translate them.
        for ($i = 0; $i < strlen($format); $i++) {
            $character = $format[$i];
            // Check if we can replace it with a translated version.
            if (in_array($character, ['D', 'l', 'F', 'M'])) {
                // Check escaped characters.
                if ($i > 0 and $format[$i - 1] == '\\') {
                    continue;
                }
                switch ($character) {
                    case 'D':
                        $key = $verta->format('l');
                        break;
                    case 'M':
                        $key = $verta->format('F');
                        break;
                    default:
                        $key = $verta->format($character);
                }
                // The original result.
                $original = $verta->format($character);
                // Translate.
                $lang = $this->getTranslator();
                // For declension support, we need to check if the month is lead by a day number.
                // If so, we will use the second translation choice if it is available.
                if (in_array($character, ['F', 'M'])) {
                    $choice = preg_match('#[dj][ .]*$#', substr($format, 0, $i)) ? 1 : 0;
                    $translated = $lang->transChoice(mb_strtolower($key), $choice);
                } else {
                    $translated = $lang->trans(mb_strtolower($key));
                }
                // Short notations.
                if (in_array($character, ['D', 'M'])) {
                    $toTranslate = mb_strtolower($original);
                    $shortTranslated = $lang->trans($toTranslate);
                    if ($shortTranslated === $toTranslate) {
                        // use the first 3 characters as short notation
                        $translated = mb_substr($translated, 0, 3);
                    } else {
                        // use translated version
                        $translated = $shortTranslated;
                    }
                }
                // Add to replace list.
                if ($translated and $original != $translated) {
                    $replace[$original] = $translated;
                }
            }
        }
        // Replace translations.
        if ($replace) {
            return str_replace(array_keys($replace), array_values($replace), $verta->format($format));
        }
        return $verta->format($format);
    }
}
