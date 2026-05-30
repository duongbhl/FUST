# How to start NodeBB and the forum:
For the first time, we should use the second command with chown to run docker compose inside.

``` sh
cd NodeBB
sudo ./fix_nodebb_permissions.sh .        # create acme.json and restart compose
sudo ./fix_nodebb_permissions.sh . --chown  # also chown host folders and acme.json to invoking user
```
