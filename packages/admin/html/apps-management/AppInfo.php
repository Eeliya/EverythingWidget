<?php
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

if ($_REQUEST["appDir"])
{
   $app = json_decode(EWCore::get_app_config($_REQUEST["appDir"]), true);
   $class = $_REQUEST["appDir"];
   $config = "<label>Nothing to configure</label>";
   $config_file_path = EW_PACKAGES_DIR . "/" . $class . "/core/app_config.php";
   if (!file_exists($config_file_path))
   {
      $config_file_path = EW_PACKAGES_DIR . "/" . $class . "/app_config.php";
   }

   if (file_exists($config_file_path))
   {
      ob_start();
      include $config_file_path;
      $config = ob_get_clean();
   }
}
?>
<form name="settings-form" id="settings-form">
   <div class="tab-pane-xs tab-pane-sm header-pane tabs-bar row">
      <ul class="nav nav-pills col-xs-12">
         <li class="active"><a href="#app_settings" data-toggle="tab">App Settings</a></li>
         <li><a href="#app_properties" data-toggle="tab">App Properties</a></li>
      </ul>
   </div>
   <div class="tab-pane-xs tab-pane-sm form-content tabs-bar no-footer tab-content row">

      <div id="app_settings" class="tab-pane active col-lg-8 col-md-6 col-xs-12" >
         <div class="box box-white">
            <h2><span class="header-label">App Settings</span><?php echo $app["name"] ?></h2>
            <!--<input type="hidden" name="appName" value="<?php echo $class ?>"/>-->
            <?php echo $config ?>
         </div>
      </div>

      <div id="app_properties" class="tab-pane col-lg-4 col-md-6 col-xs-12" >

         <div class="box box-white">
            <h2><?php echo $app["name"] ?></h2>
            <div class="row">                                    
               <div class="col-xs-8 mar-bot">
                  <h3>App Root</h3>
                  <label class="value" name="appDir" id="appDir"><?php echo $app["root"] ?></label>
               </div>
               <div class="col-xs-4 mar-bot">
                  <h3>Version</h3>
                  <label class="value" name="appDir" id="appDir"><?php echo $app["version"] ?></label>
               </div>
            </div>
            <div class="row">
               <div class="col-xs-12" >
                  <h3>Languages</h3>
               </div>       
            </div>
            <div class="row">
               <div class="col-xs-12" >
                  <ul class="list indent">
                     <?php
                     $app_root = $app["root"];
                     $app_langs = json_decode(EWCore::get_app_languages($app_root), true);

                     foreach ($app_langs as $key => $lang)
                     {
                        echo "<li><a rel='ajax' class='link' href='app=$app_root,lang=$key,form=lang-editor'>{$lang["name"]}</a></li>";
                     }
                     ?>
                  </ul>
               </div>       
            </div>

         </div>
      </div>
   </div>
</form>
<script>
   EW.createModal({hash: {key: "form", value: "lang-editor"}, onOpen: function () {
         EW.lock(this);
         var modal = this;
         var lang = EW.getHashParameter("lang");
         var app = EW.getHashParameter("app");

         $.post("<?php echo EW_ROOT_URL; ?>admin/api/Settings/lanuage-editor-form.php", {app: app, lang: lang}, function (data) {
            modal.html(data);
         });
      },
      onClose: function () {
         EW.setHashParameter("form", null);
         EW.setHashParameter("lang", null);
      }});
</script>