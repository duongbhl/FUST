# How to start NodeBB and the forum:
``` sh
cd NodeBB
sudo ./fix_nodebb_permissions.sh .        # create acme.json and restart compose
sudo ./fix_nodebb_permissions.sh . --chown  # also chown host folders and acme.json to invoking user
```