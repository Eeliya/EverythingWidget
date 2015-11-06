<?php ?>
<script >
   var UsersGroups = (function () {

      function UsersGroups()
      {
         var self = this;
         this.bNewGroup = EW.addAction("tr{New Group}", function () {
            EW.setHashParameter("groupId", null);
            EW.setHashParameter("form", "group");
         }).hide().comeIn(300);
         this.usersGroupsList();
         self.userGroupModal = EW.createModal({hash: {key: "form", value: "group"}, onOpen: function () {
               EW.lock(this);
               var groupId = EW.getHashParameter("groupId");
               $.post("<?php echo EW_ROOT_URL; ?>~admin/users-management/users-group-form.php", {groupId: groupId}, function (data) {
                  self.userGroupModal.html(data);
               });
            },
            onClose: function () {
               EW.setHashParameter("form", null);
               EW.setHashParameter("groupId", null);
            }});
      }

      UsersGroups.prototype.usersGroupsList = function ()
      {
         var self = this;
         if (this.table)
         {
            this.table.refresh();
            return;
         }
         this.table = EW.createTable({
            name: "users-groups-list",
            rowLabel: "{title}",
            columns: ["title", "description", "round_date_created"],
            headers: {
               "tr{Title}": {
               },
               "tr{Description}": {
               },
               "tr{Date Created}": {
               }
            },
            rowCount: true,
            url: "<?php echo EW_ROOT_URL; ?>~admin-api/users-management/groups",
            pageSize: 30,
            onDelete: function (id)
            {
               this.confirm("tr{Are you sure of deleting of this group?}", function ()
               {
                  //EW.lock($("#main-content"));
                  $.post('<?php echo EW_ROOT_URL; ?>~admin-api/users-management/delete-group', {id: id}, function (data)
                  {
                     UsersGroups.usersGroupsList();
                     $("body").EW().notify(data).show();
                     //EW.unlock($("#main-content"));
                  }, "json");
               });
            },
            onEdit: function (id)
            {
               EW.setHashParameter("groupId", id);
               EW.setHashParameter("form", "group");
            }
         });
         $("#main-content").html(this.table.container);
      };
      return new UsersGroups();
   })();



</script>