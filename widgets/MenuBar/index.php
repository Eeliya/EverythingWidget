<?phpsession_start();global $EW;$titles = $widget_parameters["title"];$links = $widget_parameters["link"];$icnons = $widget_parameters["title"];//$result = mysql_query("SELECT * FROM menus , sub_menus WHERE menus.id = sub_menus.menu_id AND menus.id = '$menuId' ORDER BY sub_menus.order") or die(mysql_error());?><ul>   <?php   if (gettype($titles) == "array")   {      for ($i = 0; $i < count($titles); $i++)      {         $sub_menus = null;         $link = json_decode($links[$i], true);         if ($link["type"] == "link")         {            $linkURL = $link["url"];         }         else if ($link["type"] == "widget-feeder")         {            $linkURL = '#';            $sub_menus = EWCore::get_widget_feeder("menu", $link["feederName"]);            $sub_menus = json_decode($sub_menus, TRUE);         }         else         {            $linkURL = EW_DIR . $link["type"] . '/' . $link["id"];         }         // Menu         ?>         <li>            <?php            echo "<a href='" . EW_DIR . "{$linkURL}'>".$titles[$i]."</a>";            // Sub menu if exist            if ($sub_menus)            {               echo "<ul>";               foreach ($sub_menus as $sub_menu)               {                  echo "<li><a href='" . EW_DIR . "{$sub_menu["link"]}'>{$sub_menu["title"]}</a></li>";               }               echo "</ul>";            }            ?>         </li>         <?php      }   }   else   {      $link = json_decode($links, true);      if ($link["type"] == "link")         $linkURL = $link["url"];      else if ($link["type"] == "widget-feeder")      {         $linkURL = '#';         $sub_menus = EWCore::get_widget_feeder("menu", $link["feederName"]);         $sub_menus = json_decode($sub_menus, TRUE);      }      else         $linkURL = EW_DIR . $link["type"] . '/' . $link["id"];      ?>      <li>         <?php         echo "<a href='" . EW_DIR . "{$linkURL}'>";         echo $titles . "</a>";         if ($sub_menus)         {            echo "<ul>";            foreach ($sub_menus as $sub_menu)            {               echo "<li><a href='" . EW_DIR . "{$sub_menu["link"]}'>";               echo $sub_menu["title"] . "</a></li>";            }            echo "</ul>";         }         ?>      </li>      <?php   }   /* $w = -861;     while ($row = mysql_fetch_array($result))     {     $cId = split('category/', $row['path']);     ?>     <li>     <a class="Item"  href="<?php echo ($cId[1]) ? 'javascript:void(0)' : $row['path'] ?>"><?php echo $row['title'] ?></a>     <?php     $subMenus = mysql_query("SELECT * FROM contents WHERE category_id = '$cId[1]' ORDER BY contents.order") or die(mysql_error());     $w = intval($w) + 123;     if ($cId && mysql_num_rows($subMenus) > 0)     {     ?>     <ul >     <?php     while ($subMenu = mysql_fetch_array($subMenus))     {     ?>     <li><a class="Item"  href="<?php echo articleAddress($subMenu['id']) ?>"><?php echo $subMenu['title'] ?></a></li>     <?php     }     ?>     </ul>     <?php     }     ?>     </li>     <?php     } */   ?></ul><script type="text/javascript"></script>