<?php

//require 'config.php';

/**
 * Core functions of EW have been ddefined in this class
 *
 * @author Eeliya
 */
class EWCore {

  private $apps_root;
  private $request;
  private static $registry = array();
  private static $action_registry;
  private static $permissions_groups = array();
  private static $no_permission_needed = array();
  private static $loaders_installed = false;
  private static $plugins_initialized = false;
  private static $db_connection = null;
  private $current_method_args;
  public static $DB = null;
  public static $languages;
  public static $EW_CONTENT_COMPONENT = "ew-content-component";
  public static $EW_APP = "ew-app";
  public static $APPS = [];

  public function __construct() {
    static::$languages = include('../config/languages.php');
    $this->apps_root = EW_PACKAGES_DIR . '/';
    $this->request = $_REQUEST;
    spl_autoload_register(array(
        $this,
        'autoload_core'));
  }

  public function load_vendors() {
    require '../vendor/autoload.php';
  }

  public function init() {
    $database_config = include('../config/database_config.php');
    $this->load_vendors();
    self::$loaders_installed = true;
    self::init_packages();

    if ($database_config["database_library"] == TRUE) {
      static::$DB = new Illuminate\Database\Capsule\Manager;
      static::$DB->addConnection([
          'driver'    => 'mysql',
          'host'      => $database_config['host'],
          'database'  => $database_config['database'],
          'username'  => $database_config['username'],
          'password'  => $database_config['password'],
          'charset'   => 'utf8',
          'collation' => 'utf8_unicode_ci',
          'prefix'    => '',
      ]);
      static::$DB->setAsGlobal();
      static::$DB->bootEloquent();
    }
  }

  public function start() {
    
  }

  public function process($parameters = null) {
    if (!$parameters) {
      $parameters = $_REQUEST;
    }

    if ($parameters['_method_name'] && method_exists($this, $parameters['_method_name'])) {
      $method_object = new ReflectionMethod($this, $parameters['_method_name']);
      $params = $method_object->getParameters();
      $functions_arguments = array();
      $this->current_method_args = array();

      foreach ($params as $param) {
        $functions_arguments[] = $parameters[$param->getName()];
        $this->current_method_args[$param->getName()] = $parameters[$param->getName()];
      }

      ob_start();
      echo $method_object->invokeArgs($this, $functions_arguments);
      $result = ob_get_clean();

      $this->current_method_args = array();

      return $result;
    }
    else {
      echo "No such command existed: " . $parameters['_method_name'];
    }
  }

  public static function call($url, $parameters = []) {
    $parts = explode('/', $url);
    $pars = array_merge($_REQUEST, [
        '_file' => implode('/', array_slice($parts, 3))
            ], $parameters);

    return static::process_request_command($parts[0], $parts[1], $parts[2], $parts[3], $pars);
  }

  public static function call_api($url, $parameters = [], $verb = 'GET') {
    $parts = explode('/', $url);
    $params = array_merge(/* $_REQUEST, */[
        '_file' => implode('/', array_slice($parts, 3))
            ], $parameters);

    ksort($params);

    $params["_APIResourceHandler_output_array"] = true;
    $params["_APIResourceHandler_verb"] = $verb;

    return static::process_request_command($parts[0], $parts[1], $parts[2], $parts[3], $params);
  }

  private static $CACHED_API_CALL_RESULTS = [];

  public static function call_cached_api($url, $parameters = []) {
    $parts = explode('/', $url);
    $params = array_merge($_REQUEST, [
        '_file' => implode('/', array_slice($parts, 3))
            ], $parameters);

    ksort($params);

    $cached_resource_id = $url . ' ' . implode('-', $params);

    if (isset(static::$CACHED_API_CALL_RESULTS[$cached_resource_id])) {
      return static::$CACHED_API_CALL_RESULTS[$cached_resource_id];
    }

    $params["_APIResourceHandler_output_array"] = true;

    static::$CACHED_API_CALL_RESULTS[$cached_resource_id] = static::process_request_command($parts[0], $parts[1], $parts[2], $parts[3], $params);
    return static::$CACHED_API_CALL_RESULTS[$cached_resource_id];
  }

  public static function process_request_command($package, $resource_type, $module_name, $method_name, $parameters) {
    if (!$package /* || !$section_name || !$function_name */) {
      $response_data = EWCore::log_error(400, "Wrong command");
      return json_encode($response_data);
    }

    //echo " $app_name  $section_name  $function_name";
    //$app_namespace = explode('/', $package);
    $real_class_name = str_replace('-', '_', $package) . '\\App';
    //echo $real_class_name;
    $parameters["_app_name"] = $package;
    $parameters["_resource_type"] = $resource_type;
    $parameters["_module_name"] = $module_name;
    $parameters["_method_name"] = $method_name;
    $parameters["_parts"] = array_slice(explode('/', $parameters["_file"]), 1);


    if ($module_name == "EWCore") {
      $EW = new \EWCore();
      $response_data = $EW->process($parameters);
    }
    else {
      $class_exist = false;
      //var_dump(class_exists($app_name.'\\'.  ucfirst($app_name)));
      if (class_exists($real_class_name)) {
        // Create an instance of section with its parent App
        $app_object = new $real_class_name;
        $class_exist = true;

        $response_data = $app_object->process_command($package, $resource_type, $module_name, $method_name, $parameters);
      }
      else {
        return \EWCore::log_error(404, "<h4>App not found</h4><p>Requested app `$package`, not found</p>");
      }
    }

    return $response_data;
  }

