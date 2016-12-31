<?php namespace OctoberFa\Persian\Classes\Persian;
/**
 *
 *
 * @license     MIT License
 */
use Carbon\Carbon;
/**
 * Class JDate
 */
class JDate
{
    /**
     * @var \DateTime
     */
    protected $dateTime;
    /**
     * @var array
     */
    protected $formats = array(
        'datetime' => '%Y-%m-%d %H:%M:%S',
        'date' => '%Y-%m-%d',
        'time' => '%H:%M:%S',
    );
    /**
     * @param string|null $str
     * @param null $timezone
     * @return $this
     */
    public static function forge($str = null, $timezone = null)
    {
        return new static($str, $timezone);
    }
    /**
     * @param string|null $str
     * @param null $timezone
     */
    public function __construct($str = null, $timezone = null)
    {
        $this->dateTime = JDateTime::createDateTime($str, $timezone);
    }
    /**
     * @return \DateTime|static
     */
    public function getDateTime()
    {
        return $this->dateTime;
    }
    /**
     * @param $format
     * @return bool|string
     */
    public function format($format)
    {
        // convert alias string
        if (in_array($format, array_keys($this->formats))) {
            $format = $this->formats[$format];
        }
        // if valid unix timestamp...
        if ($this->dateTime !== false) {
            return JDateTime::strftime($format, $this->dateTime->getTimestamp(), $this->dateTime->getTimezone());
        } else {
            return false;
        }
    }
    /**
     * @param string $str
     * @return $this
     */
    public function reforge($str)
    {
        $this->dateTime->modify($str);
        return $this;
    }
    /**
     * @return string
     */
    public function ago()
    {
        $now = time();
        $time = $this->getDateTime()->getTimestamp();
        // catch error
        if (!$time) {
            return false;
        }
        // build period and length arrays
        $periods = array('ثانیه', 'دقیقه', 'ساعت', 'روز', 'هفته', 'ماه', 'سال', 'قرن');
        $lengths = array(60, 60, 24, 7, 4.35, 12, 10);
        // get difference
        $difference = $now - $time;
        // set descriptor
        if ($difference < 0) {
            $difference = abs($difference); // absolute value
            $negative = true;
        }
        // do math
        for ($j = 0; $difference >= $lengths[$j] and $j < count($lengths) - 1; $j++) {
            $difference /= $lengths[$j];
        }
        // round difference
        $difference = intval(round($difference));
        // return
        return number_format($difference) . ' ' . $periods[$j] . ' ' . (isset($negative) ? '' : 'پیش');
    }
    /**
     * @return bool|string
     */
    public function until()
    {
        return $this->ago();
    }

    /**
     * @return int
     */
    public function time()
    {
        return $this->dateTime->getTimestamp();
    }
}
