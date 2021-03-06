<?php
session_start();

if (!isset($_SESSION['login'])) {
  include "Login.php";
  return;
}
?> 
<!DOCTYPE html>
<html>
  <head>
    <title>
      EW Admin
    </title>
    <?php include 'header.php'; ?>
  </head>
  <body id="base-pane" class="container <?= EWCore::get_language_dir($_REQUEST["_language"]); ?>" >
    <div id="app-content" >

      <div id="navigation-menu" class="navigation-menu">
        <div id="apps-menu" class="apps-menu" >
          <span id="app-title" class="apps-menu-title">tr{Apps}</span>
          <ul class="apps-menu-list">
            <li v-for="app in apps">
              <a class="apps-menu-link" data-app="{{app.id}}">
                <span>{{app.title}}</span>
              </a>
            </li>
          </ul>
        </div>
        <div id="sections-menu" class="sections-menu">
          <system-list id="sections-menu-list" class="sections-menu-list" action="a">
            <div class="sections-menu-item">
              <a class="sections-menu-item-link" href="{{id}}" >{{title}}</a>
            </div>
          </system-list>
        </div>
      </div>

      <div id="app-bar" class="app-bar">
        <div id="sections-menu-title" class="app-bar-title">
          tr{Documents}
        </div>
        <div class="action-center">
          <?php
          if ($_SESSION['login']) {
            echo '<a class="ExitBtn" href="~admin/api/users-management/logout?url=' . EW_DIR_URL . '~admin/" ></a>';
          }
          ?>
        </div>  

        <div class="action-pane" >
          <div id="action-bar-items" class="actions-bar action-bar-items" style="display:block;float:none;">
          </div>
        </div>
      </div>

      <div id="app-main-actions"></div>

      <system-float-menu id="main-float-menu" class="ew-float-menu">          
      </system-float-menu>

      <div id="home-pane" class="home-pane" >
      </div>
      <?php ?>
    </div>

    <div id="notifications-panel"></div>   

    <?php include 'footer.php'; ?>      
  </body>
</html>
