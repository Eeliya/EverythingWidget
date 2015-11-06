<?php

namespace ew;

/**
 * Section main files must inherit this class
 *
 * @author Eeliya Rashidi
 */
class Module
{

   var $sectionName;
   protected $resource = null;
   var $pageTitles;
   var $page;
   var $command;
   public $pageTitle;
   private $app;
   private $current_class;
   private $current_method_args;
   protected $pre_processors = [];

   /**
    * 
    * @param App $app An instance of owener app of this section
    */
   public function __construct($app)
   {
      $this->app = $app;
      $this->initParameters();
      $this->current_class = new \ReflectionClass($this);

      $this->install_assets();

      $this->pre_processors = $this->get_pre_processors();

      $this->install_permissions();
   }

   public function get_resource()
   {
      if (!isset($this->resource))
         throw new \Exception("Resource can't be NULL");
      return $this->resource;
   }

   /**
    * Return the app instance that used to create section instance
    * @return \ew\App The app of this section
    */
   public function get_app()
   {
      return $this->app;
   }

   function initParameters()
   {
      
   }

   /**
    * Override this method to include all the external resource that you are going to use in this module
    */
   protected function install_assets()
   {
      
   }

   /**
    * Override this method to registare your plugins
    */
   protected function install_permissions()
   {
      
   }

   /**
    * Override this method and register your pre processors
    */
   protected function get_pre_processors()
   {
      return [];
   }

   public function add_pre_processor($pre_rocessor)
   {
      if (!in_array($pre_rocessor, $this->pre_processors))
      {
         $this->pre_processors[] = $pre_rocessor;
      }
   }

   public function run_pre_processors($verb, $method_name, $parameters)
   {
      for ($i = 0, $len = count($this->pre_processors); $i < $len; $i++)
      {
         $result = $this->pre_processors[$i]->process($this, $verb, $method_name, $parameters);
         if ($result === true)
         {
            continue;
         }
         else
         {
            return ($result === false || $result === null) ?
                    \EWCore::log_error(400, "API request is not executed", ["Pre processor has stopped the process: " . get_class($this->pre_processors[$i])]) :
                    $result;
         }
      }
      return true;
   }

   public function process_request($verb, $method_name, $parameters = null)
   {
      if (!$verb)
      {
         return \EWCore::log_error(400, "Wrong command: Request method is not defined");
      }
      $parameters['_verb'] = $verb;

      if (!$method_name)
      {
         return \EWCore::log_error(400, "Wrong command: {$this->app->get_root()}/{$this->current_class->getShortName()}. Method can not be null.");
      }

      if (preg_match('/(.*)\.(.*)?/', $method_name))
      {
         $path = EW_PACKAGES_DIR . '/' . $this->app->get_root() . '/' . $this->current_class->getShortName() . '/' . $method_name;
      }
      else if (method_exists($this, $method_name))
      {
         ob_start();
         echo $this->invoke_method($verb, $method_name, $parameters);
         return ob_get_clean();
      }
      //}

      $this->current_method_args = NULL;
      if ($path && file_exists($path))
      {
         ob_start();

         include $path;
         return ob_get_clean();
      }
      else if ($path)
      {
         $tp = $this->app->get_root() . '/' . $this->current_class->getShortName() . '/' . $method_name;
         return \EWCore::log_error(404, "<h4>API not found</h4><p>API call: {$tp}</p>");
      }
      else
      {
         return \EWCore::log_error(404, "API not found: {$method_name}");
      }
   }

