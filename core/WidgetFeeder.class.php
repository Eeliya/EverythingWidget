<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace ew;

/**
 * Description of WidgetFeeder
 *
 * @author Eeliya
 */
class WidgetFeeder {

  public $id = "";
  public $url = "";
  public $module;
  private $resourse_type = "api";
  public $feeder_type = "widget";
  public $method_name;
  public $title = "Widget";
  public $description = "This is a widget";
  public $api_url;

  public function __construct($url, $module, $feeder_type, $method_name, $resource_type = "api") {
    $this->url = (substr($url, -1) === "/") ? $url : "$url/";
    $this->module = $module;
    $this->feeder_type = $feeder_type;
    $this->method_name = $method_name;
    $this->resourse_type = $resource_type;
    $this->id = str_replace('_', '-', $module->get_app()->get_root())
            . '/' . $resource_type
            . '/' . \EWCore::camelToHyphen($module->get_name()
                    . '/' . $method_name);
    $this->api_url = $this->id;
  }

  public function set_title($title) {
    $this->title = $title;
  }

  public function get_title() {
    return $this->title;
  }

  public function set_api_url($api_url) {
    $this->api_url = $api_url;
  }

}
