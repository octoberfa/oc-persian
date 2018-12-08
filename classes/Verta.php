<?php namespace OctoberFa\Persian\Classes;

use \Hekmatinasser\Verta\Verta as BaseVerta;

class Verta extends BaseVerta{
    /**
     * Format the instance with day, date and time
     *
     * @return string
     */
    public function toDayDateTimeString()
    {
        return $this->format('D, M j, Y g:i A');
    }
    public function diffForHumans(){
        return Argon::instance($this->DateTime())->diffForHumans();
    }
}