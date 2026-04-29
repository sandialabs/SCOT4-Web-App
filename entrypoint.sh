#!/bin/sh
ROOT_DIR=/usr/local/apache2/htdocs
# Replace env vars in files served by httpd
for file in $ROOT_DIR/assets/*.js* $ROOT_DIR/index.html;
do
  sed -i 's|VITE_APP_API_BASE|'${VUE_APP_API_BASE}'|g' $file
done
httpd-foreground 
