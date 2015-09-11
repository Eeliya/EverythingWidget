<?php
session_start();

function sidebar()
{
   ob_start();
   ?>
   <ul>  
      <li>   
         <a rel="ajax" data-default="true" data-ew-nav="users" href="<?php echo EW_ROOT_URL; ?>admin/UsersManagement/users.php">tr{Users}</a> 
      </li>     
      <li>      
         <a rel="ajax" data-ew-nav="users_groups" href="<?php echo EW_ROOT_URL; ?>admin/UsersManagement/users-groups.php">tr{Users Groups}</a>       
      </li>    
   </ul>   
   <?php
   return ob_get_clean();
}

function script()
{
   ob_start();
   ?>
   <script >
      (function () {
         var app =
                 {
                    init: function ()
                    {

                    },
                    listUsers: function (query, pageNumber)
                    {
                       $.post("UsersManagement/UsersList.php", {cmd: "UsersList", query: query, pageNumber: pageNumber}, function (data)
                       {
                          $("#main-content").html(data);
                       });
                    }
                 };
         System.module("UsersManagement", app);
      }());
   </script>
   <?php
   return ob_get_clean();
}

\EWCore::register_form("ew-section-main-form", "sidebar", ["content" => sidebar()]);
//EWCore::register_form("ew-section-main-form", "content", ["content" => content()]);
echo admin\AppsManagement::create_section_main_form(["script" => script()]);