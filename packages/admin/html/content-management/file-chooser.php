<?php
$data = $_REQUEST["data"];

function custom_url_tab() {
  ob_start();
  include 'link-chooser/url-tab.php';
  return ob_get_clean();
}

/* function custom_widget_feeder_tab() {
  ob_start();
  include 'link-chooser/widget-feeder-tab.php';
  return ob_get_clean();
  } */

EWCore::register_form("ew/ui/components/link-chooser", "custom-url", [
    "title"   => "URL",
    "content" => custom_url_tab()
]);

$tabs = EWCore::read_registry("ew/ui/components/link-chooser");
?>
<div class="header-pane tabs-bar">
  <h1 id="form-title">
    tr{Link Chooser}
  </h1>  

  <ul class="nav nav-pills xs-nav-tabs">    
    <?php
    foreach ($tabs as $id => $tab) {
      if ($id == "content-chooser") {
        echo "<li class='active '><a href='#{$id}' data-toggle='tab'>{$tab["title"]}</a></li>";
      }
      else {
        echo "<li class=''><a href='#{$id}' data-toggle='tab'>{$tab["title"]}</a></li>";
      }
    }
    ?>
  </ul>
</div>
<form id="link-chooser"  action="#" method="POST">
  <div class="form-content tabs-bar no-footer">
    <div class="tab-content">
      <?php
      foreach ($tabs as $id => $tab) {
        if ($id == "content-chooser") {
          echo "<div class='tab-pane active' id='{$id}'>{$tab["content"]}</div>";
        }
        else {
          echo "<div class='tab-pane' id='{$id}'>{$tab["content"]}</div>";
        }
      }
      ?>
    </div>
  </div>
</form>

<script>
<?php
if ($data) {
  echo "EW.setFormData('#link-chooser',$data)";
}
?>
</script>
<!--<div class="footer-pane row actions-bar action-bar-items">
</div>-->