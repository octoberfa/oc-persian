<?php namespace OctoberFa\Persian\Classes;

use OctoberFa\Persian\Classes\Verta;
use October\Rain\Database\Model as BaseModel;
use October\Rain\Argon\Argon;

class Model extends BaseModel{
    protected $__onAfterValidateModel = false;
    protected $__onFetchingModel = false;
    /**
     * Constructor
     */
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        
        $this->bindEvent('model.afterFetch', function () {

            $this->__onFetchingModel = true;
            foreach ($this->getDates() as $key) {
                if (!isset($this->attributes[$key])) {
                    continue;
                }
                $this->attributes[$key] = $this->asPrDateTime($this->attributes[$key]);
            }

        });
        $this->bindEvent('model.beforeSave', function () {
            $this->__onFetchingModel = false;
            $this->__onAfterValidateModel = true;
            foreach ($this->getDates() as $key) {
                if (!isset($this->attributes[$key])) {
                    continue;
                }
                $this->attributes[$key] = $this->asDateTime($this->attributes[$key]);
            }
        });        
    }

    /**
     * Return a timestamp as DateTime object.
     *
     * @param  mixed  $value
     * @return \Carbon\Carbon
     */
    protected function asDateTime($value)
    {
        if($this->__onFetchingModel){
            return $this->asPrDateTime($value);
        }
        if($this->__onAfterValidateModel){
            try{
                
                return parent::asDateTime($this->asPrDateTime($value)->DateTime());
            }catch(\Exception $ex){
            }
        }
        return parent::asDateTime($value);
    }
    


    /**
     * Return a timestamp as DateTime object.
     *
     * @param  mixed  $value
     * @return \Carbon\Carbon
     */
    protected function asPrDateTime($value)
    {
        if($value instanceof Verta ){
            return $value;
        }
        if ($value instanceof Argon) {
            return new Verta($value);
        }

        if ($value instanceof DateTimeInterface) {
            return new Verta(new Argon(
                $value->format('Y-m-d H:i:s.u'), $value->getTimezone()
            ));
        }

        if (is_numeric($value)) {
            return new Verta(Argon::createFromTimestamp($value));
        }

        if ($this->isStandardDateFormat($value)) {
            if(substr($value,0,2) == '13'){
                return Verta::parseFormat('Y-m-d',$value)->startDay();
            }
            return new Varta(Argon::createFromFormat('Y-m-d', $value)->startOfDay());
        }
        if(substr($value,0,2) == '13'){
            return Verta::parse($value);
        }
        return new Verta(Argon::createFromFormat(
            str_replace('.v', '.u', $this->getDateFormat()), $value
        ));
    }


    /**
     * Perform the actual delete query on this model instance.
     *
     * @return void
     */
    protected function runSoftDelete()
    {
        $this->__onFetchingModel = false;
        $this->__onAfterValidateModel = true;
        parent::runSoftDelete();
    } 
    
}