   private function invoke_method($verb, $method_name, $parameters)
   {
      $preProcessorsResult = $this->run_pre_processors($verb, $method_name, $parameters);
      if ($preProcessorsResult !== true)
      {

         return $preProcessorsResult;
      }
      $db = \EWCore::get_db_connection();
      $method_object = new \ReflectionMethod($this, $method_name);
      $params = $method_object->getParameters();

      $functions_arguments = array();
      $this->current_method_args = array();
      foreach ($params as $param)
      {
         $temp = NULL;
         if (is_array($parameters[$param->getName()]))
         {
            //array_walk_recursive($parameters[$param->getName()], Illuminate\Database\Capsule\Manager::connection()->getPdo()->quote);
            $temp = $parameters[$param->getName()];
         }
         else
         {
            //$temp = Illuminate\Database\Capsule\Manager::connection()->getPdo()->quote($parameters[$param->getName()]);
            $temp = $parameters[$param->getName()];
         }
         $functions_arguments[] = $temp;
         $this->current_method_args[$param->getName()] = $temp;
      }
      //$method_object->setAccessible(true);
      $command_result = $method_object->invokeArgs($this, $functions_arguments);

      // Read the listeners for this command
      /*$actions = \EWCore::read_registry("app-" . $this->app->get_root() . "/" . $this->current_class->getShortName() . "/" . $method_name . "_listener");
      if (isset($actions) && !is_array($command_result))
      {

         $temp_result = json_decode($command_result, true);
         if (json_last_error() == JSON_ERROR_NONE)
         {
            //echo "sadasfd $command_result";
            $command_result = $temp_result;
         }
      }

      try
      {
         // Call the listeners with the same data as the command data
         if (isset($actions))
         {
            foreach ($actions as $id => $data)
            {
               if (method_exists($data["object"], $data["function"]))
               {
                  $listener_method_object = new ReflectionMethod($data["object"], $data["function"]);
                  $functions_arguments = \EWCore::create_arguments($listener_method_object, $parameters);
                                    
                  $plugin_result = $listener_method_object->invokeArgs($data["object"], $functions_arguments);
                  
                  if ($plugin_result)
                  {
                     $command_result = $plugin_result;
                  }
               }
            }
         }
      }
      catch (Exception $e)
      {
         echo $e->getTraceAsString();
      }*/

      if (is_array($command_result))
         $command_result = json_encode($command_result);

      return $command_result;
   }

   /**
    * 
    * @param ew\PreProcess $preProcessObj An instance of pre process object
    */
   public function registerPreProcesser($preProcessObj)
   {
      
   }

   /**
    * Get the parameters which has been passed to the currently called command
    * @return array An array of parameters which have been passed to the currently called method
    */
   protected function get_current_command_args()
   {
      return $this->current_method_args;
   }

   /**
    * Add parameters to the current command parameters
    * @param array $params An array in key, value format to be added to the current parameters
    */
   protected function add_parameter($params)
   {
      $this->current_method_args = array_merge($this->current_method_args, $params);
   }

   public function is_hidden()
   {
      return false;
   }

   /**
    * Spacify array of titles for pages in the format of page->title <br/>
    * Whenever user request a page from this section, He/She will see the corresponding title
    * @param type $page
    */
   function setPageTitles($pageTitles)
   {
      $this->pageTitles = $pageTitles;
   }

   function getPageTitle()
   {
      return $this->pageTitle;
   }

   function getContent()
   {
      global $HOST_ROOT_DIR;
      if ($this->page)
         return $this->sectionName . '/' . $this->page;
      else
         return $this->sectionName . '/index.php';
   }

   public function get_param($param)
   {
      return $this->request[$param];
   }

   public function getName()
   {
      return $this->sectionName = $secName;
   }

   public function index()
   {
      $path = $this->app->get_root() . '/' . $this->get_section_name() . '/index.php';
      include $path;
   }

   public function get_index()
   {
      return "index.php";
   }

   public function get_title()
   {
      return null;
   }

   public function get_description()
   {
      return null;
   }

   public function get_section_name()
   {
      return $this->current_class->getShortName();
   }

   /**
    * Add listener to the specific command.<br/>
    * The $function will be called after the command has been processed
    * @param string $command <p>A string that represent the command</p>
    * @param string $function <p>The name of function that should be triggered whenever the command called</p>
    * @param Module $object [optional] <p><b>Section</b> object that contains the function</p>
    */
   public function add_listener($command, $function, $object = null)
   {
      //self::$action_registry[$name][$command] = array("function" => $function, "class" => $object);
      if (!$object)
      {
         $object = $this;
      }
      //echo $command . "_listener";
      \EWCore::register_object($command . "_listener", $this->app->get_root() . "/" . $this->current_class->getShortName() . "/" . $function, array(
          "function" => $function,
          "object" => $object));
   }

   public function register_content_component($key, $comp_object)
   {
      //$ro = new ReflectionClass($this);
      //$defaults = ["componentObject" => $comp_object];
      //$defaults = array_merge($defaults, $comp_object);
      \EWCore::register_object("ew-content-labels", $this->app->get_root() . '_' . $this->get_section_name() . '_' . $key, $comp_object);
   }

