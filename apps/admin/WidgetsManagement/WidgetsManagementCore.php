<?phpsession_start();function getUIStructuresList(){        return mysql_query("SELECT * FROM ui_structures");}function getWidgetsTypes(){    return mysql_query("SELECT * FROM widget_types");}function getWidgetType($widgetTypeId){    return mysql_fetch_array(mysql_query("SELECT * FROM widget_types WHERE id = '$widgetTypeId'"));}function getWidgets(){    return mysql_query("SELECT * FROM widgets");}function getWidget($widgetId){  /*$widgetHTML="";    $widgetInfo =  mysql_fetch_array(mysql_query("SELECT * FROM widgets WHERE id = '$widgetId'"));    if($widgetInfo)    {      $widgetHTML +="<div id=". $widgetInfo['style_id'] ." class=widget" . $wClass .">";    }*/  return mysql_fetch_array(mysql_query("SELECT * FROM ui_structures_parts WHERE id = '$widgetId'"));}function getPanels(){    return mysql_query("SELECT * FROM panels");}function getPanelsOfStructure($uiStructureId){    return mysql_query("SELECT panels.id, panels.name             FROM panels, ui_structures_parts             WHERE panels.id = ui_structures_parts.item_id             AND ui_structures_parts.item_type = 'panel'             AND ui_structures_parts.ui_structure_id = '$uiStructureId'");}function getPanel($panelId){    return mysql_fetch_array(mysql_query("SELECT * FROM panels WHERE id = '$panelId'"));}?>