  public static function create_arguments($method, $parameters = [], $response) {
    $arguments = $method->getParameters();
    $method_arguments = array();

    if (is_array($parameters)) {
      foreach ($parameters as $par => $value) {
        if (preg_match('/(.*)\/(.*)/', $par, $m)) {
          if (!$parameters[$m[1]])
            $parameters[$m[1]] = [];
          $parameters[$m[1]][$m[2]] = $value;
        }
      }
    }

    foreach ($arguments as $arg) {
      $temp = null;

      if ($arg->getName() === "__response_data") {
        $method_arguments[] = $response->to_array();
        continue;
      }

      if ($arg->getName() === '_input') {
        $method_arguments[] = $parameters;
        continue;
      }

      if (isset($parameters[$arg->getName()])) {
        $temp = $parameters[$arg->getName()];
      }

      $method_arguments[] = $temp;
    }
    return $method_arguments;
  }

  /*
   * Function to import SQL for a given $file
   */

  public static function import_sql($file, $database_name = "", $delimiter = ';') {
    $database_config = include('../config/database_config.php');
    if (!$database_config['database']) {
      die("Please configure the /config/database_config.php");
    }
    // default database connection
    mysqli_report(MYSQLI_REPORT_STRICT);
    $db = new mysqli($database_config['host'], $database_config['username'], $database_config['password']);

    $lines = file($file);
    $db->begin_transaction();
    $sql = "CREATE DATABASE IF NOT EXISTS {$database_config['database']};";
    $db->query($sql);
    $db->commit();
    $sql = "USE {$database_config['database']};";
    $db->query($sql);
    $db->commit();
    foreach ($lines as $line) {
      if (substr($line, 0, 2) == '--' || $line == '') {//This IF Remove Comment Inside SQL FILE
        continue;
      }
      $op_data .= $line;
      if (substr(trim($line), -1, 1) == ';') {//Breack Line Upto ';' NEW QUERY
        $db->multi_query($op_data);
        if (!$db->commit()) {
          $db->rollback();
          return false;
        }
        $op_data = '';
      }
    }
    //$sql .= file_get_contents($file);
    //echo $sql;
    //$res = $db->multi_query($sql);
    //var_dump($db->next_result());
    return true;
  }

  public static function set_db_connection($db_con) {
    self::$db_connection = $db_con;
  }

  /**
   * Return EWCore <b>mysqli</b> database connection.
   * You must not call <code>close()</code> on this connection object.<br/>
   * If you need new connection object use global function <code>get_db_connection</code>
   * @return mysqli
   */
  public static function get_db_connection() {
    $database_config = include('../config/database_config.php');
    // default database connection
    mysqli_report(MYSQLI_REPORT_STRICT);

    $db = new mysqli($database_config['host'], $database_config['username'], $database_config['password']);
    $result = $db->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{$database_config['database']}'");

    if ($result->num_rows !== 1) {
      include "/install/index.php";
      die();
    }

    $db = new mysqli($database_config['host'], $database_config['username'], $database_config['password'], $database_config['database']);
    //var_dump($db->connect_errno);
    if ($db->connect_errno) {
      return static::log_error(500, "Failed to connect to MySQL: () ");
    }
    $db->set_charset("utf8");
    static::$db_connection = $db;

    return self::$db_connection;
  }

  public static function get_db_PDO() {
    $database_config = include('../config/database_config.php');
    // default database connection
    $dsn = 'mysql:dbname=' . $database_config['database'] . ';host=' . $database_config['host'] . ';charset=utf8';
    $user = $database_config['username'];
    $password = $database_config['password'];



    try {
      $pdo = new \PDO($dsn, $user, $password);

      $result = $pdo->prepare("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?");
      $result->execute([$database_config['database']]);

      if ($result->rowCount() !== 1) {
        include "/install/index.php";
        die();
      }
    }
    catch (Exception $e) {
      print_r($e);
      die();
    }
    return $pdo;
  }

  protected function get_current_method_args() {
    return $this->current_method_args;
  }

  public function get_page_content($page) {
    ob_start();
    include $page;
    return ob_get_clean();
  }

  public static function get_action_registry() {
    self::init_packages();
    return self::$action_registry;
  }

  public static function get_users_premissions() {

    return $_SESSION["EW.USERS_PREMISSION"];
  }

  public static function get_apps($type = "app") {
    $path = EW_PACKAGES_DIR . '/';

    $apps_dirs = opendir($path);
    $apps = array();

    /* while ($app_dir = readdir($apps_dirs))
      {
      if (strpos($app_dir, '.') === 0)
      continue;

      $app_dir_content = opendir($path . $app_dir);

      while ($file = readdir($app_dir_content))
      {

      if (strpos($file, '.') === 0)
      continue;
      //$i = strpos($file, '.ini');

      if ($file === 'config.ini')
      {
      $apps[] = parse_ini_file($path . $app_dir . '/' . $file);
      }
      }
      } */
    while ($app_dir = readdir($apps_dirs)) {
      if (strpos($app_dir, '.') === 0)
        continue;

      if (!is_dir($path . $app_dir))
        continue;

      $app_dir_content = opendir($path . $app_dir);

      while ($file = readdir($app_dir_content)) {

        if (strpos($file, '.') === 0)
          continue;
        //$i = strpos($file, '.ini');

        if (strpos($file, ".app.php") != 0) {
          require_once EW_PACKAGES_DIR . "/" . $app_dir . "/" . $file;
          $app_class_name = $app_dir . "\\" . substr($file, 0, strpos($file, "."));
          //echo EW_PACKAGES_DIR . "/" . $app_dir . "/" . $file;
          $app_object = new $app_class_name();
          if ($type == "all") {
            $apps[] = $app_object->get_app_details();
          }
          else if ($app_object->get_type() == $type) {
            $apps[] = $app_object->get_app_details();
          }
        }
      }
    }
    return json_encode($apps);
  }

