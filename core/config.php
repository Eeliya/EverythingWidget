<?phpdefine('EW_DIR', '/EverythingWidget/');define('EW_ROOT_DIR', $_SERVER["DOCUMENT_ROOT"] . EW_DIR);define('EW_APPS_DIR', EW_ROOT_DIR . 'apps');define('EW_TEMPLATES_DIR', EW_ROOT_DIR . 'templates');define('EW_WIDGETS_DIR', EW_ROOT_DIR . 'widgets');define('EW_MEDIA_DIR', EW_ROOT_DIR . 'media');define('HOST_URL', 'http://' . $_SERVER['SERVER_NAME']);$ln = ($_REQUEST["_language"]) ? $_REQUEST["_language"] . "/" : "";define('EW_ROOT_URL', 'http://' . $_SERVER['SERVER_NAME'] . '/EverythingWidget/' . $ln);function get_db_connection(){   // return an EWDatabase object   global $mysql_hostname, $mysql_user, $mysql_password, $mysql_database;   $db = new mysqli($mysql_hostname, $mysql_user, $mysql_password, $mysql_database);   $db->set_charset("utf8");   return $db;}?>