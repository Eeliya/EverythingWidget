<?phpsession_start();//echo $widget_style_class;//\admin\WidgetsManagement::set_widget_style_class("list-viewer");$feeder = json_decode($widget_parameters["feeder"], TRUE);$feeder_id = $feeder["type"];$id = $feeder["id"];if (!$feeder_id)   return;//$list = json_decode($widget_parameters["list"], TRUE);if ($widget_parameters["default-content"] == "yes"){   if ($_REQUEST["_page"])   {      $feeder_id = $_REQUEST["_page"];   }}$token = $_REQUEST["$feeder_id-token"];$num_of_items_per_page = 10;if (!$token)   $token = 0;$row_num = ($token * $num_of_items_per_page) + $num_of_items_per_page;$items_list = EWCore::get_widget_feeder("list", $feeder_id, [$id, $token * $num_of_items_per_page, $num_of_items_per_page]);$items_list = json_decode($items_list, TRUE);$items_count = $items_list["num_rows"];$items = $items_list["items"];$page = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);if ($items_list["header"])   echo $items_list["header"];if ($widget_parameters["show_top_buttons"]){   echo "<div class='row list-header'><div class='col-xs-12'>";   echo ($token > 0) ? "<a href='$page?$feeder_id-token=" . ($token - 1) . " class='btn btn-link btn-perv'>{Pervious}</a>" : "";   echo ($row_num < $items_count) ? "<a href='$page?$feeder_id-token=" . ($token + 1) . " class='btn btn-link btn-perv'>tr{Next}</a>" : "";   echo "</div></div>";}?><div class="row list-content">   <div class="col-xs-12">      <div class="row">         <?php         $index = 1;         foreach ($items as $item)         {            //$row_seprator = false;            echo "<div class='item col-xs-{$widget_parameters["col-xs-"]} col-sm-{$widget_parameters["col-sm-"]} col-md-{$widget_parameters["col-md-"]} col-lg-{$widget_parameters["col-lg-"]} {$item["class"]}' style='{$item["style"]}'>"            . "{$item["html"]}"            . "</div>";            if (($index * $widget_parameters["col-sm-"]) % 12 == 0)            {               echo "<div class='col-xs-12 pull-left hidden-xs hidden-md hidden-lg'></div>";            }            if (($index * $widget_parameters["col-md-"]) % 12 == 0)            {               echo "<div class='col-xs-12 pull-left hidden-xs hidden-sm hidden-lg'></div>";            }            if (($index * $widget_parameters["col-lg-"]) % 12 == 0)            {               echo "<div class='col-xs-12 pull-left hidden-xs hidden-sm hidden-md'></div>";            }            $index++;         }         ?>      </div>   </div></div><?phpif ($widget_parameters["show_bottom_buttons"]){   echo "<div class='row list-footer'><div class='col-xs-12'>";   echo ($token > 0) ? "<a href='$page?$feeder_id-token=" . ($token - 1) . " class='btn btn-link btn-perv'>{Pervious}</a>" : "";   echo ($row_num < $items_count) ? "<a href='$page?$feeder_id-token=" . ($token + 1) . " class='btn btn-link btn-perv'>tr{Next}</a>" : "";   echo "</div></div>";}