  /**
   * 
   * @param type $appDir
   * @return \Module
   */
  public static function get_app_instance($appDir) {
    $path = EW_PACKAGES_DIR . "/$appDir";

    $app_dir_content = opendir($path);

    while ($file = readdir($app_dir_content)) {

      if (strpos($file, '.') === 0)
        continue;
      //$i = strpos($file, '.ini');

      if (strpos($file, ".app.php") != 0) {
        require_once EW_PACKAGES_DIR . "/" . $appDir . "/" . $file;
        $app_class_name = $appDir . "\\" . substr($file, 0, strpos($file, "."));
        //echo EW_PACKAGES_DIR . "/" . $app_dir . "/" . $file;
        return new $app_class_name();
      }
    }
  }

  /**
   * 
   * @param type $appDir
   * @return \Module
   */
  public static function get_app($app_name) {
    return self::$APPS[$app_name];
  }

  private function save_setting($key = null, $value = null) {
    $db = \EWCore::get_db_connection();

    $setting = $db->query("SELECT * FROM ew_settings WHERE `key` = '$key' ") or die($db->error);
    if ($user_info = $setting->fetch_assoc()) {
      $db->query("UPDATE ew_settings SET value = '$value' WHERE `key` = '$key' ") or die($db->error);
      return TRUE;
    }
    else {
      $db->query("INSERT INTO ew_settings(`key`, `value`) VALUES('$key','$value')") or die($db->error);
      return TRUE;
    }
    return FALSE;
  }

  public function save_settings($params) {
    $params = json_decode(stripslashes($params), TRUE);
    foreach ($params as $key => $value) {
      if (!$this->save_setting("ew/" . $key, $value))
        return json_encode([
            status  => "error",
            message => "Configurations has NOT been saved, Please try again"
        ]);
    }

    return json_encode([
        status  => "success",
        message => "Configurations has been saved succesfully"
    ]);
  }

  public static function read_settings($app) {
    $db = \EWCore::get_db_connection();
    if ($app)
      $app .='/%';

    $setting = $db->query("SELECT * FROM ew_settings WHERE `key` LIKE '$app'") or die($db->error);
    $rows = array();
    while ($r = $setting->fetch_assoc()) {
      // Remove the 'app/' part from the key
      $key = substr($r["key"], strlen($app) - 1);
      $rows[$key] = $r["value"];
    }
    $db->close();
    return json_encode($rows);
  }

  public static function read_setting($key) {
    $db = \EWCore::get_db_connection();
    if (!$key)
      $key = $db->real_escape_string($_REQUEST["key"]);
    $setting = $db->query("SELECT * FROM ew_settings WHERE `key` = '$key'") or die($db->error);

    while ($r = $setting->fetch_assoc()) {
      return $r["value"];
    }

    //$out = array("totalRows" => $setting->num_rows, "result" => $rows);
    return FALSE;
  }

  private static $existed_classes = array();

  public static function init_packages() {
    if (!self::$loaders_installed) {
      spl_autoload_register([
          self,
          'autoload_core']);
      self::$loaders_installed = true;
    }

    if (self::$plugins_initialized) {
      return;
    }

    $apps_dirs = opendir(EW_PACKAGES_DIR);
    $apps = array();
    while ($app_dir = readdir($apps_dirs)) {
      if (strpos($app_dir, '.') === 0)
        continue;

      $package = str_replace('-', '_', $app_dir);


      if (is_dir($app_dir)) {
        $app_dir_content = opendir($app_dir);

        //echo EW_PACKAGES_DIR . '/' . $app_dir . "\\App" . "<br/>";
        if (!file_exists(EW_PACKAGES_DIR . "/" . $app_dir . "/App.app.php"))
          continue;
        try {
          require_once EW_PACKAGES_DIR . "/" . $app_dir . "/App.app.php";
          $app_class_name = $package . "\\App";

          self::$APPS[$package] = new $app_class_name();
        }
        catch (Exception $ex) {
          echo $ex->getTraceAsString();
        }
      }
    }

    foreach (self::$APPS as $key => $app) {
//      echo $app->get_root() . "/App.app.php <br>";
      $app->init_app();
    }
    // Optimization tip
    self::$plugins_initialized = true;
  }

  public static function is_url_exist($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($code == 200) {
      $status = true;
    }
    else {
      $status = false;
    }
    curl_close($ch);
    return $status;
  }

  public static function set_parameter() {
    
  }

  //public function get_category   

  public function get_page() {
    $path = EW_PACKAGES_DIR . '/' . $this->request["_app_name"] . '/sections/' . $this->request["page"];
    //echo $path;
    include_once $path;
  }

  public function get_page_from_url($app_name, $section_name, $page_name) {
    // Search in the app's root's directory
    $path = EW_PACKAGES_DIR . '/' . $app_name . '/' . $section_name . '/' . $page_name;
    if (!file_exists($path))
      $path = EW_PACKAGES_DIR . '/' . $app_name . '/sections/' . $section_name . '/' . $page_name;
    //echo $path;
    include_once $path;
  }

  private static function autoload_core($class_name) {
    if (strpos($class_name, '\\')) {
      $class_name = end(explode('\\', $class_name));
    }

    $file = EW_ROOT_DIR . 'core/' . $class_name . '.class.php';
    //echo $file."<br>";
    if (file_exists($file)) {
      require_once $file;
    }
  }

  public static function my_str_split($string) {
    $slen = strlen($string);
    for ($i = 0; $i < $slen; $i++) {
      $sArray[$i] = $string{$i};
    }
    return $sArray;
  }

