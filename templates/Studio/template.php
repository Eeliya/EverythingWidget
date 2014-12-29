<?php

use TemplateControl;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of template
 *
 * @author Eeliya
 */
class template extends TemplateControl
{

   public function get_html_body($html_body, $template_settings)
   {
      //echo $template_settings;
      $settings = json_decode($template_settings, TRUE);
      //print_r($settings);
      $pages = json_decode($settings["pages"], true);

      $new_body = "<div class='page-slide'>" . $html_body . "</div>";
      foreach ($pages as $page)
      {
         $html = admin\WidgetsManagement::generate_view(115);
         $new_body.="<div class='page-slide' data-not-editable=true>" . $html . "</div>";
      }
      return $new_body;
   }

   public function get_template_cp()
   {
      ob_start();
      ?>
      <div class="row">
         <div class="col-xs-12 mar-top">
            <label>tr{Specify your pages}</label>
         </div>
         <div class="col-xs-12">
            <ul id="website_pages" class="list arrangeable">
               <li class="" style="">
                  <div class="wrapper">
                     <div class="handle"></div>                         
                     <input class="text-field test" data-label='Page' data-ew-plugin="link-chooser" name="link"/>
                  </div>
               </li>
            </ul>
         </div>
      </div>
      <script>
         $("#template_settings_form").on("refresh", function (e, data)
         {
            if (data.pages)
               $("#website_pages").EW().dynamicList({value: $.parseJSON(data.pages)});
            else
               $("#website_pages").EW().dynamicList();
         });
         $("#template_settings_form").on("getData", function (e)
         {
            //alert($("#website_pages").EW().dynamicList("getJSON"));
            //alert($("#website_pages").EW().dynamicList("getJSON"));
            uisForm.setTemplateSettings({pages: $("#website_pages").EW().dynamicList("getJSON")})
         });
      </script>
      <?php
      return ob_get_clean();
   }

   //put your code here
}
