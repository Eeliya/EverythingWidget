<?php

session_start();
// 05 November, 2013
// Do NOT touch this file unless you are expert in Everything Widget CMS
// All contents inside the apps directory is reached throuth this file
// parse app_name, section_name, function_name from url

ob_start();
require '../core/config.php';
require '../core/database_config.php';
require '../core/EWCore.class.php';
require '../core/modules/Valitron/Validator.php';
ob_end_clean();
if (ob_get_level())
   ob_end_clean();


$path = ltrim($_SERVER['REQUEST_URI'], '/');    // Trim leading slash(es)
if (strpos($path, '?'))
   $path = substr($path, 0, strpos($path, '?'));
$elements = explode('/', $path);
//print_r($elements);
//echo '<br/><h3>Request parameters</h3>';

$root_dir = $elements[0];
$parameter_index = 1;


// Check the language parameter
$language = "en";
if (preg_match("/^(.{2,3})$/", $elements[$parameter_index], $match))
{
   $language = $match[0];
   $parameter_index++;
}
$_REQUEST["_language"] = $language;

// Check the app parameter
$app_name = "webroot";
if (preg_match("/^app-([^\/]*)$/", $elements[$parameter_index], $match))
{
   $app_name = $match[1];
   $parameter_index++;
}
$_REQUEST["_app_name"] = $app_name;

// Check the asset parameter
if ($elements[$parameter_index] == 'asset')
{
   $app_name = 'asset';
   $_REQUEST["_app_name"] = $app_name;
   $parameter_index++;
}

// Read the section name parameter
$section_name = null;
if (isset($elements[$parameter_index]) && preg_match("/^([^\.]*)$/", $elements[$parameter_index], $match))
{
   //echo "asdsad::::".$elements[$parameter_index];
   $section_name = $elements[$parameter_index];
   $_REQUEST["_section_name"] = $section_name;

   /*$rest_of_elements = array_slice($elements, $parameter_index);
   $file_uri = implode('/', $rest_of_elements);

   $_file = $file_uri;
   $_REQUEST["_file"] = $_file;*/

   $parameter_index++;
}

// Read the function name parameter
$function_name = null;
if (isset($elements[$parameter_index]))
{
   $function_name = $elements[$parameter_index];
   $_REQUEST["_function_name"] = $function_name;

   $rest_of_elements = array_slice($elements, $parameter_index);
   $file_uri = implode('/', $rest_of_elements);
   //if (strpos($file_uri, '?'))
      //$file_uri = substr($file_uri, 0, strpos($file_uri, '?'));
   $_file = $file_uri;
   $_REQUEST["_file"] = $_file;

   $parameter_index++;
}

//print_r($_REQUEST);
//print_r($_SERVER);

// Set error reporting
error_reporting(E_ERROR);
ini_set('display_errors', '1');

EWCore::set_default_locale("admin");
EWCore::set_db_connection(get_db_connection());
//print_r($_REQUEST);
//echo $_language;
// Add slash at the end of URL
//if ($app_name == "webroot" && stripos($_SERVER['REQUEST_URI'], 'apps/' . $_file) !== false && file_exists(EW_APPS_DIR . '/' . $_file))
//{
//if ($_file == $app_name)
//   header("location: /") or die("error on redirecting");
//header("location: /" . $_file . "/") or die("error on redirecting");
//die();
//}
// Create instance of EWCore class 
global $EW;
$EW = new \EWCore();

// set default user group if no user group has been spacified
if (!isset($_SESSION["EW.USERS_GROUP"]))
{
   $_SESSION["EW.USERS_GROUP"] = EWCore::get_default_users_group();
}

// If app name is asset then call get_resource
if ($app_name == "asset")
{
   EWCore::get_resource($section_name, array($_file));
   return;
}

$r_uri = strtok($_SERVER["REQUEST_URI"], "?");
// Check if UI structure is specified
if (!isset($_REQUEST["_uis"]))
{
   if ($_file)
      $r_uri = "/" . $_REQUEST["_file"];
   $uis_data = EWCore::get_url_uis($r_uri);
   $_REQUEST["_uis"] = $uis_data["uis_id"];
   $_REQUEST["_uis_template"] = $uis_data["uis_template"];
}
else
{
   $r_uri = $_REQUEST["_uis"];
   $dbc = EWCore::get_db_connection();
   $uis = $dbc->query("SELECT * FROM ew_ui_structures WHERE id =  '$r_uri' ") or die("no UIS");
   if ($row = $uis->fetch_assoc())
   {
      $_REQUEST["_uis_template"] = $row["template"];
   }
}
$GLOBALS["page_parameters"] = explode("/", $_REQUEST["_parameters"]);
$RESULT_CONTENT = "RESULT_CONTENT: EMPTY";

$real_class_name = $app_name . '\\' . $section_name;

$path = null;

if ($app_name && $section_name && isset($function_name))
{
   $RESULT_CONTENT = EWCore::process_command($app_name, $section_name, $function_name, $_REQUEST);
}
else if ($app_name && $section_name && $_file)
{
   echo "not this place";
   //include_once $_SERVER['DOCUMENT_ROOT'] . '/apps/' . $app_name . '/' . $section_name . '/' . $_file;
}
else if ($app_name)
{
   //$pages_feeders = EWCore::read_registry("ew-widget-feeder");
   // when page  is a page widget feeder
   //if (array_key_exists("page:$_file", $pages_feeders))
   //{

      // ob_start();
      //include_once EW_APPS_DIR . '/' . $app_name . '/index.php';
      //$RESULT_CONTENT = ob_get_clean(); 
    //  $path = EW_APPS_DIR . '/' . $app_name . '/index.php';
   //}
   //else
   //{
      if (!$_file)
      {
         $_file = "index.php";
      }
      $path = EW_APPS_DIR . '/' . $app_name . '/' . $_file;
   //}
}
else
{
   $RESULT_CONTENT = "EW INDEX: Request is invalid";
}
if ($path)
{
   if (file_exists($path))
   {
      ob_start();
      include $path;
      $RESULT_CONTENT = ob_get_clean();
   }
   else
   {
      $RESULT_CONTENT = EWCore::log_error(404, "<h4>{$path}</h4><p>Check EW: FILE NOT FOUND</p>");
   }
}
$vars = get_defined_vars();
$callback = function($match) use ($vars) {
   //print_r($vars);
   $varname = $match[1];
   if ($vars[$varname])
   {
      return $vars[$varname]; // or htmlspecialchars($vars[$varname]);
   }
   else
   {
      return $match[2];
   }
};

function evaluate_string_codes($match)
{
   $vars = get_defined_vars();
   return $vars[$match[1]];
}

function translate($match)
{
   global $language;
   return EWCore::translate_to_locale($match, $language);
}

// show the result
if ($RESULT_CONTENT)
{
   //$RESULT_CONTENT = preg_replace_callback("/\{\{([^\|]*)\|?([^\|]*)\}\}/", $callback, $RESULT_CONTENT);
   // Show translated result   
   echo preg_replace_callback("/tr(\:\w*)?\{(.*?)\}/", "translate", $RESULT_CONTENT);
}