  public static function no_diacritics($string) {
    //cyrylic transcription
    $cyrylicFrom = array(
        'А',
        'Б',
        'В',
        'Г',
        'Д',
        'Е',
        'Ё',
        'Ж',
        'З',
        'И',
        'Й',
        'К',
        'Л',
        'М',
        'Н',
        'О',
        'П',
        'Р',
        'С',
        'Т',
        'У',
        'Ф',
        'Х',
        'Ц',
        'Ч',
        'Ш',
        'Щ',
        'Ъ',
        'Ы',
        'Ь',
        'Э',
        'Ю',
        'Я',
        'а',
        'б',
        'в',
        'г',
        'д',
        'е',
        'ё',
        'ж',
        'з',
        'и',
        'й',
        'к',
        'л',
        'м',
        'н',
        'о',
        'п',
        'р',
        'с',
        'т',
        'у',
        'ф',
        'х',
        'ц',
        'ч',
        'ш',
        'щ',
        'ъ',
        'ы',
        'ь',
        'э',
        'ю',
        'я');
    $cyrylicTo = array(
        'A',
        'B',
        'W',
        'G',
        'D',
        'Ie',
        'Io',
        'Z',
        'Z',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'R',
        'S',
        'T',
        'U',
        'F',
        'Ch',
        'C',
        'Tch',
        'Sh',
        'Shtch',
        '',
        'Y',
        '',
        'E',
        'Iu',
        'Ia',
        'a',
        'b',
        'w',
        'g',
        'd',
        'ie',
        'io',
        'z',
        'z',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'r',
        's',
        't',
        'u',
        'f',
        'ch',
        'c',
        'tch',
        'sh',
        'shtch',
        '',
        'y',
        '',
        'e',
        'iu',
        'ia');


    $from = array(
        "Á",
        "À",
        "Â",
        "Ä",
        "Ă",
        "Ā",
        "Ã",
        "Å",
        "Ą",
        "Æ",
        "Ć",
        "Ċ",
        "Ĉ",
        "Č",
        "Ç",
        "Ď",
        "Đ",
        "Ð",
        "É",
        "È",
        "Ė",
        "Ê",
        "Ë",
        "Ě",
        "Ē",
        "Ę",
        "Ə",
        "Ġ",
        "Ĝ",
        "Ğ",
        "Ģ",
        "á",
        "à",
        "â",
        "ä",
        "ă",
        "ā",
        "ã",
        "å",
        "ą",
        "æ",
        "ć",
        "ċ",
        "ĉ",
        "č",
        "ç",
        "ď",
        "đ",
        "ð",
        "é",
        "è",
        "ė",
        "ê",
        "ë",
        "ě",
        "ē",
        "ę",
        "ə",
        "ġ",
        "ĝ",
        "ğ",
        "ģ",
        "Ĥ",
        "Ħ",
        "I",
        "Í",
        "Ì",
        "İ",
        "Î",
        "Ï",
        "Ī",
        "Į",
        "Ĳ",
        "Ĵ",
        "Ķ",
        "Ļ",
        "Ł",
        "Ń",
        "Ň",
        "Ñ",
        "Ņ",
        "Ó",
        "Ò",
        "Ô",
        "Ö",
        "Õ",
        "Ő",
        "Ø",
        "Ơ",
        "Œ",
        "ĥ",
        "ħ",
        "ı",
        "í",
        "ì",
        "i",
        "î",
        "ï",
        "ī",
        "į",
        "ĳ",
        "ĵ",
        "ķ",
        "ļ",
        "ł",
        "ń",
        "ň",
        "ñ",
        "ņ",
        "ó",
        "ò",
        "ô",
        "ö",
        "õ",
        "ő",
        "ø",
        "ơ",
        "œ",
        "Ŕ",
        "Ř",
        "Ś",
        "Ŝ",
        "Š",
        "Ş",
        "Ť",
        "Ţ",
        "Þ",
        "Ú",
        "Ù",
        "Û",
        "Ü",
        "Ŭ",
        "Ū",
        "Ů",
        "Ų",
        "Ű",
        "Ư",
        "Ŵ",
        "Ý",
        "Ŷ",
        "Ÿ",
        "Ź",
        "Ż",
        "Ž",
        "ŕ",
        "ř",
        "ś",
        "ŝ",
        "š",
        "ş",
        "ß",
        "ť",
        "ţ",
        "þ",
        "ú",
        "ù",
        "û",
        "ü",
        "ŭ",
        "ū",
        "ů",
        "ų",
        "ű",
        "ư",
        "ŵ",
        "ý",
        "ŷ",
        "ÿ",
        "ź",
        "ż",
        "ž");
    $to = array(
        "A",
        "A",
        "A",
        "A",
        "A",
        "A",
        "A",
        "A",
        "A",
        "AE",
        "C",
        "C",
        "C",
        "C",
        "C",
        "D",
        "D",
        "D",
        "E",
        "E",
        "E",
        "E",
        "E",
        "E",
        "E",
        "E",
        "G",
        "G",
        "G",
        "G",
        "G",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "ae",
        "c",
        "c",
        "c",
        "c",
        "c",
        "d",
        "d",
        "d",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "g",
        "g",
        "g",
        "g",
        "g",
        "H",
        "H",
        "I",
        "I",
        "I",
        "I",
        "I",
        "I",
        "I",
        "I",
        "IJ",
        "J",
        "K",
        "L",
        "L",
        "N",
        "N",
        "N",
        "N",
        "O",
        "O",
        "O",
        "O",
        "O",
        "O",
        "O",
        "O",
        "CE",
        "h",
        "h",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "i",
        "ij",
        "j",
        "k",
        "l",
        "l",
        "n",
        "n",
        "n",
        "n",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "R",
        "R",
        "S",
        "S",
        "S",
        "S",
        "T",
        "T",
        "T",
        "U",
        "U",
        "U",
        "U",
        "U",
        "U",
        "U",
        "U",
        "U",
        "U",
        "W",
        "Y",
        "Y",
        "Y",
        "Z",
        "Z",
        "Z",
        "r",
        "r",
        "s",
        "s",
        "s",
        "s",
        "B",
        "t",
        "t",
        "b",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "w",
        "y",
        "y",
        "y",
        "z",
        "z",
        "z");


    $from = array_merge($from, $cyrylicFrom);
    $to = array_merge($to, $cyrylicTo);

    $newstring = str_replace($from, $to, $string);
    return $newstring;
  }

