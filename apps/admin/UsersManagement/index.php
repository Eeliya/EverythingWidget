<?php session_start();
?>
<div id="sidebar" class="sidebar">

   <ul>  
      <li>   
         <a rel="ajax" data-ew-nav="users" href="<?php echo EW_ROOT_URL; ?>app-admin/UsersManagement/users.php">tr{Users}</a> 
      </li>     
      <li>      
         <a rel="ajax" data-ew-nav="users_groups" href="<?php echo EW_ROOT_URL; ?>app-admin/UsersManagement/users-groups.php">tr{Users Groups}</a>       
      </li>    
   </ul>   
</div>
<div id="main-content" class="" role="main"></div>
<script  type="text/javascript">
   function UserManagement()
   {
   }
   UserManagement.prototype.listUsers = function (query, pageNumber)
   {
      $.post("UsersManagement/UsersList.php", {cmd: "UsersList", query: query, pageNumber: pageNumber}, function (data)
      {
         $("#main-content").html(data);
      });
      //loadPage('UsersManagement/UsersList.php', 'UsersList', 'cmd=UsersList');          
   };
   var userManagement = new UserManagement();
   ////userManagement.listUsers();   
   $(document).ready(function ()
   {
      if (!EW.getHashParameter("nav"))
         EW.setHashParameter("nav", "users");
   });
</script>