   /**
    * 
    * @param type $key
    * @param type $default_value
    */
   public function register_content_label($key, $default_value)
   {
      //$ro = new ReflectionClass($this);
      $defaults = ["app" => $this->app->get_root(),
          "section" => $this->get_section_name(),
          "command" => 'ew_label_' . $key];
      $defaults = array_merge($defaults, $default_value);
      \EWCore::register_object("ew-content-labels", $this->app->get_root() . '_' . $this->get_section_name() . '_' . $key, $defaults);
   }

   public function register_form($name, $id, $default_value)
   {
      $defaults = ["app" => $this->app->get_root(),
          "section" => $this->get_section_name(),
          "command" => 'ew_form_' . $id];
      $defaults = array_merge($defaults, $default_value);
      \EWCore::register_object($name, $this->app->get_root() . '_' . $this->get_section_name() . '_' . $id, $defaults);
   }

   /**
    * In order to EWCore can find the function which is binded to this feeder id, the function name should be defined in the follow format: ew_<b>[feeder_type]</b>_feeder_<b>[function_name]</b>
    * @param type $type The type of feeder
    * @param type $id
    * @param type $function_name Name of the fucntion without the prefix
    */
   public function register_widget_feeder($type, $id, $function_name = null)
   {
      if (!$function_name)
         $function_name = $id;
      //$ro = new ReflectionClass($this);
      //$app = $this->app->get_root();
      //EWCore::register_object("ew-widget-feeder", "$type:$app", array($this, "ew_" . $type . "_feeder_" . $function_name));
      if (!strpos($function_name, ".php"))
      {
         $function_name = array(
             $this,
             "ew_" . $type . "_feeder_" . $function_name);
      }
      \EWCore::register_widget_feeder($type, $this->app->get_root(), $id, $function_name);
   }

   public function register_content_type($type_name, $get, $get_list)
   {
      
   }

   public function register_permission($id, $description, $permissions)
   {
      \EWCore::register_permission($this->app->get_root(), \EWCore::camelToHyphen($this->current_class->getShortName()), \EWCore::camelToHyphen($id), $this->app->get_name(), $this->get_title(), $description, $permissions);
   }

   /**
    * Registare an activity for the this Section.<br/><p>
    * An activity is a proccess that usually contains a visual form(s). An activity itself has no business logic but it have interaction with business logic.
    * It is highly recommended to avoid implemmenting business logic in an activity. It is recommended to register an activity for every form.<br/>
    * <code>$parameter</code> can contain title, description, form, url, actions and custom parameters </p>
    * @param type $id 
    * @param array $parameters
    */
   public function register_activity($id, $parameters)
   {
      if (!$parameters["compId"])
      {
         $parameters["compId"] = "AppsManagement";
      }
      $parameters["app"] = $this->app->get_root();
      $parameters["section"] = $this->current_class->getShortName();
      $parameters["appTitle"] = $this->app->get_name();
      $parameters["url"] = EW_ROOT_URL . "app-" . $this->app->get_root() . "/" . $this->current_class->getShortName() . "/" . $parameters["form"];

      \EWCore::register_object("ew-activity", "app-" . $this->app->get_root() . "/" . $this->current_class->getShortName() . "/" . $id, $parameters);
   }

   private function save_setting($key = null, $value = null)
   {
      $db = \EWCore::get_db_connection();
      $app_root = $this->app->get_root();
      $setting = $db->query("SELECT * FROM ew_settings WHERE `key` = '$app_root/$key' ") or die($db->error);
      if ($user_info = $setting->fetch_assoc())
      {
         $db->query("UPDATE ew_settings SET value = '$value' WHERE `key` = '$app_root/$key' ") or die($db->error);
         return TRUE;
      }
      else
      {
         $db->query("INSERT INTO ew_settings(`key`, `value`) VALUES('$app_root/$key','$value')") or die($db->error);
         return TRUE;
      }
      return FALSE;
   }

   protected function save_settings($params)
   {
      //$db = \EWCore::get_db_connection();
      if (!$params)
         return \EWCore::log_error(400, "Please specify the paramaters");
      $params = json_decode($params, TRUE);
      foreach ($params as $key => $value)
      {
         //echo $key . " " . $value;
         if (!$this->save_setting($key, $value))
            return \EWCore::log_error(400, "The configuration has not been saved", ["key" => $key,
                        "value" => $value]);
      }
   }

   public static function read_settings()
   {
      return \EWCore::read_settings($this->app->get_root());
   }

}