  public static function remove_duplicates($sSearch, $sReplace, $sSubject) {
    $i = 0;
    do {

      $sSubject = str_replace($sSearch, $sReplace, $sSubject);
      $pos = strpos($sSubject, $sSearch);

      $i++;
      if ($i > 100) {
        die('removeDuplicates() loop error');
      }
    }
    while ($pos !== false);

    return $sSubject;
  }

  public static function make_slugs($string, $maxlen = 0) {
    $newStringTab = array();
    $string = strtolower(self::no_diacritics($string));
    if (function_exists('str_split')) {
      $stringTab = str_split($string);
    }
    else {
      $stringTab = self::my_str_split($string);
    }

    $numbers = array(
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "-");
    //$numbers=array("0","1","2","3","4","5","6","7","8","9");

    foreach ($stringTab as $letter) {
      if (in_array($letter, range("a", "z")) || in_array($letter, $numbers)) {
        $newStringTab[] = $letter;
        //print($letter);
      }
      elseif ($letter == " ") {
        $newStringTab[] = "-";
      }
    }

    if (count($newStringTab)) {
      $newString = implode($newStringTab);
      if ($maxlen > 0) {
        $newString = substr($newString, 0, $maxlen);
      }

      $newString = self::remove_duplicates('--', '-', $newString);
    }
    else {
      $newString = '';
    }

    return $newString;
  }

  public static function to_slug($title, $table_name, $field_name = "slug") {
    $db = \EWCore::get_db_connection();
    $slug = self::make_slugs($title);
    //echo $slug;
    $query = "SELECT COUNT(*) AS NumHits FROM $table_name WHERE  $field_name  LIKE '$slug%'";
    $result = $db->query($query) or die($db->error);
    $row = $result->fetch_assoc();
    $numHits = $row['NumHits'];

    return ($numHits > 0) ? ($slug . '-' . $numHits) : $slug;
  }

  /** Add a ui component to the specified place holder
   * 
   * @param String $name place holder id 
   * @param String $id  
   * @param Array $conf can vary depends on the place holder
   */
  public static function register_form($name, $id, $conf) {
    EWCore::register_object($name, $id, $conf);
  }

  public static function register_permission($app_pack_name, $module_name, $id, $app_title, $section_title, $description, $permissions = array()) {
    $permission_group = "$app_pack_name.$module_name";
    if (!array_key_exists($app_pack_name, self::$permissions_groups)) {
      self::$permissions_groups[$app_pack_name] = array(
          "appTitle" => $app_title,
          "section"  => array());
    }
    if (!array_key_exists($module_name, self::$permissions_groups[$app_pack_name]["section"])) {
      self::$permissions_groups[$app_pack_name]["section"][$module_name] = array(
          "sectionTitle" => $section_title,
          "permission"   => array());
    }
    // If permissions for the specified id is null then initilize it
    $permission_info = array(
        "description" => $description,
        "methods"     => array());
    if (!array_key_exists($id, self::$permissions_groups[$app_pack_name]["section"][$module_name]["permission"])) {
      self::$permissions_groups[$app_pack_name]["section"][$module_name]["permission"][$id] = $permission_info;
    }

    $permission_info["methods"] = array_merge($permission_info["methods"], array_map(function($str) {
              return str_replace('_', '-', $str);
            }, $permissions
    ));
    self::$permissions_groups[$app_pack_name]["section"][$module_name]["permission"][$id] = $permission_info;
  }

  public static function register_public_access($app_pack_name, $module_name, $methods = array()) {
    $permission_group = "$app_pack_name/$module_name";

    $methods = array_map(function($str) {
      return str_replace('_', '-', $str);
    }, $methods);


    self::$no_permission_needed[$permission_group] = $methods;
  }

  public static function register_category($id, $categories = array()) {
    EWCore::register_object("ew-category", $id, $categories);
  }

  public static function register_resource($id, $function) {
    EWCore::register_object("ew-resource", $id, $function);
  }

  public static function read_activities() {
    return json_encode(static::read_activities_as_array());
  }

  public static function read_activities_as_array() {
    EWCore::init_packages();
    $pers = self::$permissions_groups;
    $allowed_activities = array();

    foreach ($pers as $app_name => $sections) {
      foreach ($sections["section"] as $section_name => $sections_permissions) {
        foreach ($sections_permissions["permission"] as $permission_name => $permission_info) {
          if (admin\UsersManagement::group_has_permission($app_name, $section_name, [$permission_name], $_SESSION['EW.USER_GROUP_ID'])) {
            foreach ($permission_info["methods"] as $method) {
              $parts = explode('/', $method, 2);
              if (count($parts) < 2) {
                //throw new Exception("Activity name is wrong");
                return EWCore::log_error('500', 'Wrong actovity name', ["$app_name | $section_name | $method_name"]);
              }
              $resource_name = $parts[0];
              $method_name = $parts[1];

              $title = $method_name;

              if (strpos($method_name, ':')) {
                $temp = explode(':', $method_name, 2);
                $method_name = $temp[0];
                $title = $temp[1];
              }

              $is_form = (strpos($method_name, '.php') && $method_name !== "index.php") ? true : false;
              $url = $is_form ? EW_ROOT_URL . '~' . $app_name . '/' . $resource_name . "/" . $section_name . "/" . $method_name : EW_ROOT_URL . '~' . $app_name . '/' . $resource_name . "/" . $section_name . "/" . $method_name;
              //echo $url;
              $allowed_activities["$app_name/$resource_name/$section_name/$method_name"] = [
                  "activityTitle" => $title,
                  "app"           => $app_name,
                  "appTitle"      => "tr:$app_name{" . $sections["appTitle"] . "}",
                  "section"       => $section_name,
                  "sectionTitle"  => "tr:$app_name{" . $sections_permissions["sectionTitle"] . "}",
                  "url"           => $url,
                  "form"          => $is_form
              ];
            }
          }
        }
      }
    }

    return $allowed_activities;
  }

  /**
   * 
   * @param type $registry_id registery id
   * @param type $id id of current item
   * @param type $object
   */
  public static function register_object($registry_id, $id, $object = array()) {
    if (!array_key_exists($registry_id, self::$registry)) {
      self::$registry[$registry_id] = array();
    }

    self::$registry[$registry_id][$id] = $object;
  }

  /**
   * 
   * @param type $registry_id registery id
   * @param type $id id of current item
   * @param type $handler
   */
  public static function register_handler($action_name, $handler = []) {
    $registry_id = $action_name;
    if (!array_key_exists($registry_id, self::$registry)) {
      self::$registry[$registry_id] = array();
    }

    self::$registry[$registry_id][] = $handler;
  }

  public static function deregister($name, $id = null) {
    if (!$id) {
      unset(self::$registry[$name]);
    }
    else
      unset(self::$registry[$name][$id]);
  }

  public static function read_registry($name) {
    EWCore::init_packages();
    return isset(self::$registry[$name]) ? self::$registry[$name] : [];
  }

  public static function read_registry_as_array($name) {
    EWCore::init_packages();

    $properties = isset(self::$registry[$name]) ? self::$registry[$name] : [];

    if ($name === '*') {
      $properties = self::$registry;
    }

    $result = [];
    foreach ($properties as $property => $data) {
      $data['__registry_id'] = $property;
      $result[] = $data;
    }

    return $result;
  }

  public static function read_registry_as_json($name, $option = 0) {
    return json_encode(static::read_registry_as_array($name, $option));
  }

  public static function get_registry($_parts) {
    return json_encode(static::read_registry($_parts[0]));
  }

  /**
   * Returns the list of registred categories.
   * 
   */
  public static function read_category_registry() {
    EWCore::init_packages();
    return self::$registry["ew-category"];
  }

  public static function read_permissions() {
    return json_encode(static::read_permissions_as_array());
  }

  public static function read_permissions_as_array() {
    EWCore::init_packages();
    return self::$permissions_groups;
  }

  public static function read_permissions_titles() {
    EWCore::init_packages();
    $pers = self::$permissions_groups;
    $permissions_titles = array();
    foreach ($pers as $app_name => $sections) {
      $permissions_titles[$app_name] = [
          "appTitle" => $sections["appTitle"]
      ];
      foreach ($sections["section"] as $section_name => $sections_permissions) {
        $permissions_titles[$app_name]["section"][$section_name] = ["sectionTitle" => $sections_permissions["sectionTitle"]];
        foreach ($sections_permissions["permission"] as $permission_name => $permission_info) {
          $permissions_titles[$app_name]["section"][$section_name]["permission"][$permission_name] = [
              "parent"      => "$app_name.$section_name",
              "title"       => $permission_name,
              "description" => $permission_info["description"]
          ];
        }
      }
    }
    return $permissions_titles;
  }

  public static function read_permissions_ids() {
    EWCore::init_packages();
    $pers = self::$permissions_groups;
    $permissions_ids = array();
    foreach ($pers as $app_name => $sections) {

      foreach ($sections["section"] as $section_name => $sections_permissions) {
        foreach ($sections_permissions["permission"] as $permission_name => $permission_info) {
          $permissions_ids[] = $app_name . "." . $section_name . "." . $permission_name;
        }
      }
    }
    return $permissions_ids;
  }

  public static function has_permission($app_name, $class_name) {
    EWCore::init_packages();

    $pers = self::$permissions_groups[$app_name . "." . $class_name];
    //$permissions_titles = array();
    foreach ($pers as $key => $value) {
      foreach ($value["methods"] as $method) {
        if ($method_name === $method)
          return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Check if the command needs permission
   * @param type $app_name
   * @param type $module_name
   * @param type $method_name
   * @return mixed <b>FALSE</B> if there is no need for any permission or <b>permissionId</b> if there is need for permission
   */
  public static function does_need_permission($app_name, $module_name = null, $method_name = null) {
    EWCore::init_packages();

    if (isset(self::$no_permission_needed["$app_name/$module_name"]) && in_array($method_name, self::$no_permission_needed["$app_name/$module_name"]))
      return "public-access";

    $pers = isset(self::$permissions_groups[$app_name]) ? self::$permissions_groups[$app_name]["section"] : false;

    if ($module_name === null) {
      return $pers ? true : false;
    }

    if ($pers)
      $pers = $pers[$module_name]["permission"];
    //$permissions_titles = array();

    $result = array();
    $flag = false;
    if (is_array($pers)) {
      foreach ($pers as $key => $value) {

        foreach ($value["methods"] as $method) {
          //echo $method." -> $method_name<br>";
          //if(strpos(':', $method))
          //explode(':', $method);
          if ($method_name === $method) {
            $result[] = $key;
            $flag = true;
            //return $key;
          }
        }
      }
    }

    if ($flag) {
      return $result;
    }
    return FALSE;
  }

  public static function register_app($id, $object) {
    return static::register_object(static::$EW_APP, $id, $object);
  }

  public static function read_apps_sections() {
    $apps_list = static::read_registry(static::$EW_APP);
    $apps = [];
    foreach ($apps_list as $app) {
      $apps[] = array(
          "title"       => "tr:{$app->get_app()->get_root()}" . "{" . $app->get_title() . "}",
          "package"     => '~' . $app->get_app()->get_root(),
          "module"      => EWCore::camelToHyphen($app->get_section_name()),
          "file"        => "index.php",
          "className"   => $app->get_section_name(),
          "id"          => EWCore::camelToHyphen($app->get_section_name()),
          "url"         => '~' . $app->get_app()->get_root() . '/' . EWCore::camelToHyphen($app->get_section_name()) . '/index.php',
          "description" => "tr:{$app->get_app()->get_root()}" . "{" . $app->get_description() . "}");
    }

    return json_encode($apps);
  }

  public static function register_action($name, $id, $function = null, $object) {
    if (!is_array(self::$action_registry[$name])) {
      self::$action_registry[$name] = array();
    }

    self::$action_registry[$name][$id] = array(
        "function" => $function,
        "class"    => $object);
  }

  public static function deregister_action($name, $id) {

    unset(self::$action_registry[$name][$id]);
  }

  public static function read_actions_registry($name) {
    EWCore::init_packages();
    return self::$action_registry[$name];
  }

  public static function get_default_users_group() {
    return admin\UsersManagement::get_users_group_by_type("default");
  }

  /* public static function validate($rules = array())
    {

    } */

  public static function parse_css($path, $className = "panel") {
    if (isset($_REQUEST["path"])) {
      $path = $_REQUEST["path"];
    }

    //Grab contents of css file
    $file = file_get_contents($path);

    //Strip out everything between { and }
    //$pattern_one = '/(?<=\{)(.*?)(?=\})/';
    //Match any and all selectors (and pseudos)
    $pattern_two = '/(div)?(\.' . $className . '\.)+[\w-]+/';

    //Run the first regex pattern on the input
    //Variable to hold results
    $selectors = array();

    //Run the second regex pattern on $stripped input
    $matches = preg_match_all($pattern_two, $file, $selectors);
    //Show the results
    asort($selectors[0]);
    return json_encode(array_unique($selectors[0]));
  }

  //put your code here

  public function save_app_config($assoc_arr, $app_dir, $has_sections = FALSE) {
    if (!isset($assoc_arr)) {
      $assoc_arr = $_REQUEST["params"];
    }
    if (!isset($app_dir))
      $app_dir = $this->request['appDir'];
    $path = EW_PACKAGES_DIR . '/';
    $file_path = $path . $app_dir . '/config.ini';
    $oldConf = json_decode($this->get_app_config($app_dir), true);
    $arr = json_decode($assoc_arr, true);
    $res = array_replace_recursive($oldConf, $arr);
    if ($this->write_php_ini($res, $file_path))
      return json_encode(array(
          status  => "success",
          message => "App configurations has been saved succesfully"));
    else
      return json_encode(array(
          status  => "error",
          message => "App configurations has NOT been saved, Please try again"));
  }

  function write_php_ini($assoc_arr, $path, $has_sections = FALSE) {
    //print_r($assoc_arr);
    $content = "";

    if ($has_sections) {
      foreach ($assoc_arr as $key => $elem) {
        $content .= "[" . $key . "]\n";
        foreach ($elem as $key2 => $elem2) {
          if (is_array($elem2)) {
            for ($i = 0; $i < count($elem2); $i++) {
              $content .= $key2 . "[] = \"" . $elem2[$i] . "\"\n";
            }
          }
          else if ($elem2 == "")
            $content .= $key2 . " = \n";
          else
            $content .= $key2 . " = \"" . $elem2 . "\"\n";
        }
      }
    }
    else {
      foreach ($assoc_arr as $key => $elem) {
        if (is_array($elem)) {
          for ($i = 0; $i < count($elem); $i++) {
            $content .= $key . "[] = \"" . $elem[$i] . "\"\n";
          }
        }
        else if ($elem == "")
          $content .= $key . " = \n";
        else
          $content .= $key . " = \"" . $elem . "\"\n";
      }
    }

    if (!$handle = fopen($path, 'w')) {
      return false;
    }
    if (!fwrite($handle, $content)) {
      return false;
    }
    fclose($handle);
    return true;
  }

  public static function get_comment_parameter($param, $filename) {
    if (!file_exists($filename)) {
      return null;
    }
    $source = file_get_contents($filename);
    $tokens = token_get_all($source);
    foreach ($tokens as $token) {
      if ($token[0] == T_COMMENT) {
        //$matches[] = $token[1];
        preg_match('/' . $param . ':\s?([^\n\r]*)/', $token[1], $matches);
        return $matches[1];
      }
    }
  }

  public static function get_comment_parameters($param, $source) {

    $tokens = token_get_all($source);
    foreach ($tokens as $token) {
      if ($token[0] == T_COMMENT) {
        //$matches[] = $token[1];
        preg_match('/' . $param . ':\s?([^\n\r]*)/', $token[1], $matches);
        return $matches[1];
      }
    }
  }

  private static $apps_locales = "admin";

  public static function set_default_locale($app_name) {
    /* if (!array_key_exists($app_name, self::$apps_locales))
      {
      //echo "-$app_name:";
      self::$apps_locales[] = $app_name;
      } */
    //echo $app_name."*-*-*-";
    self::$apps_locales = $app_name;
  }

  public static function get_app_languages($app) {
    $path = EW_PACKAGES_DIR . "/" . $app . "/locale/";
//echo $path;
    if (!file_exists($path))
      return;
    $locale_dir = opendir($path);
    $languages = array();

    while ($language_file = readdir($locale_dir)) {
      if (strpos($language_file, '.') === 0)
        continue;
      if (strpos($language_file, ".json")) {
        $lang_file = json_decode(file_get_contents(EW_PACKAGES_DIR . '/' . $app . '/locale/' . $language_file), true);
        $languages[$language_file] = $lang_file["conf"];
        //echo $lang_file["conf"]["name"];
      }
    }
    return json_encode($languages);
  }

  private static $languages_strings = null;

  public static function translate_to_locale($match, $language) {
    //global $app_name;

    if ($language == "en") {
      return $match[2];
    }
    $source_app_name = self::$apps_locales;
    $not_translated = array();
    if ($match[1]) {
      $source_app_name = substr($match[1], 1);
    }
    //echo ("-$source_app_name-");
    if (!self::$languages_strings && file_exists(EW_PACKAGES_DIR . '/' . $source_app_name . '/locale/' . $language . '.json')) {
      //$lang_file = parse_ini_file(EW_PACKAGES_DIR . '/' . $app_name . '/locale/' . $language . '.ini', true);
      $lang_file = json_decode(file_get_contents(EW_PACKAGES_DIR . '/' . $source_app_name . '/locale/' . $language . '.json'), true);

      self::$languages_strings = $lang_file["strings"];
    }

    /* if (!array_key_exists($match[2], self::$languages_strings))
      {
      echo$match[2] . "<br/>";
      self::$languages_strings[$match[2]] = "";
      $lang_file["strings"] = self::$languages_strings;
      $fp = file_put_contents(EW_PACKAGES_DIR . '/' . $source_app_name . '/locale/' . $language . '.json', json_encode($lang_file, JSON_UNESCAPED_UNICODE));
      }
      else */if (self::$languages_strings[$match[2]]) {
      return self::$languages_strings[$match[2]];
    }

    return $match[2];
  }

  private static $rtl_languages = ["fa",
      "ar"];

  public static function get_language_dir($language) {
    if (array_search($language, static::$rtl_languages) !== false) {
      return "rtl";
    }
    else {
      return "ltr";
    }
  }

  //public static $error_occuered = false;
  /**
   * 
   * @param int $header_code Http error code
   * @param string $message A string that represent the error message
   * @param array $reason An array that contains the reason(s) that cause error 
   * @return type
   */
  public static function log_error($header_code = 400, $message, $reason = NULL, $send_header = TRUE) {
    if ($send_header) {
      http_response_code($header_code);
      header('Content-Type: application/json');
    }
    $error_content = [
        "statusCode"  => $header_code,
        "status_code" => $header_code,
        "code"        => $header_code,
        //"url" => $_REQUEST["_app_name"] . "/" . $_REQUEST["_section_name"] . "/" . $_REQUEST["_function_name"],
        "url"         => $_SERVER["REQUEST_URI"],
        "message"     => $message,
        "reason"      => $reason
    ];
    /* if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')
      { */

    return json_encode($error_content);
    /* }
      else
      {
      return "<h2>Error No: $header_code</h2><p>$message</p>";
      } */
  }

  public static function process_content_component($action, $id, $content_id, $content_data, $label_data) {
//      if(class_exists($class_name))
  }

  public static function load_file($path, $form_config = null) {
    $full_path = EW_PACKAGES_DIR . '/' . $path;
    if (!file_exists($path)) {
      return \EWCore::log_error(404, "<h4>File not found</h4><p>File `$path`, not found</p>");
    }
    ob_start();
    include $full_path;
    return ob_get_clean();
  }

  public static function hyphenToCamel($val) {
    $val = str_replace(' ', '', ucwords(str_replace('-', ' ', $val)));
    $val = substr($val, 0);
    return $val;
  }

  public static function camelToHyphen($val) {
    return str_replace('_', '-', strtolower(preg_replace('/([a-zA-Z])(?=[A-Z])/', '$1-', $val)));
  }

  public static function camel_to_hyphen($val) {
    return str_replace('_', '-', strtolower(preg_replace('/([a-zA-Z])(?=[A-Z])/', '$1-', $val)));
  }

  public static function get_view($path, $view_data = []) {
    $full_path = EW_PACKAGES_DIR . '/' . $path;

    if (!file_exists($full_path)) {
      return \EWCore::log_error(404, "<h4>View: File not found</h4><p>File `$full_path`, not found</p>");
    }

    ob_start();
    include $full_path;
    $html = ob_get_clean();

    return static::populate_view($html, $view_data);
  }

  public static function populate_view($view_html, $view_data) {
    return preg_replace_callback("/\{\{([\w]*)\}\}/", function($match) use ($view_data) {
      $data = $view_data[$match[1]];
      return isset($data) ? $data : $match[0];
    }, $view_html);
  }

  public static function testy($path) {
    echo var_dump($_REQUEST);
    return var_dump(static::call($path));
  }

  public static function file_force_contents($dir, $contents) {
    $parts = explode('/', $dir);
    $file = array_pop($parts);
    $dir = '';
    foreach ($parts as $part) {
      if (!is_dir($dir .= "$part/")) {
        mkdir($dir);
      }
    }

    file_put_contents("$dir/$file", $contents);
  }

  public static function create_table($table, $fields) {

    $sql = "CREATE TABLE IF NOT EXISTS `$table` (";
    $pk = '';

    foreach ($fields as $field => $type) {
      $sql.= "`$field` $type,";

      if (preg_match('/AUTO_INCREMENT/i', $type)) {
        $pk = $field;
      }
    }

    $sql = rtrim($sql, ',') /* . ', PRIMARY KEY (`' . $pk . '`)' */;

    $sql .= ") CHARACTER SET utf8 COLLATE utf8_general_ci";
    return $sql;
  }

  public static function is_list($array) {
    return count(array_filter(array_keys($array), 'is_string')) > 0;
  }

}
